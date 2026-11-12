import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiService } from '../services/api';

describe('Web ApiService Full Coverage Tests', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Offline Fallback Mode (Fetch throws error)', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    });

    it('getCircles returns seeded fallback circles', async () => {
      const circles = await ApiService.getCircles();
      expect(circles).toHaveLength(2);
      expect(circles[0].name).toContain('Atelier');
    });

    it('getFeed returns seeded fallback feed', async () => {
      const feed = await ApiService.getFeed('circle-1');
      expect(feed).toHaveLength(2);
      expect(feed[0].exifCameraGear).toContain('Sony A7IV');
    });

    it('importSocialPost creates mock fallback post', async () => {
      const post = await ApiService.importSocialPost({
        circleId: 'circle-1',
        postUrl: 'https://instagram.com/p/12345'
      });
      expect(post.originalSourceUrl).toBe('https://instagram.com/p/12345');
      expect(post.mediaAssets[0].readSasUrl).toBeDefined();
    });

    it('addCritiquePin returns newly created mock pin', async () => {
      const pin = await ApiService.addCritiquePin('pub-1', {
        xPercent: 50,
        yPercent: 50,
        category: 'Composition',
        comment: 'Nice framing'
      });
      expect(pin.comment).toBe('Nice framing');
      expect(pin.xPercent).toBe(50);
    });
  });

  describe('Online Mode (Fetch returns 200 OK)', () => {
    it('getCircles returns API data when response is ok', async () => {
      const mockApiCircles = [{ id: 'api-1', name: 'API Circle' }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiCircles
      } as any);

      const result = await ApiService.getCircles();
      expect(result).toEqual(mockApiCircles);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/circles');
    });

    it('getFeed returns API feed when response is ok', async () => {
      const mockApiFeed = [{ id: 'pub-api-1', caption: 'Live feed' }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiFeed
      } as any);

      const result = await ApiService.getFeed('circle-99');
      expect(result).toEqual(mockApiFeed);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/circles/circle-99/feed');
    });

    it('importSocialPost sends POST request and returns API response', async () => {
      const mockCreatedPub = { id: 'imported-1', caption: 'Imported from API' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCreatedPub
      } as any);

      const result = await ApiService.importSocialPost({
        circleId: 'circle-1',
        postUrl: 'https://cara.app/post/999'
      });
      expect(result).toEqual(mockCreatedPub);
    });

    it('addCritiquePin sends POST request and returns API pin', async () => {
      const mockCreatedPin = { id: 'pin-99', comment: 'From live API' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCreatedPin
      } as any);

      const result = await ApiService.addCritiquePin('pub-1', {
        xPercent: 20,
        yPercent: 30,
        category: 'Technique',
        comment: 'From live API'
      });
      expect(result).toEqual(mockCreatedPin);
    });
  });
});
