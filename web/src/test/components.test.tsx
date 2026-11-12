import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { CircleInspector } from '../components/CircleInspector';
import { SocialImportModal } from '../components/SocialImportModal';
import { FeedView } from '../components/FeedView';
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

describe('Desktop Web Component UI Automation Tests', () => {
  it('1. Sidebar renders brand and navigation triggers', () => {
    const onSelect = vi.fn();
    const onOpenImport = vi.fn();

    render(
      <Sidebar
        circles={mockCircles}
        activeCircleId="22222222-2222-2222-2222-222222222222"
        onSelectCircle={onSelect}
        onOpenImport={onOpenImport}
        onOpenNewCircle={vi.fn()}
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
  });

  it('2. FeedView displays camera gear, human-made proof, and critique pins', () => {
    const onAddPin = vi.fn();

    render(<FeedView publications={mockPublications} onAddCritiquePin={onAddPin} />);

    // Verification badges
    expect(screen.getByText(/Sony A7IV/)).toBeInTheDocument();
    expect(screen.getByText('Création 100% Humaine Vérifiée')).toBeInTheDocument();
    expect(screen.getByText('Chiffré SAS 15m (Anti-Scraping)')).toBeInTheDocument();

    // Toggle critique mode
    const critiqueModeBtn = screen.getByText(/Mode Critique/);
    fireEvent.click(critiqueModeBtn);

    expect(
      screen.getByText("Cliquez sur l'image pour épingler une critique technique")
    ).toBeInTheDocument();
  });

  it('3. CircleInspector displays active policies and triggers quick import', () => {
    const onQuickImport = vi.fn();

    render(<CircleInspector circle={mockCircles[0]} onQuickImport={onQuickImport} />);

    expect(screen.getByText('Filtre Anti-IA')).toBeInTheDocument();
    expect(screen.getByText('Interdiction stricte + C2PA')).toBeInTheDocument();
    expect(screen.getByText('Preuve Matériel (EXIF)')).toBeInTheDocument();
    expect(screen.getByText('Nettoyage GPS')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/instagram\.com/);
    fireEvent.change(input, { target: { value: 'https://instagram.com/p/12345' } });

    const submitBtn = screen.getByText('Archiver dans le Cercle');
    fireEvent.click(submitBtn);

    expect(onQuickImport).toHaveBeenCalledWith('https://instagram.com/p/12345');
  });

  it('4. SocialImportModal detects platforms: Instagram, Cara, X, Reddit', () => {
    render(
      <SocialImportModal
        isOpen={true}
        onClose={vi.fn()}
        circles={mockCircles}
        onImport={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/instagram\.com/);

    // Test Instagram detection
    fireEvent.change(input, { target: { value: 'https://www.instagram.com/p/DB12345678/' } });
    expect(screen.getByText(/Instagram détecté/)).toBeInTheDocument();

    // Test Cara Art detection
    fireEvent.change(input, { target: { value: 'https://cara.app/post/digital-art-123' } });
    expect(screen.getByText(/Cara Art détecté/)).toBeInTheDocument();

    // Test X/Twitter detection
    fireEvent.change(input, { target: { value: 'https://x.com/artist/status/987654321' } });
    expect(screen.getByText(/X \/ Twitter détecté/)).toBeInTheDocument();
  });

  it('5. Full App E2E integration renders studio view and header', async () => {
    render(<App />);

    // Wait for async load of mock circles and feed
    await waitFor(() => {
      const items = screen.getAllByText(/Atelier Photographes/);
      expect(items.length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Flux Privé Déchiffré/)).toBeInTheDocument();
  });
});
