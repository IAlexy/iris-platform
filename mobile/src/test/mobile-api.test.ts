import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiService } from '../services/api';

describe('Mobile ApiService Coverage Tests', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Offline Fallback Mode', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    });

    it('getCircles returns both offline circles', async () => {
      const circles = await ApiService.getCircles();
      expect(circles).toHaveLength(2);
      expect(circles[0].policy.aiContentPolicy).toBe('StrictlyForbidden');
      expect(circles[1].policy.aiContentPolicy).toBe('Allowed');
    });

    it('getFeed returns offline publications with critique pins', async () => {
      const feed = await ApiService.getFeed('circle-1');
      expect(feed.length).toBeGreaterThan(0);
      expect(feed[0].mediaAssets[0].readSasUrl).toBeDefined();
    });

    it('importSocialPost returns mock fallback imported publication', async () => {
      const pub = await ApiService.importSocialPost({
        circleId: 'circle-1',
        postUrl: 'https://instagram.com/p/123'
      });
      expect(pub.originalSourceUrl).toBe('https://instagram.com/p/123');
      expect(pub.mediaAssets.length).toBeGreaterThan(0);
    });

    it('addCritiquePin returns newly created critique pin', async () => {
      const pin = await ApiService.addCritiquePin('pub-1', {
        xPercent: 12.5,
        yPercent: 34.5,
        category: 'Composition',
        comment: 'Harmonieux'
      });
      expect(pin.xPercent).toBe(12.5);
      expect(pin.yPercent).toBe(34.5);
    });
  });

  describe('Online Connected Mode (HTTP 200)', () => {
    it('getCircles parses online response', async () => {
      const mockCircles = [{ id: 'live-1', name: 'Live Mobile Circle' }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCircles
      } as any);

      const res = await ApiService.getCircles();
      expect(res).toEqual(mockCircles);
    });

    it('getFeed parses online feed', async () => {
      const mockFeed = [{ id: 'live-pub', caption: 'Live Caption' }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFeed
      } as any);

      const res = await ApiService.getFeed('c1');
      expect(res).toEqual(mockFeed);
    });

    it('importSocialPost calls POST endpoint', async () => {
      const mockResult = { id: 'imported-live', caption: 'Imported Live' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult
      } as any);

      const res = await ApiService.importSocialPost({ circleId: 'c1', postUrl: 'https://x.com/art/1' });
      expect(res).toEqual(mockResult);
    });

    it('addCritiquePin calls POST endpoint', async () => {
      const mockPin = { id: 'pin-live', comment: 'Live comment' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPin
      } as any);

      const res = await ApiService.addCritiquePin('pub-1', {
        xPercent: 10,
        yPercent: 20,
        category: 'Color',
        comment: 'Live comment'
      });
      expect(res).toEqual(mockPin);
    });
  });
});
