import React, { useState, useEffect } from 'react';
import { Grid, Sparkles, Monitor, Tablet, Smartphone, Maximize2 } from 'lucide-react';
import { Publication } from '../types';
import {
  getMosaicCycleLength,
  getMosaicTilePlacement,
  getResponsiveMosaicColumns,
  getSmartObjectPosition,
} from '../utils/mosaicLayout';
import { CURATED_STUDIO_MOCKUPS, MosaicPhotoItem } from '../data/mosaicMockups';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface MosaicPhotoGalleryProps {
  publications: Publication[];
  selectedPubId?: string | null;
  onSelectPublication?: (pubId: string) => void;
  /** Optional override for deterministic testing of N columns */
  forcedColumns?: number;
  /** Fill with curated photography mockups to showcase a full cycle when circle has few posts */
  fillCycleShowcase?: boolean;
}

export const MosaicPhotoGallery: React.FC<MosaicPhotoGalleryProps> = ({
  publications,
  selectedPubId,
  onSelectPublication,
  forcedColumns,
  fillCycleShowcase = true,
}) => {
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [previewColumnsOverride, setPreviewColumnsOverride] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (forcedColumns !== undefined || typeof window === 'undefined') return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [forcedColumns]);

  const activeColumns =
    forcedColumns !== undefined
      ? forcedColumns
      : previewColumnsOverride !== null
        ? previewColumnsOverride
        : getResponsiveMosaicColumns(viewportWidth);

  const isClassicMobileGrid = activeColumns <= 3;
  const cycleLength = getMosaicCycleLength(activeColumns);

  // 1. Extract photos from actual circle publications with smart focal centering
  const basePhotos: MosaicPhotoItem[] = publications.flatMap((pub) =>
    pub.mediaAssets.map((asset, idx) => {
      const objectPosition = getSmartObjectPosition({
        critiquePins: pub.critiquePins,
        width: asset.width,
        height: asset.height,
      });

      return {
        id: `${pub.id}-${asset.id || idx}`,
        publicationId: pub.id,
        imageUrl: asset.readSasUrl,
        fullResUrl: asset.readSasUrl,
        caption: pub.caption,
        authorDisplayName: pub.authorDisplayName,
        exifCameraGear: pub.exifCameraGear,
        isHumanProofVerified: pub.isHumanProofVerified,
        critiqueCount: pub.critiquePins.length,
        width: asset.width || 1600,
        height: asset.height || 1067,
        objectPosition,
      };
    })
  );

  // 2. Enrich with curated studio mockups so users immediately see the complete cycle in action
  const galleryItems: MosaicPhotoItem[] = [...basePhotos];
  if (fillCycleShowcase && galleryItems.length < cycleLength) {
    const fallbackPubId = publications[0]?.id ?? 'showcase';
    while (galleryItems.length < cycleLength) {
      const idx = galleryItems.length;
      const mockup = CURATED_STUDIO_MOCKUPS[idx % CURATED_STUDIO_MOCKUPS.length];
      const objectPosition = getSmartObjectPosition({
        focalPoint: mockup.focalPoint,
        width: mockup.width,
        height: mockup.height,
      });

      galleryItems.push({
        ...mockup,
        id: `mosaic-mockup-${idx}`,
        publicationId: publications[idx % Math.max(1, publications.length)]?.id ?? fallbackPubId,
        objectPosition,
      });
    }
  }

  const handleTileClick = (index: number, pubId: string) => {
    setLightboxIndex(index);
    onSelectPublication?.(pubId);
  };

  return (
    <section
      aria-label="Mosaïque Harmonieux Adaptative"
      className="bg-[#130E24] border border-[#2E2254] rounded-2xl p-4 shadow-xl space-y-3"
    >
      {/* Mosaic Header + Interactive Screen Size Mockup Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2E2254]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/50 flex items-center justify-center text-[#C4B5FD]">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex flex-wrap items-center gap-2">
              <span>Galerie Mosaïque Adaptative</span>
              <span
                data-testid="mosaic-mode-badge"
                className="px-2 py-0.5 rounded-full bg-[#1D1636] border border-[#7C3AED]/40 text-[10px] font-semibold text-[#C4B5FD]"
              >
                {isClassicMobileGrid
                  ? `3 colonnes Classique • ${cycleLength} photos`
                  : `${activeColumns} colonnes Mosaïque • Cycle ${cycleLength} photos`}
              </span>
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              {isClassicMobileGrid
                ? ' Petit écran : Grille classique 3 photos par ligne • Cliquez pour ouvrir en plein format'
                : 'Disposition harmonieuse : Focus 2×2 Gauche (AA), Ligne Normale, Focus 2×2 Droite (LL) • Cliquez pour voir sans troncature'}
            </p>
          </div>
        </div>

        {/* Interactive Responsive Preview Switcher for Live Mockup Testing */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid="preview-mode-auto"
            onClick={() => setPreviewColumnsOverride(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
              previewColumnsOverride === null
                ? 'bg-[#7C3AED] border-[#8B5CF6] text-white'
                : 'bg-[#0D091A] border-[#2E2254] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto</span>
          </button>

          <button
            type="button"
            data-testid="preview-mode-9"
            onClick={() => setPreviewColumnsOverride(9)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
              activeColumns === 9 && previewColumnsOverride === 9
                ? 'bg-[#7C3AED] border-[#8B5CF6] text-white'
                : 'bg-[#0D091A] border-[#2E2254] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Grand (9 col)</span>
          </button>

          <button
            type="button"
            data-testid="preview-mode-6"
            onClick={() => setPreviewColumnsOverride(6)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
              activeColumns === 6 && previewColumnsOverride === 6
                ? 'bg-[#7C3AED] border-[#8B5CF6] text-white'
                : 'bg-[#0D091A] border-[#2E2254] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Tablet className="w-3 h-3" />
            <span>Moyen (6 col)</span>
          </button>

          <button
            type="button"
            data-testid="preview-mode-3"
            onClick={() => setPreviewColumnsOverride(3)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
              activeColumns === 3 && previewColumnsOverride === 3
                ? 'bg-[#7C3AED] border-[#8B5CF6] text-white'
                : 'bg-[#0D091A] border-[#2E2254] text-[#94A3B8] hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Petit (3 col)</span>
          </button>
        </div>
      </div>

      {/* CSS Grid with dense packing & exact 2x2 / 1x1 harmonious proportions */}
      <div
        role="grid"
        aria-label="Grille photo mosaïque"
        data-testid="iris-mosaic-grid"
        data-columns={activeColumns}
        data-layout-mode={isClassicMobileGrid ? 'classic-3' : `mosaic-${activeColumns}`}
        style={{ '--mosaic-cols': activeColumns } as React.CSSProperties}
        className="iris-mosaic-grid"
      >
        {galleryItems.map((item, index) => {
          const placement = getMosaicTilePlacement(index, activeColumns);
          const isHero = placement.variant !== 'standard';
          const isSelected = selectedPubId === item.publicationId && index === 0;

          return (
            <div
              key={item.id}
              role="gridcell"
              aria-label={item.caption}
              data-testid={`mosaic-tile-${index}`}
              data-variant={placement.variant}
              data-col-span={placement.colSpan}
              data-row-span={placement.rowSpan}
              data-object-position={item.objectPosition}
              style={{
                gridColumn: placement.gridColumn,
                gridRow: placement.gridRow,
              }}
              onClick={() => handleTileClick(index, item.publicationId)}
              className={`iris-mosaic-tile group rounded-lg bg-[#0A0812] border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/50'
                  : isHero
                    ? 'border-[#7C3AED]/50 hover:border-[#A855F7]'
                    : 'border-[#2E2254]/60 hover:border-[#7C3AED]'
              }`}
            >
              <img
                src={item.imageUrl}
                alt=""
                role="presentation"
                loading="lazy"
                style={{ objectPosition: item.objectPosition }}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Subtle 2x2 Hero Badge (AA / LL) on 6-col and 9-col screens */}
              {isHero && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0A0812]/80 backdrop-blur-sm border border-[#7C3AED]/60 text-[10px] font-bold text-[#DDD6FE] shadow">
                  {placement.variant === 'hero-left' ? 'AA • 2×2' : 'LL • 2×2'}
                </span>
              )}

              {/* Hover Overlay indicating Full Picture View */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0812]/90 via-[#0A0812]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span className="p-1 rounded-md bg-[#0A0812]/75 border border-[#7C3AED]/50 text-[#DDD6FE]">
                    <Maximize2 className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-white truncate">{item.caption}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Uncropped Picture Lightbox Modal */}
      <PhotoLightboxModal
        items={galleryItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
      />
    </section>
  );
};
