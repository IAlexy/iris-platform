using Iris.Application.Common.Interfaces;
using Iris.Application.DTOs;
using Iris.Domain.Entities;
using Iris.Domain.Enums;
using Iris.Infrastructure.Persistence;
using Iris.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Register Core Services & Datastore
builder.Services.AddSingleton<IrisDataStore>();
builder.Services.AddSingleton<IBlobStorageService, LocalOrAzureBlobStorageService>();
builder.Services.AddSingleton<IAiSafetyAndExifService, MockAiSafetyAndExifService>();
builder.Services.AddSingleton<ISocialMediaImporterService, SocialMediaImporterService>();

// CORS for React / Vue / Mobile Expo clients
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Iris Private Circles API", Version = "v1", Description = "API pour plateforme de cercles visuels privés, protection anti-IA et importation sociale." });
});

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ==========================================
// 1. CIRCLES ENDPOINTS
// ==========================================

// GET /api/circles
app.MapGet("/api/circles", (IrisDataStore store) =>
{
    var summaries = store.Circles.Values.Select(c => new CircleSummaryDto(
        c.Id,
        c.Name,
        c.Description,
        c.CoverImageUrl,
        c.OwnerUserId,
        c.TrustTier,
        c.Members.Count,
        c.Publications.Count,
        c.Policy,
        c.CreatedAt
    ));
    return Results.Ok(summaries);
})
.WithName("ListCircles")
.WithOpenApi();

// GET /api/circles/{id}
app.MapGet("/api/circles/{id:guid}", (Guid id, IrisDataStore store) =>
{
    if (!store.Circles.TryGetValue(id, out var circle))
        return Results.NotFound(new { message = "Circle not found" });

    return Results.Ok(circle);
})
.WithName("GetCircleById")
.WithOpenApi();

// POST /api/circles
app.MapPost("/api/circles", ([FromBody] CreateCircleDto dto, IrisDataStore store) =>
{
    var circle = new Circle
    {
        Id = Guid.NewGuid(),
        Name = dto.Name,
        Description = dto.Description,
        CoverImageUrl = dto.CoverImageUrl,
        OwnerUserId = "user_current",
        Policy = dto.Policy ?? new CirclePolicy(),
        TrustTier = TrustTier.Tier1_SmallPrivate
    };

    circle.Members.Add(new CircleMember
    {
        UserId = "user_current",
        DisplayName = "Moi",
        Role = CircleRole.Owner,
        IsVerifiedHuman = true
    });

    store.Circles[circle.Id] = circle;

    return Results.Created($"/api/circles/{circle.Id}", circle);
})
.WithName("CreateCircle")
.WithOpenApi();

// POST /api/circles/{id}/join-qr
app.MapPost("/api/circles/{id:guid}/join-qr", (Guid id, [FromBody] JoinCircleWithQrDto dto, IrisDataStore store) =>
{
    if (!store.Circles.TryGetValue(id, out var circle))
        return Results.NotFound(new { message = "Circle not found" });

    if (!circle.Policy.QrPassEnabled)
        return Results.BadRequest(new { message = "QR pass is not enabled for this circle" });

    if (circle.Policy.QrPassExpiresAt.HasValue && circle.Policy.QrPassExpiresAt < DateTime.UtcNow)
        return Results.BadRequest(new { message = "QR pass has expired" });

    var newMember = new CircleMember
    {
        UserId = "user_guest_" + Guid.NewGuid().ToString("N")[..6],
        DisplayName = "Invité QR",
        Role = circle.Policy.QrPassDefaultRole,
        JoinedAt = DateTime.UtcNow
    };

    circle.Members.Add(newMember);

    return Results.Ok(new { message = "Joined circle successfully", member = newMember });
})
.WithName("JoinCircleQr")
.WithOpenApi();

// ==========================================
// 2. PUBLICATIONS & FEED ENDPOINTS
// ==========================================

// GET /api/circles/{id}/feed
app.MapGet("/api/circles/{id:guid}/feed", async (Guid id, IrisDataStore store, IBlobStorageService blobService) =>
{
    if (!store.Circles.TryGetValue(id, out var circle))
        return Results.NotFound(new { message = "Circle not found" });

    var pubs = store.Publications.Values
        .Where(p => p.CircleId == id && p.Status == MediaProcessingStatus.Approved)
        .OrderByDescending(p => p.CreatedAt)
        .ToList();

    var pubDtos = new List<PublicationDto>();

    foreach (var p in pubs)
    {
        var mediaDtos = new List<MediaAssetDto>();
        foreach (var m in p.MediaAssets)
        {
            var sasUrl = await blobService.GenerateReadSasUriAsync(m.StorageContainer, m.BlobPath, TimeSpan.FromMinutes(15));
            mediaDtos.Add(new MediaAssetDto(m.Id, sasUrl, m.BlurHash, m.Width, m.Height, m.OrderIndex));
        }

        var pins = p.CritiquePins.Select(cp => new CritiquePinDto(
            cp.Id, cp.AuthorUserId, cp.AuthorDisplayName, cp.XPercent, cp.YPercent, cp.Category, cp.Comment, cp.CreatedAt
        )).ToList();

        pubDtos.Add(new PublicationDto(
            p.Id, p.CircleId, p.AlbumId, p.AuthorUserId, p.AuthorDisplayName, p.Caption,
            p.ExifCameraGear, p.IsHumanProofVerified, p.IsAiFlagged, p.OriginalSourceUrl,
            p.OriginalAuthorAttribution, p.CreatedAt, mediaDtos, pins
        ));
    }

    return Results.Ok(pubDtos);
})
.WithName("GetCircleFeed")
.WithOpenApi();

// POST /api/publications/prepare-upload
app.MapPost("/api/publications/prepare-upload", async ([FromBody] CreatePublicationDto dto, IrisDataStore store, IBlobStorageService blobService) =>
{
    if (!store.Circles.TryGetValue(dto.CircleId, out var circle))
        return Results.NotFound(new { message = "Circle not found" });

    var targets = new List<SasUploadTargetDto>();

    foreach (var media in dto.MediaItems)
    {
        var mediaId = Guid.NewGuid();
        var blobPath = $"quarantine/{dto.CircleId}/{mediaId}_{media.OriginalFilename}";
        var sasUrl = await blobService.GenerateUploadSasUriAsync("quarantine", blobPath, TimeSpan.FromMinutes(30));

        targets.Add(new SasUploadTargetDto(mediaId, media.OriginalFilename, sasUrl, blobPath));
    }

    return Results.Ok(new { uploadTargets = targets });
})
.WithName("PreparePublicationUpload")
.WithOpenApi();

// POST /api/publications/{id}/critique-pins
app.MapPost("/api/publications/{id:guid}/critique-pins", (Guid id, [FromBody] AddCritiquePinDto dto, IrisDataStore store) =>
{
    if (!store.Publications.TryGetValue(id, out var publication))
        return Results.NotFound(new { message = "Publication not found" });

    var pin = new CritiquePin
    {
        PublicationId = id,
        AuthorUserId = "user_reviewer",
        AuthorDisplayName = "Critique Invité",
        Category = dto.Category,
        Comment = dto.Comment,
        XPercent = dto.XPercent,
        YPercent = dto.YPercent
    };

    publication.CritiquePins.Add(pin);

    return Results.Created($"/api/publications/{id}/critique-pins/{pin.Id}", pin);
})
.WithName("AddCritiquePin")
.WithOpenApi();

// ==========================================
// 3. SOCIAL MEDIA IMPORT / EXPORT
// ==========================================

// POST /api/social-import
app.MapPost("/api/social-import", async (
    [FromBody] SocialImportRequestDto dto,
    IrisDataStore store,
    ISocialMediaImporterService importer,
    IAiSafetyAndExifService safetyService) =>
{
    if (!store.Circles.TryGetValue(dto.CircleId, out var circle))
        return Results.NotFound(new { message = "Circle not found" });

    var extracted = await importer.FetchPostDataAsync(dto.PostUrl);

    // Create publication directly in circle
    var publication = new Publication
    {
        Id = Guid.NewGuid(),
        CircleId = dto.CircleId,
        AlbumId = dto.AlbumId,
        AuthorUserId = "user_current",
        AuthorDisplayName = "Alexy D.",
        Caption = extracted.Caption,
        ImportedFromPlatform = extracted.Platform,
        OriginalSourceUrl = dto.PostUrl,
        OriginalAuthorAttribution = $"Importé depuis @{extracted.AuthorUsername} ({extracted.Platform})",
        CreatedAt = DateTime.UtcNow,
        Status = MediaProcessingStatus.Approved
    };

    int index = 0;
    foreach (var item in extracted.MediaItems)
    {
        publication.MediaAssets.Add(new MediaAsset
        {
            PublicationId = publication.Id,
            BlobPath = $"imported/{publication.Id}_{index}.jpg",
            StorageContainer = "private-circles",
            BlurHash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
            Width = item.Width,
            Height = item.Height,
            OrderIndex = index++,
            OriginalFilename = $"import_{extracted.Platform}_{index}.jpg"
        });
    }

    store.Publications[publication.Id] = publication;
    circle.Publications.Add(publication);

    return Results.Created($"/api/circles/{dto.CircleId}/feed", publication);
})
.WithName("ImportFromSocialNetwork")
.WithOpenApi();

app.Run();
