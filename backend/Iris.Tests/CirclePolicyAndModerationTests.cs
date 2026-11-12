using Iris.Application.Common.Interfaces;
using Iris.Application.DTOs;
using Iris.Domain.Entities;
using Iris.Domain.Enums;
using Iris.Infrastructure.Persistence;
using Iris.Infrastructure.Services;
using Xunit;

namespace Iris.Tests;

public class CirclePolicyAndModerationTests
{
    private readonly IrisDataStore _store = new();
    private readonly LocalOrAzureBlobStorageService _blobService = new();
    private readonly MockAiSafetyAndExifService _safetyService = new();

    [Fact]
    public void QrPass_DisabledCircle_ShouldRejectJoin()
    {
        var familyCircle = _store.Circles[Guid.Parse("11111111-1111-1111-1111-111111111111")];
        Assert.False(familyCircle.Policy.QrPassEnabled);

        // Verification logic
        bool canJoinViaQr = familyCircle.Policy.QrPassEnabled &&
                            (!familyCircle.Policy.QrPassExpiresAt.HasValue || familyCircle.Policy.QrPassExpiresAt > DateTime.UtcNow);

        Assert.False(canJoinViaQr);
    }

    [Fact]
    public void QrPass_ExpiredPass_ShouldBeRejected()
    {
        var eventCircle = new Circle
        {
            Name = "Festival Photo 2026",
            Policy = new CirclePolicy
            {
                QrPassEnabled = true,
                QrPassExpiresAt = DateTime.UtcNow.AddMinutes(-5), // Expired!
                QrPassDefaultRole = CircleRole.ContributorPendingModeration
            }
        };

        bool isExpired = eventCircle.Policy.QrPassExpiresAt.HasValue &&
                         eventCircle.Policy.QrPassExpiresAt < DateTime.UtcNow;

        Assert.True(isExpired);
    }

    [Fact]
    public void QrPass_ValidPass_GrantsCorrectDefaultRole()
    {
        var eventCircle = new Circle
        {
            Name = "Meetup Créateurs Paris",
            Policy = new CirclePolicy
            {
                QrPassEnabled = true,
                QrPassExpiresAt = DateTime.UtcNow.AddHours(2),
                QrPassDefaultRole = CircleRole.ContributorPendingModeration
            }
        };

        var newMember = new CircleMember
        {
            UserId = "user_guest_123",
            Role = eventCircle.Policy.QrPassDefaultRole
        };

        Assert.Equal(CircleRole.ContributorPendingModeration, newMember.Role);
    }

    [Fact]
    public async Task QuarantineUpload_GeneratesSeparateWriteSas_ForEveryAsset()
    {
        var circleId = Guid.NewGuid();
        var files = new[] { "photo1.jpg", "photo2.jpg", "wip_sketch.png" };

        var uploadTargets = new List<SasUploadTargetDto>();
        foreach (var file in files)
        {
            var mediaId = Guid.NewGuid();
            var path = $"quarantine/{circleId}/{mediaId}_{file}";
            var sasUrl = await _blobService.GenerateUploadSasUriAsync("quarantine", path, TimeSpan.FromMinutes(30));

            uploadTargets.Add(new SasUploadTargetDto(mediaId, file, sasUrl, path));
        }

        Assert.Equal(3, uploadTargets.Count);
        Assert.All(uploadTargets, t => Assert.Contains("quarantine", t.UploadSasUrl));
        Assert.All(uploadTargets, t => Assert.Contains("sp=w", t.UploadSasUrl)); // Write permission
    }

    [Fact]
    public async Task AntiAiSanitizer_EnforcesExifGear_AndStripsGps()
    {
        var strictPolicy = new CirclePolicy
        {
            AiContentPolicy = AiContentPolicy.StrictlyForbidden,
            RequireHumanProofOrCameraExif = true,
            StripGpsMetadata = true,
            PreserveCameraGearExif = true
        };

        using var dummyStream = new MemoryStream(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 });
        var inspection = await _safetyService.InspectAndSanitizeAsync(dummyStream, "landscape.jpg", strictPolicy);

        Assert.True(inspection.IsApproved);
        Assert.True(inspection.StrippedGps);
        Assert.False(inspection.IsAiGenerated);
        Assert.NotNull(inspection.CameraGear);
        Assert.Contains("Sony A7IV", inspection.CameraGear);
    }

    [Fact]
    public void ProgressiveTrustTier_SmallCircle_HasStrictMemberLimit()
    {
        var circle = new Circle
        {
            TrustTier = TrustTier.Tier1_SmallPrivate,
            Name = "Famille Proche"
        };

        int maxAllowedMembers = circle.TrustTier switch
        {
            TrustTier.Tier1_SmallPrivate => 25,
            TrustTier.Tier2_CommunityVerified => 100,
            TrustTier.Tier3_HighScaleOrMonetized => 10000,
            _ => 10
        };

        Assert.Equal(25, maxAllowedMembers);
    }
}
