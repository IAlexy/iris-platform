using Iris.Domain.Enums;

namespace Iris.Domain.Entities;

public class CirclePolicy
{
    public CircleJoinMode JoinMode { get; set; } = CircleJoinMode.InviteLinkOnly;
    public int ApplicationRequiredPhotos { get; set; } = 3;
    public int ApplicationApprovalQuorum { get; set; } = 3;

    // QR Pass Settings (e.g. for events/meetups)
    public bool QrPassEnabled { get; set; } = false;
    public CircleRole QrPassDefaultRole { get; set; } = CircleRole.Viewer;
    public DateTime? QrPassExpiresAt { get; set; }

    // Anti-AI & Artist Authenticity Settings
    public AiContentPolicy AiContentPolicy { get; set; } = AiContentPolicy.StrictlyForbidden;
    public bool RequireHumanProofOrCameraExif { get; set; } = true;
    public bool StripGpsMetadata { get; set; } = true;
    public bool PreserveCameraGearExif { get; set; } = true;
    public bool EnableArtCritiquePins { get; set; } = true;

    // SaaS & Monetization Quotas
    public string MonetizationMode { get; set; } = "FreeOrQuota"; // "FreeOrQuota" | "PayPerPost" | "Subscription"
    public int MaxFreePhotos { get; set; } = 100;
}
