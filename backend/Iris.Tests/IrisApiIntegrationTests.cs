using System.Net;
using System.Net.Http.Json;
using Iris.Application.DTOs;
using Iris.Domain.Entities;
using Iris.Domain.Enums;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Iris.Tests;

public class IrisApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public IrisApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCircles_ReturnsSuccessAndList()
    {
        var response = await _client.GetAsync("/api/circles");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var circles = await response.Content.ReadFromJsonAsync<List<CircleSummaryDto>>();
        Assert.NotNull(circles);
        Assert.NotEmpty(circles);
    }

    [Fact]
    public async Task GetCircleById_ReturnsNotFound_WhenIdInvalid()
    {
        var response = await _client.GetAsync($"/api/circles/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetCircleById_ReturnsOk_WhenIdExists()
    {
        var artistId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var response = await _client.GetAsync($"/api/circles/{artistId}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var circle = await response.Content.ReadFromJsonAsync<Circle>();
        Assert.NotNull(circle);
        Assert.Equal(artistId, circle.Id);
    }

    [Fact]
    public async Task CreateCircle_ReturnsCreated_AndPersists()
    {
        var createDto = new CreateCircleDto(
            Name: "Club Photographes Nuit",
            Description: "Astrophotographie et pose longue.",
            CoverImageUrl: "https://images.unsplash.com/astro.jpg",
            Policy: new CirclePolicy { AiContentPolicy = AiContentPolicy.StrictlyForbidden }
        );

        var response = await _client.PostAsJsonAsync("/api/circles", createDto);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<Circle>();
        Assert.NotNull(created);
        Assert.Equal("Club Photographes Nuit", created.Name);
        Assert.NotEmpty(created.Members);
    }

    [Fact]
    public async Task JoinCircleQr_ReturnsError_WhenCircleNotFound()
    {
        var response = await _client.PostAsJsonAsync($"/api/circles/{Guid.NewGuid()}/join-qr", new JoinCircleWithQrDto(Guid.NewGuid(), "tok"));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task JoinCircleQr_ReturnsBadRequest_WhenQrDisabled()
    {
        var familyId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var response = await _client.PostAsJsonAsync($"/api/circles/{familyId}/join-qr", new JoinCircleWithQrDto(familyId, "tok"));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task JoinCircleQr_Success_WhenQrEnabled()
    {
        // Create circle with QR enabled
        var createDto = new CreateCircleDto(
            Name: "Festival Photo QR",
            Description: "Event Pass",
            CoverImageUrl: null,
            Policy: new CirclePolicy { QrPassEnabled = true, QrPassExpiresAt = DateTime.UtcNow.AddDays(1) }
        );
        var createRes = await _client.PostAsJsonAsync("/api/circles", createDto);
        var created = await createRes.Content.ReadFromJsonAsync<Circle>();

        var response = await _client.PostAsJsonAsync($"/api/circles/{created!.Id}/join-qr", new JoinCircleWithQrDto(created.Id, "tok"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetCircleFeed_ReturnsNotFound_WhenCircleDoesNotExist()
    {
        var response = await _client.GetAsync($"/api/circles/{Guid.NewGuid()}/feed");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetCircleFeed_ReturnsOk_WithPublicationsAndSasUrls()
    {
        var artistId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var response = await _client.GetAsync($"/api/circles/{artistId}/feed");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var feed = await response.Content.ReadFromJsonAsync<List<PublicationDto>>();
        Assert.NotNull(feed);
        Assert.NotEmpty(feed);
        Assert.All(feed, p => Assert.NotNull(p.AuthorDisplayName));
    }

    [Fact]
    public async Task PrepareUpload_ReturnsNotFound_WhenCircleDoesNotExist()
    {
        var dto = new CreatePublicationDto(
            CircleId: Guid.NewGuid(),
            AlbumId: null,
            Caption: "Test",
            ExifCameraGear: null,
            IsHumanProofAttached: false,
            MediaItems: new()
        );

        var response = await _client.PostAsJsonAsync("/api/publications/prepare-upload", dto);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PrepareUpload_ReturnsSasTargets_WhenCircleExists()
    {
        var artistId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var dto = new CreatePublicationDto(
            CircleId: artistId,
            AlbumId: null,
            Caption: "Nouvelle photo",
            ExifCameraGear: "Sony A7IV",
            IsHumanProofAttached: true,
            MediaItems: new()
            {
                new CreateMediaItemDto("test1.jpg", "image/jpeg", 1920, 1080, 0),
                new CreateMediaItemDto("test2.jpg", "image/jpeg", 1920, 1080, 1)
            }
        );

        var response = await _client.PostAsJsonAsync("/api/publications/prepare-upload", dto);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AddCritiquePin_ReturnsNotFound_WhenPublicationNotFound()
    {
        var response = await _client.PostAsJsonAsync($"/api/publications/{Guid.NewGuid()}/critique-pins", new AddCritiquePinDto(10, 20, "Composition", "Comment"));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AddCritiquePin_ReturnsCreated_WhenPublicationExists()
    {
        var artistId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var feedRes = await _client.GetAsync($"/api/circles/{artistId}/feed");
        var feed = await feedRes.Content.ReadFromJsonAsync<List<PublicationDto>>();
        var pubId = feed!.First().Id;

        var pinDto = new AddCritiquePinDto(55.5, 42.1, "Color/Light", "Superbe tonalité");
        var response = await _client.PostAsJsonAsync($"/api/publications/{pubId}/critique-pins", pinDto);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var createdPin = await response.Content.ReadFromJsonAsync<CritiquePin>();
        Assert.NotNull(createdPin);
        Assert.Equal("Color/Light", createdPin.Category);
        Assert.Equal(55.5, createdPin.XPercent);
    }

    [Fact]
    public async Task SocialImport_ReturnsNotFound_WhenCircleNotFound()
    {
        var req = new SocialImportRequestDto(Guid.NewGuid(), null, "https://instagram.com/p/123");
        var response = await _client.PostAsJsonAsync("/api/social-import", req);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task SocialImport_ReturnsCreated_AndExtractsMedia()
    {
        var artistId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var req = new SocialImportRequestDto(artistId, null, "https://instagram.com/p/DB12345678/");

        var response = await _client.PostAsJsonAsync("/api/social-import", req);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var pub = await response.Content.ReadFromJsonAsync<Publication>();
        Assert.NotNull(pub);
        Assert.Equal(SocialPlatform.Instagram, pub.ImportedFromPlatform);
        Assert.NotEmpty(pub.MediaAssets);
    }
}
