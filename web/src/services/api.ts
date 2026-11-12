import { CircleSummary, Publication, SocialImportPayload, CritiquePin } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const ApiService = {
  async getCircles(): Promise<CircleSummary[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/circles`);
      if (res.ok) return await res.json();
    } catch {
      // Graceful offline mock
    }

    return [
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: "Atelier Photographes & Peintres Alpins",
        description: "Sanctuaire 100% créateurs humains. Vérification EXIF boîtier et WIP calques obligatoire.",
        coverImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        ownerUserId: 'user_alexy',
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
          maxFreePhotos: 100
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: "Famille & Vacances 2026",
        description: "Photos privées de nos retrouvailles et vacances d'été. Zéro pub, souvenirs protégés.",
        coverImageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=80',
        ownerUserId: 'user_alexy',
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
          maxFreePhotos: 100
        },
        createdAt: new Date().toISOString()
      }
    ];
  },

  async getFeed(circleId: string): Promise<Publication[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${circleId}/feed`);
      if (res.ok) return await res.json();
    } catch {
      // Graceful offline mock
    }

    return [
      {
        id: 'pub-alpine-sunset',
        circleId,
        authorUserId: 'user_alexy',
        authorDisplayName: 'Alexy D.',
        caption: "Coucher de soleil sur les crêtes du massif des Bauges. Pause de 15s avec filtre ND.",
        exifCameraGear: "Sony A7IV • FE 24-70mm F2.8 GM II • 24mm • f/8 • 15s • ISO 100",
        isHumanProofVerified: true,
        isAiFlagged: false,
        createdAt: 'Il y a 2h',
        mediaAssets: [
          {
            id: 'm1',
            readSasUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80',
            width: 1600,
            height: 1067,
            orderIndex: 0
          }
        ],
        critiquePins: [
          {
            id: 'pin1',
            authorUserId: 'user_camille',
            authorDisplayName: 'Camille (Photographe)',
            xPercent: 62.4,
            yPercent: 38.5,
            category: 'Color/Light',
            comment: "Superbe transition des teintes dorées vers le pourpre dans le ciel ! Le gradient est très naturel.",
            createdAt: 'Il y a 1h'
          }
        ]
      },
      {
        id: 'pub-insta-import',
        circleId,
        authorUserId: 'user_alexy',
        authorDisplayName: 'Alexy D.',
        caption: "Étude d'ambiance forestière automnale sous la brume.",
        isHumanProofVerified: false,
        isAiFlagged: false,
        originalSourceUrl: 'https://instagram.com/p/example',
        originalAuthorAttribution: 'Importé depuis @nature_lens (Instagram)',
        createdAt: 'Hier',
        mediaAssets: [
          {
            id: 'm2',
            readSasUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80',
            width: 1600,
            height: 1066,
            orderIndex: 0
          }
        ],
        critiquePins: []
      }
    ];
  },

  async importSocialPost(payload: SocialImportPayload): Promise<Publication> {
    try {
      const res = await fetch(`${API_BASE_URL}/social-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Mock fallback
    }

    return {
      id: 'pub-new-import',
      circleId: payload.circleId,
      authorUserId: 'user_current',
      authorDisplayName: 'Alexy D.',
      caption: `Importé depuis ${payload.postUrl}`,
      isHumanProofVerified: false,
      isAiFlagged: false,
      originalSourceUrl: payload.postUrl,
      originalAuthorAttribution: 'Importé via Iris Web Importer',
      createdAt: 'À l\'instant',
      mediaAssets: [
        {
          id: 'm-import',
          readSasUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&q=80',
          width: 1600,
          height: 1200,
          orderIndex: 0
        }
      ],
      critiquePins: []
    };
  },

  async addCritiquePin(publicationId: string, pin: { xPercent: number; yPercent: number; category: string; comment: string }): Promise<CritiquePin> {
    try {
      const res = await fetch(`${API_BASE_URL}/publications/${publicationId}/critique-pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pin)
      });
      if (res.ok) return await res.json();
    } catch {
      // Mock fallback
    }

    return {
      id: 'pin-' + Date.now(),
      authorUserId: 'user_alexy',
      authorDisplayName: 'Moi',
      xPercent: pin.xPercent,
      yPercent: pin.yPercent,
      category: pin.category,
      comment: pin.comment,
      createdAt: 'À l\'instant'
    };
  }
};
