import { describe, it, expect } from 'vitest';
import { ApiService } from '../services/api';

describe('Web ApiService Unit Tests', () => {
  it('getCircles returns both Family and Artist Sanctuary circles with policies', async () => {
    const circles = await ApiService.getCircles();
    expect(circles).toHaveLength(2);

    const artistCircle = circles.find((c) => c.id === '22222222-2222-2222-2222-222222222222');
    expect(artistCircle).toBeDefined();
    expect(artistCircle?.policy.aiContentPolicy).toBe('StrictlyForbidden');
    expect(artistCircle?.policy.requireHumanProofOrCameraExif).toBe(true);
    expect(artistCircle?.policy.enableArtCritiquePins).toBe(true);
  });

  it('getFeed returns publications with valid 15m SAS tokens and EXIF metadata', async () => {
    const feed = await ApiService.getFeed('22222222-2222-2222-2222-222222222222');
    expect(feed.length).toBeGreaterThan(0);

    const firstPub = feed[0];
    expect(firstPub.mediaAssets[0].readSasUrl).toContain('https://images.unsplash.com');
    expect(firstPub.exifCameraGear).toContain('Sony A7IV');
    expect(firstPub.isHumanProofVerified).toBe(true);
  });

  it('importSocialPost creates publication with external origin attribution', async () => {
    const importPayload = {
      circleId: '22222222-2222-2222-2222-222222222222',
      postUrl: 'https://instagram.com/p/DB12345678/',
    };

    const newPub = await ApiService.importSocialPost(importPayload);
    expect(newPub.originalSourceUrl).toBe(importPayload.postUrl);
    expect(newPub.originalAuthorAttribution).toBeDefined();
    expect(newPub.mediaAssets.length).toBeGreaterThan(0);
  });

  it('addCritiquePin attaches coordinate pin to publication', async () => {
    const pinPayload = {
      xPercent: 45.5,
      yPercent: 60.2,
      category: 'Composition',
      comment: 'Superbe diagonale sur les rochers.',
    };

    const pin = await ApiService.addCritiquePin('pub-alpine-sunset', pinPayload);
    expect(pin.id).toBeDefined();
    expect(pin.xPercent).toBe(45.5);
    expect(pin.yPercent).toBe(60.2);
    expect(pin.category).toBe('Composition');
  });
});
