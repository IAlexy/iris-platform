using Iris.Application.Common.Interfaces;
using Iris.Domain.Entities;
using Iris.Domain.Enums;
using Iris.Infrastructure.Persistence;
using Iris.Infrastructure.Services;
using Xunit;

namespace Iris.Tests;

public class CircleAndImportTests
{
    private readonly IrisDataStore _store = new();
    private readonly LocalOrAzureBlobStorageService _blobService = new();
    private readonly MockAiSafetyAndExifService _safetyService = new();
    private readonly SocialMediaImporterService _importerService = new();

    [Fact]
    public void SeededData_ShouldContain_FamilyAndArtistSanctuaryCircles()
    {
        Assert.Equal(2, _store.Circles.Count);

        var artistCircle = _store.Circles[Guid.Parse("22222222-2222-2222-2222-222222222222")];
        Assert.Equal(AiContentPolicy.StrictlyForbidden, artistCircle.Policy.AiContentPolicy);
        Assert.True(artistCircle.Policy.RequireHumanProofOrCameraExif);
        Assert.True(artistCircle.Policy.EnableArtCritiquePins);
    }

    [Fact]
    public async Task BlobStorage_GeneratesSignedTokens_WithExpiry()
    {
        var readUrl = await _blobService.GenerateReadSasUriAsync("private-circles", "photo1.jpg", TimeSpan.FromMinutes(15));

        Assert.Contains("sp=r", readUrl);
        Assert.Contains("sig=", readUrl);
        Assert.Contains("private-circles/photo1.jpg", readUrl);
    }

    [Theory]
    [InlineData("https://www.instagram.com/p/DB12345678/", SocialPlatform.Instagram)]
    [InlineData("https://cara.app/post/98765432-abcd", SocialPlatform.Cara)]
    [InlineData("https://x.com/artist/status/1234567890", SocialPlatform.X)]
    [InlineData("https://www.reddit.com/r/photography/comments/xyz123/", SocialPlatform.Reddit)]
    public void Importer_DetectsPlatform_Correctly(string url, SocialPlatform expectedPlatform)
    {
        var detected = _importerService.DetectPlatform(url);
        Assert.Equal(expectedPlatform, detected);
    }

    [Fact]
    public async Task Importer_ExtractsMedia_AndAttachesProvenance()
    {
        var url = "https://www.instagram.com/p/DB12345678/";
        var post = await _importerService.FetchPostDataAsync(url);

        Assert.Equal(SocialPlatform.Instagram, post.Platform);
        Assert.NotEmpty(post.MediaItems);
        Assert.NotEmpty(post.AuthorUsername);
    }

    [Fact]
    public void CritiquePin_CanBeAddedToPublication()
    {
        var artistCircleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var circle = _store.Circles[artistCircleId];
        var pub = circle.Publications.First();

        var initialCount = pub.CritiquePins.Count;

        pub.CritiquePins.Add(new CritiquePin
        {
            PublicationId = pub.Id,
            AuthorUserId = "user_lucas",
            AuthorDisplayName = "Lucas M.",
            Category = "Composition",
            XPercent = 33.3,
            YPercent = 50.0,
            Comment = "Règle des tiers bien respectée sur la crête rocheuse."
        });

        Assert.Equal(initialCount + 1, pub.CritiquePins.Count);
    }
}
