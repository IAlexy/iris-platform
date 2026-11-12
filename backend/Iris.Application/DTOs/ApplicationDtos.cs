using Iris.Domain.Entities;
using Iris.Domain.Enums;

namespace Iris.Application.DTOs;

public record CreateCircleDto(
    string Name,
    string Description,
    string? CoverImageUrl,
    CirclePolicy? Policy
);

public record CircleSummaryDto(
    Guid Id,
    string Name,
    string Description,
    string? CoverImageUrl,
    string OwnerUserId,
    TrustTier TrustTier,
    int MemberCount,
    int PublicationCount,
    CirclePolicy Policy,
    DateTime CreatedAt
);

public record JoinCircleWithQrDto(
    Guid CircleId,
    string QrToken
);

public record CreatePublicationDto(
    Guid CircleId,
    Guid? AlbumId,
    string Caption,
    string? ExifCameraGear,
    bool IsHumanProofAttached,
    List<CreateMediaItemDto> MediaItems
);

public record CreateMediaItemDto(
    string OriginalFilename,
    string ContentType,
    int Width,
    int Height,
    int OrderIndex
);

public record SasUploadTargetDto(
    Guid MediaId,
    string OriginalFilename,
    string UploadSasUrl,
    string BlobPath
);

public record PublicationDto(
    Guid Id,
    Guid CircleId,
    Guid? AlbumId,
    string AuthorUserId,
    string AuthorDisplayName,
    string Caption,
    string? ExifCameraGear,
    bool IsHumanProofVerified,
    bool IsAiFlagged,
    string? OriginalSourceUrl,
    string? OriginalAuthorAttribution,
    DateTime CreatedAt,
    List<MediaAssetDto> MediaAssets,
    List<CritiquePinDto> CritiquePins
);

public record MediaAssetDto(
    Guid Id,
    string ReadSasUrl,
    string? BlurHash,
    int Width,
    int Height,
    int OrderIndex
);

public record CritiquePinDto(
    Guid Id,
    string AuthorUserId,
    string AuthorDisplayName,
    double XPercent,
    double YPercent,
    string Category,
    string Comment,
    DateTime CreatedAt
);

public record AddCritiquePinDto(
    double XPercent,
    double YPercent,
    string Category,
    string Comment
);

public record SocialImportRequestDto(
    Guid CircleId,
    Guid? AlbumId,
    string PostUrl
);
