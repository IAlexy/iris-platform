using Iris.Domain.Enums;

namespace Iris.Domain.Entities;

public class Circle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string OwnerUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public TrustTier TrustTier { get; set; } = TrustTier.Tier1_SmallPrivate;
    public CirclePolicy Policy { get; set; } = new();

    public List<CircleMember> Members { get; set; } = new();
    public List<Album> Albums { get; set; } = new();
    public List<Publication> Publications { get; set; } = new();
}

public class CircleMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CircleId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public CircleRole Role { get; set; } = CircleRole.Viewer;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerifiedHuman { get; set; } = false;
}

public class Album
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CircleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Publication> Publications { get; set; } = new();
}
