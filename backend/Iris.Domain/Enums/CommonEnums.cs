namespace Iris.Domain.Enums;

public enum CircleJoinMode
{
    InviteLinkOnly,
    QrPass,
    PeerReviewedApplication,
    PublicDiscovery
}

public enum AiContentPolicy
{
    Allowed,
    MustBeLabeled,
    StrictlyForbidden
}

public enum CircleRole
{
    Owner,
    Moderator,
    Contributor,
    ContributorPendingModeration,
    Viewer
}

public enum TrustTier
{
    Tier1_SmallPrivate,
    Tier2_CommunityVerified,
    Tier3_HighScaleOrMonetized
}

public enum MediaProcessingStatus
{
    PendingQuarantine,
    ProcessingAiAndExif,
    Approved,
    FlaggedIllegalHold,
    Rejected
}

public enum SocialPlatform
{
    Instagram,
    Cara,
    X,
    Threads,
    Reddit,
    DirectUrl
}
