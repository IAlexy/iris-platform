using System.Collections.Concurrent;
using Iris.Domain.Entities;
using Iris.Domain.Enums;

namespace Iris.Infrastructure.Persistence;

public class IrisDataStore
{
    public ConcurrentDictionary<Guid, Circle> Circles { get; } = new();
    public ConcurrentDictionary<Guid, Publication> Publications { get; } = new();
    public ConcurrentDictionary<Guid, SocialImportJob> ImportJobs { get; } = new();

    public IrisDataStore()
    {
        SeedSampleData();
    }

    private void SeedSampleData()
    {
        // 1. Cercle Famille / Amis
        var familyCircle = new Circle
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Famille & Vacances 2026",
            Description = "Photos privées de nos retrouvailles et vacances d'été. Zéro pub, souvenirs protégés.",
            CoverImageUrl = "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80",
            OwnerUserId = "user_alexy",
            TrustTier = TrustTier.Tier1_SmallPrivate,
            Policy = new CirclePolicy
            {
                JoinMode = CircleJoinMode.InviteLinkOnly,
                AiContentPolicy = AiContentPolicy.Allowed,
                StripGpsMetadata = true,
                PreserveCameraGearExif = false
            }
        };
        familyCircle.Members.Add(new CircleMember
        {
            UserId = "user_alexy",
            DisplayName = "Alexy",
            Role = CircleRole.Owner
        });
        Circles[familyCircle.Id] = familyCircle;

        // 2. Atelier d'Artistes (Sanctuaire Anti-IA)
        var artistCircle = new Circle
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Atelier Photographes & Peintres Alpins",
            Description = "Sanctuaire 100% créateurs humains. Vérification EXIF boîtier et WIP calques obligatoire.",
            CoverImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
            OwnerUserId = "user_alexy",
            TrustTier = TrustTier.Tier2_CommunityVerified,
            Policy = new CirclePolicy
            {
                JoinMode = CircleJoinMode.PeerReviewedApplication,
                AiContentPolicy = AiContentPolicy.StrictlyForbidden,
                RequireHumanProofOrCameraExif = true,
                PreserveCameraGearExif = true,
                StripGpsMetadata = true,
                EnableArtCritiquePins = true
            }
        };
        artistCircle.Members.Add(new CircleMember
        {
            UserId = "user_alexy",
            DisplayName = "Alexy",
            Role = CircleRole.Owner,
            IsVerifiedHuman = true
        });
        Circles[artistCircle.Id] = artistCircle;

        // Publication exemple dans le cercle artiste avec pin critique
        var artPub = new Publication
        {
            Id = Guid.NewGuid(),
            CircleId = artistCircle.Id,
            AuthorUserId = "user_alexy",
            AuthorDisplayName = "Alexy D.",
            Caption = "Coucher de soleil sur les crêtes du massif des Bauges. Pause de 15s avec filtre ND.",
            CreatedAt = DateTime.UtcNow.AddHours(-2),
            ExifCameraGear = "Sony A7IV • FE 24-70mm F2.8 GM II • 24mm • f/8 • 15s • ISO 100",
            IsHumanProofVerified = true,
            IsAiFlagged = false
        };
        artPub.MediaAssets.Add(new MediaAsset
        {
            PublicationId = artPub.Id,
            BlobPath = "circles/22222222-2222-2222-2222-222222222222/bauges_sunset.jpg",
            StorageContainer = "private-circles",
            BlurHash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
            Width = 2400,
            Height = 1600,
            OriginalFilename = "bauges_sunset.jpg"
        });
        artPub.CritiquePins.Add(new CritiquePin
        {
            PublicationId = artPub.Id,
            AuthorUserId = "user_camille",
            AuthorDisplayName = "Camille (Photographe)",
            Category = "Color/Light",
            XPercent = 65.4,
            YPercent = 42.1,
            Comment = "Superbe transition des teintes dorées vers le pourpre dans le ciel ! Le gradient est très naturel."
        });
        Publications[artPub.Id] = artPub;
        artistCircle.Publications.Add(artPub);
    }
}
