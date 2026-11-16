export interface MosaicPhotoItem {
  id: string;
  publicationId: string;
  imageUrl: string;
  fullResUrl: string;
  caption: string;
  authorDisplayName: string;
  exifCameraGear?: string;
  isHumanProofVerified: boolean;
  critiqueCount: number;
  width: number;
  height: number;
  focalPoint?: { xPercent: number; yPercent: number };
  objectPosition: string;
}

export interface StudioMockupTemplate {
  imageUrl: string;
  fullResUrl: string;
  caption: string;
  authorDisplayName: string;
  exifCameraGear: string;
  isHumanProofVerified: boolean;
  critiqueCount: number;
  width: number;
  height: number;
  focalPoint: { xPercent: number; yPercent: number };
}

export const CURATED_STUDIO_MOCKUPS: StudioMockupTemplate[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2000&q=90',
    caption: 'Vallée dorée de Yosemite au lever du jour • Pose longue ND64',
    authorDisplayName: 'Alexy D.',
    exifCameraGear: 'Sony A7R V • FE 24mm f/1.4 GM • f/8 • ISO 100',
    isHumanProofVerified: true,
    critiqueCount: 3,
    width: 2400,
    height: 1600,
    focalPoint: { xPercent: 58, yPercent: 42 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=90',
    caption: 'Aiguilles alpines sous la brume matinale (Format Portrait 2:3)',
    authorDisplayName: 'Camille L.',
    exifCameraGear: 'Leica Q3 • Summilux 28mm f/1.7 • ISO 125',
    isHumanProofVerified: true,
    critiqueCount: 2,
    width: 1400,
    height: 2100,
    focalPoint: { xPercent: 50, yPercent: 28 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=2000&q=90',
    caption: 'Forêt primaire de séquoias après l’averse',
    authorDisplayName: 'Marc V.',
    exifCameraGear: 'Fujifilm GFX 100 II • GF 55mm f/1.7',
    isHumanProofVerified: true,
    critiqueCount: 1,
    width: 2200,
    height: 1467,
    focalPoint: { xPercent: 45, yPercent: 35 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2000&q=90',
    caption: 'Arche de la Voie lactée sur le col du Galibier (Panorama 21:9)',
    authorDisplayName: 'Élise R.',
    exifCameraGear: 'Sony A7S III • 14mm f/1.8 GM • 15s • ISO 3200',
    isHumanProofVerified: true,
    critiqueCount: 4,
    width: 2560,
    height: 1100,
    focalPoint: { xPercent: 52, yPercent: 38 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2000&q=90',
    caption: 'Lumières rasantes sur les crêtes du Vercors',
    authorDisplayName: 'Thomas B.',
    exifCameraGear: 'Nikon Z8 • NIKKOR Z 70-200mm f/2.8 VR S',
    isHumanProofVerified: true,
    critiqueCount: 0,
    width: 2000,
    height: 1333,
    focalPoint: { xPercent: 64, yPercent: 36 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=90',
    caption: 'Reflets glaciaires et barque sur le lac de Braies',
    authorDisplayName: 'Alexy D.',
    exifCameraGear: 'Hasselblad X2D 100C • XCD 38mm f/2.5V',
    isHumanProofVerified: true,
    critiqueCount: 5,
    width: 2400,
    height: 1600,
    focalPoint: { xPercent: 40, yPercent: 60 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=2000&q=90',
    caption: 'Contre-jour pastoral en Haute-Savoie (Format Vertical)',
    authorDisplayName: 'Chloé M.',
    exifCameraGear: 'Canon EOS R5 • RF 35mm f/1.4L VCM',
    isHumanProofVerified: true,
    critiqueCount: 1,
    width: 1350,
    height: 1800,
    focalPoint: { xPercent: 50, yPercent: 30 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2000&q=90',
    caption: 'Route sinueuse des Dolomites dans le brouillard',
    authorDisplayName: 'Hugo P.',
    exifCameraGear: 'Leica M11 • Summilux-M 50mm f/1.4 ASPH',
    isHumanProofVerified: true,
    critiqueCount: 2,
    width: 2100,
    height: 1400,
    focalPoint: { xPercent: 48, yPercent: 52 },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
    fullResUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=90',
    caption: 'Houle émeraude de Bretagne à marée montante',
    authorDisplayName: 'Sarah K.',
    exifCameraGear: 'Nikon Zf • 40mm f/2 SE • 1/1000s • ISO 160',
    isHumanProofVerified: true,
    critiqueCount: 3,
    width: 2400,
    height: 1500,
    focalPoint: { xPercent: 55, yPercent: 45 },
  },
];
