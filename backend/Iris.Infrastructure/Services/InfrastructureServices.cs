using System.Text.RegularExpressions;
using Iris.Application.Common.Interfaces;
using Iris.Domain.Entities;
using Iris.Domain.Enums;

namespace Iris.Infrastructure.Services;

public class LocalOrAzureBlobStorageService : IBlobStorageService
{
    private readonly Dictionary<string, byte[]> _inMemoryStore = new();
    private readonly string _storageBaseUrl = "https://iriscircles.blob.core.windows.net";

    public Task<string> GenerateUploadSasUriAsync(string containerName, string blobName, TimeSpan expiry)
    {
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');
        var expires = DateTimeOffset.UtcNow.Add(expiry).ToUnixTimeSeconds();
        return Task.FromResult($"{_storageBaseUrl}/{containerName}/{blobName}?sv=2023-11-03&se={expires}&sp=w&sig={token}");
    }

    public Task<string> GenerateReadSasUriAsync(string containerName, string blobName, TimeSpan expiry)
    {
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');
        var expires = DateTimeOffset.UtcNow.Add(expiry).ToUnixTimeSeconds();
        return Task.FromResult($"{_storageBaseUrl}/{containerName}/{blobName}?sv=2023-11-03&se={expires}&sp=r&sig={token}");
    }

    public Task MoveBlobAsync(string sourceContainer, string sourceBlob, string destContainer, string destBlob)
    {
        var sourceKey = $"{sourceContainer}/{sourceBlob}";
        var destKey = $"{destContainer}/{destBlob}";

        if (_inMemoryStore.TryGetValue(sourceKey, out var data))
        {
            _inMemoryStore[destKey] = data;
            _inMemoryStore.Remove(sourceKey);
        }
        return Task.CompletedTask;
    }

    public Task DeleteBlobAsync(string containerName, string blobName)
    {
        _inMemoryStore.Remove($"{containerName}/{blobName}");
        return Task.CompletedTask;
    }

    public Task<Stream> OpenReadStreamAsync(string containerName, string blobName)
    {
        var key = $"{containerName}/{blobName}";
        if (_inMemoryStore.TryGetValue(key, out var data))
        {
            return Task.FromResult<Stream>(new MemoryStream(data));
        }
        return Task.FromResult<Stream>(new MemoryStream());
    }

    public Task UploadStreamAsync(string containerName, string blobName, Stream content, string contentType)
    {
        using var ms = new MemoryStream();
        content.CopyTo(ms);
        _inMemoryStore[$"{containerName}/{blobName}"] = ms.ToArray();
        return Task.CompletedTask;
    }
}

public class MockAiSafetyAndExifService : IAiSafetyAndExifService
{
    public Task<ContentInspectionResult> InspectAndSanitizeAsync(Stream imageStream, string filename, CirclePolicy policy)
    {
        var result = new ContentInspectionResult
        {
            IsApproved = true,
            StrippedGps = policy.StripGpsMetadata,
            IsAiGenerated = false,
            AiScore = 0.05
        };

        // If circle enforces anti-AI policy:
        if (policy.AiContentPolicy == AiContentPolicy.StrictlyForbidden)
        {
            // Simulate EXIF gear detection
            result.CameraGear = policy.PreserveCameraGearExif 
                ? "Sony A7IV • FE 35mm F1.4 GM • ISO 100 • 1/500s"
                : null;
        }

        return Task.FromResult(result);
    }
}

public class SocialMediaImporterService : ISocialMediaImporterService
{
    public SocialPlatform DetectPlatform(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return SocialPlatform.DirectUrl;

        var lower = url.ToLowerInvariant();
        if (lower.Contains("instagram.com")) return SocialPlatform.Instagram;
        if (lower.Contains("cara.app")) return SocialPlatform.Cara;
        if (lower.Contains("twitter.com") || lower.Contains("x.com")) return SocialPlatform.X;
        if (lower.Contains("threads.net")) return SocialPlatform.Threads;
        if (lower.Contains("reddit.com") || lower.Contains("redd.it")) return SocialPlatform.Reddit;

        return SocialPlatform.DirectUrl;
    }

    public Task<ExtractedSocialPost> FetchPostDataAsync(string url)
    {
        var platform = DetectPlatform(url);
        var post = new ExtractedSocialPost
        {
            Platform = platform,
            SourceUrl = url,
            AuthorUsername = "artist_creatives",
            Caption = $"Imported visual memory from {platform}. Originally published via {url}"
        };

        // Pattern matching mock/clean fallback extractor
        if (platform == SocialPlatform.Instagram)
        {
            var match = Regex.Match(url, @"instagram\.com/(?:p|reel)/([A-Za-z0-9_-]+)");
            var shortcode = match.Success ? match.Groups[1].Value : "sample";
            post.AuthorUsername = "creator_insta";
            post.Caption = "Mountain golden hour study #photography #nature";
            post.MediaItems.Add(new ExtractedMediaItem
            {
                MediaUrl = $"https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80",
                Width = 1600,
                Height = 1067
            });
        }
        else if (platform == SocialPlatform.Cara)
        {
            post.AuthorUsername = "digital_painter";
            post.Caption = "Character concept sketch - human made painting";
            post.MediaItems.Add(new ExtractedMediaItem
            {
                MediaUrl = $"https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&q=80",
                Width = 1600,
                Height = 1200
            });
        }
        else
        {
            post.MediaItems.Add(new ExtractedMediaItem
            {
                MediaUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
                Width = 1600,
                Height = 1066
            });
        }

        return Task.FromResult(post);
    }
}
