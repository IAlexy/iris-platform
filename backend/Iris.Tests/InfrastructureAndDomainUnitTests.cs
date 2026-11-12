using System.Text;
using Iris.Application.Common.Interfaces;
using Iris.Application.DTOs;
using Iris.Domain.Entities;
using Iris.Domain.Enums;
using Iris.Infrastructure.Persistence;
using Iris.Infrastructure.Services;
using Xunit;

namespace Iris.Tests;

public class InfrastructureAndDomainUnitTests
{
    [Fact]
    public async Task BlobStorage_UploadReadMoveDelete_Lifecycle()
    {
        var service = new LocalOrAzureBlobStorageService();
        var content = "Hello Iris Private Storage";
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));

        // 1. Upload
        await service.UploadStreamAsync("quarantine", "test-img.jpg", stream, "image/jpeg");

        // 2. Read
        using var readStream = await service.OpenReadStreamAsync("quarantine", "test-img.jpg");
        using var reader = new StreamReader(readStream);
        var readContent = await reader.ReadToEndAsync();
        Assert.Equal(content, readContent);

        // 3. Move
        await service.MoveBlobAsync("quarantine", "test-img.jpg", "private-circles", "moved-img.jpg");

        // 4. Read moved
        using var movedStream = await service.OpenReadStreamAsync("private-circles", "moved-img.jpg");
        using var movedReader = new StreamReader(movedStream);
        Assert.Equal(content, await movedReader.ReadToEndAsync());

        // 5. Delete
        await service.DeleteBlobAsync("private-circles", "moved-img.jpg");
        using var deletedStream = await service.OpenReadStreamAsync("private-circles", "moved-img.jpg");
        Assert.Equal(0, deletedStream.Length);
    }

    [Fact]
    public async Task SocialImporter_HandlesCara_Threads_AndDirectUrl()
    {
        var importer = new SocialMediaImporterService();

        // Threads
        var threadsPlatform = importer.DetectPlatform("https://www.threads.net/@user/post/xyz");
        Assert.Equal(SocialPlatform.Threads, threadsPlatform);

        // Cara
        var caraPost = await importer.FetchPostDataAsync("https://cara.app/post/digital-concept");
        Assert.Equal(SocialPlatform.Cara, caraPost.Platform);
        Assert.Equal("digital_painter", caraPost.AuthorUsername);
        Assert.NotEmpty(caraPost.MediaItems);

        // Direct Url / Unknown
        var genericPost = await importer.FetchPostDataAsync("https://example.com/photo.jpg");
        Assert.Equal(SocialPlatform.DirectUrl, genericPost.Platform);
        Assert.NotEmpty(genericPost.MediaItems);
    }

    [Fact]
    public async Task AiSafety_AllowsAll_WhenPolicyIsAllowed()
    {
        var service = new MockAiSafetyAndExifService();
        var policy = new CirclePolicy
        {
            AiContentPolicy = AiContentPolicy.Allowed,
            StripGpsMetadata = false,
            PreserveCameraGearExif = false
        };

        using var ms = new MemoryStream();
        var result = await service.InspectAndSanitizeAsync(ms, "test.png", policy);

        Assert.True(result.IsApproved);
        Assert.False(result.StrippedGps);
        Assert.Null(result.CameraGear);
    }

    [Fact]
    public void DomainEntities_AndDtos_InstantiateAndRetainProperties()
    {
        // Album
        var album = new Album
        {
            Title = "Vacances d'hiver",
            Description = "Ski et paysages",
            CreatedByUserId = "user1"
        };
        Assert.Equal("Vacances d'hiver", album.Title);
        Assert.Empty(album.Publications);

        // SocialImportJob
        var job = new SocialImportJob
        {
            CircleId = Guid.NewGuid(),
            AlbumId = album.Id,
            SourcePlatform = SocialPlatform.Cara,
            SourceUrl = "https://cara.app/post/123",
            Status = "Completed",
            ExtractedMediaCount = 2,
            CompletedAt = DateTime.UtcNow
        };
        Assert.Equal("Completed", job.Status);
        Assert.Equal(2, job.ExtractedMediaCount);

        // CircleMember
        var member = new CircleMember
        {
            UserId = "user2",
            DisplayName = "Camille",
            AvatarUrl = "https://avatar.com/camille.jpg",
            Role = CircleRole.Moderator,
            IsVerifiedHuman = true
        };
        Assert.Equal("Camille", member.DisplayName);
        Assert.Equal("https://avatar.com/camille.jpg", member.AvatarUrl);

        // MediaAsset
        var asset = new MediaAsset
        {
            BlobPath = "path/1.jpg",
            StorageContainer = "private",
            BlurHash = "L6PZfS",
            Width = 1920,
            Height = 1080,
            ContentType = "image/jpeg",
            OrderIndex = 1,
            OriginalFilename = "1.jpg"
        };
        Assert.Equal(1920, asset.Width);
        Assert.Equal("L6PZfS", asset.BlurHash);

        // Publication with audit notes
        var pub = new Publication
        {
            Caption = "Test",
            AiAuditNotes = "Clean scan C2PA",
            IsAiFlagged = false
        };
        Assert.Equal("Clean scan C2PA", pub.AiAuditNotes);
    }
}
