import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { CircleInspector } from '../components/CircleInspector';
import { SocialImportModal } from '../components/SocialImportModal';
import { FeedView } from '../components/FeedView';
import { MosaicPhotoGallery } from '../components/MosaicPhotoGallery';
import {
  getBreakpointMode,
  getMosaicCycleLength,
  getMosaicTilePlacement,
  getResponsiveMosaicColumns,
  getSmartObjectPosition,
} from '../utils/mosaicLayout';
import { App } from '../App';
import { CircleSummary, Publication } from '../types';

const mockCircles: CircleSummary[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Atelier Photographes Alpins',
    description: 'Sanctuaire créateurs humains.',
    ownerUserId: 'u1',
    trustTier: 'Tier2_CommunityVerified',
    memberCount: 14,
    publicationCount: 38,
    policy: {
      joinMode: 'PeerReviewedApplication',
      applicationRequiredPhotos: 3,
      applicationApprovalQuorum: 3,
      qrPassEnabled: true,
      qrPassDefaultRole: 'Viewer',
      aiContentPolicy: 'StrictlyForbidden',
      requireHumanProofOrCameraExif: true,
      stripGpsMetadata: true,
      preserveCameraGearExif: true,
      enableArtCritiquePins: true,
      monetizationMode: 'FreeOrQuota',
      maxFreePhotos: 100,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Famille & Vacances 2026',
    description: 'Photos privées de nos retrouvailles.',
    ownerUserId: 'u1',
    trustTier: 'Tier1_SmallPrivate',
    memberCount: 6,
    publicationCount: 84,
    policy: {
      joinMode: 'InviteLinkOnly',
      applicationRequiredPhotos: 0,
      applicationApprovalQuorum: 0,
      qrPassEnabled: false,
      qrPassDefaultRole: 'Viewer',
      aiContentPolicy: 'Allowed',
      requireHumanProofOrCameraExif: false,
      stripGpsMetadata: true,
      preserveCameraGearExif: false,
      enableArtCritiquePins: false,
      monetizationMode: 'FreeOrQuota',
      maxFreePhotos: 100,
    },
    createdAt: new Date().toISOString(),
  },
];

const mockPublications: Publication[] = [
  {
    id: 'pub-1',
    circleId: '22222222-2222-2222-2222-222222222222',
    authorUserId: 'u1',
    authorDisplayName: 'Alexy D.',
    caption: 'Coucher de soleil sur les crêtes des Bauges.',
    exifCameraGear: 'Sony A7IV • FE 24-70mm GM II • 24mm • f/8 • 15s • ISO 100',
    isHumanProofVerified: true,
    isAiFlagged: false,
    createdAt: 'Il y a 2h',
    mediaAssets: [
      {
        id: 'm1',
        readSasUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        width: 1600,
        height: 1067,
        orderIndex: 0,
      },
    ],
    critiquePins: [
      {
        id: 'pin1',
        authorUserId: 'u2',
        authorDisplayName: 'Camille (Photographe)',
        xPercent: 62.4,
        yPercent: 38.5,
        category: 'Color/Light',
        comment: 'Superbe transition des teintes dorées vers le pourpre dans le ciel !',
        createdAt: 'Il y a 1h',
      },
    ],
  },
];

describe('Desktop Web Component UI Full Automation Tests', () => {
  it('1. Sidebar renders brand and navigation triggers', () => {
    const onSelect = vi.fn();
    const onOpenImport = vi.fn();
    const onOpenNewCircle = vi.fn();

    render(
      <Sidebar
        circles={mockCircles}
        activeCircleId="22222222-2222-2222-2222-222222222222"
        onSelectCircle={onSelect}
        onOpenImport={onOpenImport}
        onOpenNewCircle={onOpenNewCircle}
      />
    );

    expect(screen.getByText('iris')).toBeInTheDocument();
    expect(screen.getByText('Atelier Photographes Alpins')).toBeInTheDocument();
    expect(screen.getByText('Famille & Vacances 2026')).toBeInTheDocument();

    const importBtn = screen.getByText('Importer un Post');
    fireEvent.click(importBtn);
    expect(onOpenImport).toHaveBeenCalledTimes(1);

    const familyCircleBtn = screen.getByText('Famille & Vacances 2026');
    fireEvent.click(familyCircleBtn);
    expect(onSelect).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');

    const newCircleBtn = screen.getByText('Créer un Cercle');
    fireEvent.click(newCircleBtn);
    expect(onOpenNewCircle).toHaveBeenCalledTimes(1);
  });

  it('2. FeedView displays badges, handles pin clicks, and image pin drops', () => {
    const onAddPin = vi.fn();

    render(<FeedView publications={mockPublications} onAddCritiquePin={onAddPin} />);

    // Badges
    expect(screen.getByText(/Sony A7IV/)).toBeInTheDocument();
    expect(screen.getByText('Création 100% Humaine Vérifiée')).toBeInTheDocument();
    expect(screen.getByText('Chiffré SAS 15m (Anti-Scraping)')).toBeInTheDocument();

    // Image click while critique mode is OFF -> should not call onAddPin
    const imageContainer = screen.getByRole('img').parentElement!;
    fireEvent.click(imageContainer, { clientX: 200, clientY: 100 });
    expect(onAddPin).not.toHaveBeenCalled();

    // Toggle critique mode ON
    const critiqueModeBtn = screen.getByText(/Mode Critique/);
    fireEvent.click(critiqueModeBtn);

    expect(
      screen.getByText("Cliquez sur l'image pour épingler une critique technique")
    ).toBeInTheDocument();

    // Click on image canvas to add a new pin
    // Mock getBoundingClientRect
    vi.spyOn(imageContainer, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 600,
      right: 1000,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.click(imageContainer, { clientX: 450, clientY: 300 });
    expect(onAddPin).toHaveBeenCalledWith('pub-1', 45, 50);

    // Click on existing pin to inspect tooltip
    const pinBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(pinBtn);

    expect(screen.getByText(/Superbe transition des teintes dorées/)).toBeInTheDocument();

    // Click pin again to close tooltip
    fireEvent.click(pinBtn);
    expect(screen.queryByText(/Superbe transition des teintes dorées/)).not.toBeInTheDocument();

    // Toggle critique mode OFF
    fireEvent.click(critiqueModeBtn);
    expect(
      screen.queryByText("Cliquez sur l'image pour épingler une critique technique")
    ).not.toBeInTheDocument();
  });

  it('3. CircleInspector handles undefined circle, renders policies, and form submit', () => {
    const onQuickImport = vi.fn();

    // Undefined circle -> null
    const { unmount } = render(<CircleInspector circle={undefined} onQuickImport={onQuickImport} />);
    unmount();

    render(<CircleInspector circle={mockCircles[0]} onQuickImport={onQuickImport} />);

    expect(screen.getByText('Filtre Anti-IA')).toBeInTheDocument();
    expect(screen.getByText('Interdiction stricte + C2PA')).toBeInTheDocument();
    expect(screen.getByText('Preuve Matériel (EXIF)')).toBeInTheDocument();
    expect(screen.getByText('Nettoyage GPS')).toBeInTheDocument();

    // Empty input submit -> does not call onQuickImport
    const submitBtn = screen.getByText('Archiver dans le Cercle');
    fireEvent.click(submitBtn);
    expect(onQuickImport).not.toHaveBeenCalled();

    // Fill valid URL
    const input = screen.getByPlaceholderText(/instagram\.com/);
    fireEvent.change(input, { target: { value: 'https://instagram.com/p/12345' } });
    fireEvent.click(submitBtn);

    expect(onQuickImport).toHaveBeenCalledWith('https://instagram.com/p/12345');
  });

  it('4. SocialImportModal handles all platforms, select dropdown, cancel and close', async () => {
    const onClose = vi.fn();
    const onImport = vi.fn();

    // Hidden when isOpen is false
    const { unmount } = render(
      <SocialImportModal
        isOpen={false}
        onClose={onClose}
        circles={mockCircles}
        onImport={onImport}
      />
    );
    unmount();

    render(
      <SocialImportModal
        isOpen={true}
        onClose={onClose}
        circles={mockCircles}
        onImport={onImport}
      />
    );

    const input = screen.getByPlaceholderText(/instagram\.com/);

    // Test Instagram
    fireEvent.change(input, { target: { value: 'https://www.instagram.com/p/DB12345678/' } });
    expect(screen.getByText(/Instagram détecté/)).toBeInTheDocument();

    // Test Cara
    fireEvent.change(input, { target: { value: 'https://cara.app/post/digital-art-123' } });
    expect(screen.getByText(/Cara Art détecté/)).toBeInTheDocument();

    // Test X/Twitter
    fireEvent.change(input, { target: { value: 'https://x.com/artist/status/987654321' } });
    expect(screen.getByText(/X \/ Twitter détecté/)).toBeInTheDocument();

    // Test Threads
    fireEvent.change(input, { target: { value: 'https://threads.net/@user/post/abc' } });
    expect(screen.getByText(/Threads détecté/)).toBeInTheDocument();

    // Test Reddit
    fireEvent.change(input, { target: { value: 'https://reddit.com/r/art/comments/123' } });
    expect(screen.getByText(/Reddit détecté/)).toBeInTheDocument();

    // Select circle
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '11111111-1111-1111-1111-111111111111' } });

    // Submit import
    const submitBtn = screen.getByText('Importer dans le Cercle');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(
        'https://reddit.com/r/art/comments/123',
        '11111111-1111-1111-1111-111111111111'
      );
      expect(onClose).toHaveBeenCalled();
    });

    // Close buttons
    const cancelBtn = screen.getByText('Annuler');
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('5. Full App E2E integration: circle switching and modal triggers', async () => {
    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getAllByText(/Atelier Photographes/)[0]).toBeInTheDocument();
    });

    expect(screen.getByText(/Flux Privé Déchiffré/)).toBeInTheDocument();

    // Switch to Family Circle
    const familyCircle = screen.getByText('Famille & Vacances 2026');
    fireEvent.click(familyCircle);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Famille & Vacances 2026' })).toBeInTheDocument();
    });

    // Open Social Import modal via Header button
    const headerImportBtn = screen.getByText('+ Importer Social');
    fireEvent.click(headerImportBtn);

    expect(screen.getByText('Import Social Universel')).toBeInTheDocument();

    // Close modal
    const cancelBtn = screen.getByText('Annuler');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Import Social Universel')).not.toBeInTheDocument();
    });
  });

  it('6. Adaptive Mosaic Layout algorithm places AA (left 2x2), normal row, LL (right 2x2) on 9-col & 6-col, and classic 3-per-line on small screens', () => {
    // Responsive breakpoints check: >=1280 -> 9, 768..1279 -> 6, <768 -> 3
    expect(getResponsiveMosaicColumns(1600)).toBe(9);
    expect(getResponsiveMosaicColumns(1280)).toBe(9);
    expect(getResponsiveMosaicColumns(1024)).toBe(6);
    expect(getResponsiveMosaicColumns(768)).toBe(6);
    expect(getResponsiveMosaicColumns(600)).toBe(3);
    expect(getResponsiveMosaicColumns(390)).toBe(3);

    expect(getBreakpointMode(9)).toBe('desktop-9');
    expect(getBreakpointMode(6)).toBe('medium-6');
    expect(getBreakpointMode(3)).toBe('mobile-3');

    // Small screen (3 columns): classic 3 pictures per line (all 1x1 standard, 18 per cycle)
    expect(getMosaicCycleLength(3)).toBe(18);
    expect(getMosaicTilePlacement(0, 3).variant).toBe('standard');
    expect(getMosaicTilePlacement(0, 3).colSpan).toBe(1);
    expect(getMosaicTilePlacement(11, 3).variant).toBe('standard');

    // Medium screen (6 columns): 6*6 - 6 = 30 photos, AA at 0, LL at 4*6 - 5 = 19
    expect(getMosaicCycleLength(6)).toBe(30);
    expect(getMosaicTilePlacement(0, 6).variant).toBe('hero-left');
    expect(getMosaicTilePlacement(19, 6).variant).toBe('hero-right');
    expect(getMosaicTilePlacement(19, 6).gridColumn).toBe('5 / span 2');

    // Big screen (9 columns): 6*9 - 6 = 48 photos, AA at 0, LL at 4*9 - 5 = 31
    const cols = 9;
    expect(getMosaicCycleLength(cols)).toBe(48);

    const aa = getMosaicTilePlacement(0, cols);
    expect(aa.variant).toBe('hero-left');
    expect(aa.colSpan).toBe(2);
    expect(aa.rowSpan).toBe(2);
    expect(aa.gridColumn).toBe('1 / span 2');
    expect(aa.gridRow).toBe('span 2');

    for (let i = 1; i <= 30; i++) {
      const tile = getMosaicTilePlacement(i, cols);
      expect(tile.variant).toBe('standard');
      expect(tile.colSpan).toBe(1);
      expect(tile.rowSpan).toBe(1);
    }

    const ll = getMosaicTilePlacement(31, cols);
    expect(ll.variant).toBe('hero-right');
    expect(ll.colSpan).toBe(2);
    expect(ll.rowSpan).toBe(2);
    expect(ll.gridColumn).toBe('8 / span 2');
    expect(ll.gridRow).toBe('span 2');

    for (let i = 32; i < 48; i++) {
      expect(getMosaicTilePlacement(i, cols).variant).toBe('standard');
    }

    expect(getMosaicTilePlacement(48, cols).variant).toBe('hero-left');
  });

  it('7. Smart focal centering (getSmartObjectPosition) centers truncated thumbnails on the main subject', () => {
    // Explicit focal point
    expect(getSmartObjectPosition({ focalPoint: { xPercent: 58, yPercent: 42 } })).toBe('58% 42%');

    // Critique pins centroid
    expect(
      getSmartObjectPosition({
        critiquePins: [
          { xPercent: 60, yPercent: 30 },
          { xPercent: 70, yPercent: 50 },
        ],
      })
    ).toBe('65% 40%');

    // Portrait orientation heuristic (upper third)
    expect(getSmartObjectPosition({ width: 1200, height: 1800 })).toBe('50% 28%');

    // Panoramic orientation heuristic
    expect(getSmartObjectPosition({ width: 2400, height: 1100 })).toBe('50% 42%');

    // Default center
    expect(getSmartObjectPosition({ width: 1600, height: 1200 })).toBe('50% 50%');
  });

  it('8. MosaicPhotoGallery responds to window resize, preview mode switchers, and opens Full-Picture Lightbox on click', () => {
    const onSelectPub = vi.fn();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 });

    render(
      <MosaicPhotoGallery
        publications={mockPublications}
        selectedPubId="pub-1"
        onSelectPublication={onSelectPub}
        fillCycleShowcase={true}
      />
    );

    const grid = screen.getByTestId('iris-mosaic-grid');
    expect(grid).toHaveAttribute('data-columns', '9');
    expect(grid).toHaveAttribute('data-layout-mode', 'mosaic-9');

    // Simulate resize to Medium screen (900px -> 6 columns)
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 900 });
    fireEvent(window, new Event('resize'));
    expect(grid).toHaveAttribute('data-columns', '6');
    expect(grid).toHaveAttribute('data-layout-mode', 'mosaic-6');

    // Simulate resize to Small screen (500px -> 3 columns classic mode)
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    fireEvent(window, new Event('resize'));
    expect(grid).toHaveAttribute('data-columns', '3');
    expect(grid).toHaveAttribute('data-layout-mode', 'classic-3');
    expect(screen.getByTestId('mosaic-tile-0')).toHaveAttribute('data-variant', 'standard');

    // Interactive Mockup Switcher buttons (9 col, 6 col, 3 col, Auto)
    fireEvent.click(screen.getByTestId('preview-mode-9'));
    expect(grid).toHaveAttribute('data-columns', '9');
    expect(screen.getByTestId('mosaic-tile-0')).toHaveAttribute('data-variant', 'hero-left');
    expect(screen.getByTestId('mosaic-tile-31')).toHaveAttribute('data-variant', 'hero-right');

    fireEvent.click(screen.getByTestId('preview-mode-6'));
    expect(grid).toHaveAttribute('data-columns', '6');
    expect(screen.getByTestId('mosaic-tile-19')).toHaveAttribute('data-variant', 'hero-right');

    fireEvent.click(screen.getByTestId('preview-mode-3'));
    expect(grid).toHaveAttribute('data-columns', '3');

    fireEvent.click(screen.getByTestId('preview-mode-auto'));
    expect(grid).toHaveAttribute('data-columns', '3');

    // Click on tile 0 -> Opens Full-Picture Lightbox Modal
    fireEvent.click(screen.getByTestId('mosaic-tile-0'));
    expect(onSelectPub).toHaveBeenCalledWith('pub-1');
    expect(screen.getByTestId('photo-lightbox-modal')).toBeInTheDocument();
    expect(screen.getByTestId('lightbox-full-image')).toHaveClass('object-contain');

    // Navigate next & prev in Lightbox via buttons and keyboard
    fireEvent.click(screen.getByTestId('lightbox-next-btn'));
    fireEvent.click(screen.getByTestId('lightbox-prev-btn'));
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByTestId('photo-lightbox-modal')).not.toBeInTheDocument();
  });
});
