import { describe, it, expect } from 'vitest';
import { ApiService } from '../services/api';
import { IrisColors } from '../theme/colors';

describe('Iris Mobile Stack Unit Tests', () => {
  it('Palette includes required Obsidian background and Royal Amethyst brand', () => {
    expect(IrisColors.background).toBe('#0A0812');
    expect(IrisColors.primary).toBe('#7C3AED');
    expect(IrisColors.primaryLight).toBe('#8B5CF6');
    expect(IrisColors.verifiedGear).toBe('#10B981');
    expect(IrisColors.socialImport).toBe('#6366F1');
  });

  it('ApiService returns mobile feed with critique pins and EXIF metadata', async () => {
    const feed = await ApiService.getFeed('22222222-2222-2222-2222-222222222222');
    expect(feed.length).toBeGreaterThan(0);

    const firstItem = feed[0];
    expect(firstItem.authorDisplayName).toBe('Alexy D.');
    expect(firstItem.exifCameraGear).toContain('Sony A7IV');
    expect(firstItem.critiquePins).toHaveLength(1);
    expect(firstItem.critiquePins[0].comment).toContain('Superbe transition');
  });

  it('Mobile social import correctly attaches origin attribution', async () => {
    const imported = await ApiService.importSocialPost({
      circleId: '22222222-2222-2222-2222-222222222222',
      postUrl: 'https://cara.app/post/12345'
    });

    expect(imported.id).toBeDefined();
    expect(imported.originalSourceUrl).toBe('https://cara.app/post/12345');
    expect(imported.mediaAssets[0].readSasUrl).toBeDefined();
  });

  it('Mobile critique pin coordinates are properly recorded', async () => {
    const pin = await ApiService.addCritiquePin('pub-1', {
      xPercent: 72.1,
      yPercent: 41.8,
      category: 'Color/Light',
      comment: 'Ciel bien étalonné'
    });

    expect(pin.xPercent).toBe(72.1);
    expect(pin.yPercent).toBe(41.8);
    expect(pin.category).toBe('Color/Light');
  });
});
