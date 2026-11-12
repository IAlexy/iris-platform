using Iris.Domain.Entities;
using Iris.Domain.Enums;

namespace Iris.Application.Common.Interfaces;

public interface IBlobStorageService
{
    Task<string> GenerateUploadSasUriAsync(string containerName, string blobName, TimeSpan expiry);
    Task<string> GenerateReadSasUriAsync(string containerName, string blobName, TimeSpan expiry);
    Task MoveBlobAsync(string sourceContainer, string sourceBlob, string destContainer, string destBlob);
    Task DeleteBlobAsync(string containerName, string blobName);
    Task<Stream> OpenReadStreamAsync(string containerName, string blobName);
    Task UploadStreamAsync(string containerName, string blobName, Stream content, string contentType);
}

public class ContentInspectionResult
{
    public bool IsApproved { get; set; } = true;
    public bool IsFlaggedIllegal { get; set; } = false;
    public bool IsAiGenerated { get; set; } = false;
    public double AiScore { get; set; } = 0.0;
    public string? CameraGear { get; set; } // e.g. "Sony A7IV • 35mm f/1.4"
    public bool StrippedGps { get; set; } = false;
    public string? Reason { get; set; }
}

public interface IAiSafetyAndExifService
{
    Task<ContentInspectionResult> InspectAndSanitizeAsync(Stream imageStream, string filename, CirclePolicy policy);
}

public class ExtractedSocialPost
{
    public SocialPlatform Platform { get; set; }
    public string SourceUrl { get; set; } = string.Empty;
    public string AuthorUsername { get; set; } = string.Empty;
    public string Caption { get; set; } = string.Empty;
    public List<ExtractedMediaItem> MediaItems { get; set; } = new();
}

public class ExtractedMediaItem
{
    public string MediaUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = "image/jpeg";
    public int Width { get; set; }
    public int Height { get; set; }
}

public interface ISocialMediaImporterService
{
    SocialPlatform DetectPlatform(string url);
    Task<ExtractedSocialPost> FetchPostDataAsync(string url);
}
