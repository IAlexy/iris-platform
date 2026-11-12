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
});
