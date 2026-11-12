using Iris.Domain.Enums;

namespace Iris.Domain.Entities;

public class Publication
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CircleId { get; set; }
    public Guid? AlbumId { get; set; }
    public string AuthorUserId { get; set; } = string.Empty;
    public string AuthorDisplayName { get; set; } = string.Empty;
    public string Caption { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public MediaProcessingStatus Status { get; set; } = MediaProcessingStatus.Approved;

    // Authenticity & Anti-AI proof
    public string? ExifCameraGear { get; set; } // e.g. "Sony A7IV • 35mm f/1.4 • ISO 100"
    public bool IsHumanProofVerified { get; set; } = false;
    public bool IsAiFlagged { get; set; } = false;
    public string? AiAuditNotes { get; set; }

    // External Provenance (e.g., imported from Instagram / Cara / X)
    public SocialPlatform? ImportedFromPlatform { get; set; }
    public string? OriginalSourceUrl { get; set; }
    public string? OriginalAuthorAttribution { get; set; }

    // Child relations
    public List<MediaAsset> MediaAssets { get; set; } = new();
    public List<CritiquePin> CritiquePins { get; set; } = new();
}

public class MediaAsset
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PublicationId { get; set; }
    public string BlobPath { get; set; } = string.Empty;
    public string StorageContainer { get; set; } = "private-circles"; // "quarantine" | "private-circles" | "blurred-teasers"
    public string? BlurHash { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string ContentType { get; set; } = "image/jpeg";
    public int OrderIndex { get; set; } = 0;
    public string OriginalFilename { get; set; } = string.Empty;
}

public class CritiquePin
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PublicationId { get; set; }
    public string AuthorUserId { get; set; } = string.Empty;
    public string AuthorDisplayName { get; set; } = string.Empty;
    public double XPercent { get; set; } // 0.0 to 100.0% of image width
    public double YPercent { get; set; } // 0.0 to 100.0% of image height
    public string Category { get; set; } = "Composition"; // "Composition" | "Color/Light" | "Technique"
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class SocialImportJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CircleId { get; set; }
    public Guid? AlbumId { get; set; }
    public string RequestedByUserId { get; set; } = string.Empty;
    public SocialPlatform SourcePlatform { get; set; }
    public string SourceUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // "Pending" | "Downloading" | "Completed" | "Failed"
    public int ExtractedMediaCount { get; set; } = 0;
    public string? ResultPublicationId { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
