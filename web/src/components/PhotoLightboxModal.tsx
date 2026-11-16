import React, { useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  CheckCircle,
  Maximize2,
  Crosshair,
  Lock,
} from 'lucide-react';
import { MosaicPhotoItem } from '../data/mosaicMockups';

interface PhotoLightboxModalProps {
  items: MosaicPhotoItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  items,
  activeIndex,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onNavigate((activeIndex - 1 + items.length) % items.length);
      }
      if (e.key === 'ArrowRight') {
        onNavigate((activeIndex + 1) % items.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items.length, onClose, onNavigate]);

  if (activeIndex === null || !items[activeIndex]) return null;

  const item = items[activeIndex];
  const prevIndex = (activeIndex - 1 + items.length) % items.length;
  const nextIndex = (activeIndex + 1) % items.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse Photo Plein Format"
      data-testid="photo-lightbox-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#0A0812]/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6 select-none"
    >
      {/* Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#130E24]/90 border border-[#2E2254] shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#1D1636] border border-[#7C3AED] flex items-center justify-center font-bold text-xs text-white">
            {item.authorDisplayName.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{item.authorDisplayName}</p>
            <p className="text-[11px] text-[#C4B5FD]">
              Photo #{activeIndex + 1} / {items.length} • Format Original Intégral (Non Tronqué)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1D1636] border border-[#7C3AED]/40 text-[11px] text-[#DDD6FE]">
            <Maximize2 className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>
              {item.width} × {item.height} px
            </span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1D1636] border border-[#2E2254] text-[11px] text-[#94A3B8]">
            <Crosshair className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Focus Grille : {item.objectPosition}</span>
          </span>

          <button
            type="button"
            aria-label="Fermer la visionneuse"
            data-testid="lightbox-close-btn"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-[#1D1636] hover:bg-[#7C3AED] border border-[#2E2254] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>

      {/* Main Uncropped Image Stage (`object-contain` preserves 100% of the original photograph) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex-1 min-h-0 my-3 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-[#2E2254]/70"
      >
        <button
          type="button"
          aria-label="Photo précédente"
          data-testid="lightbox-prev-btn"
          onClick={() => onNavigate(prevIndex)}
          className="absolute left-3 z-10 w-10 h-10 rounded-full bg-[#130E24]/85 hover:bg-[#7C3AED] border border-[#7C3AED]/50 text-white flex items-center justify-center shadow-xl transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <img
          data-testid="lightbox-full-image"
          src={item.fullResUrl}
          alt={item.caption}
          className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
        />

        <button
          type="button"
          aria-label="Photo suivante"
          data-testid="lightbox-next-btn"
          onClick={() => onNavigate(nextIndex)}
          className="absolute right-3 z-10 w-10 h-10 rounded-full bg-[#130E24]/85 hover:bg-[#7C3AED] border border-[#7C3AED]/50 text-white flex items-center justify-center shadow-xl transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Metadata & Caption Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-5 py-3.5 rounded-2xl bg-[#130E24]/90 border border-[#2E2254] flex flex-wrap items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <p data-testid="lightbox-caption" className="text-sm font-semibold text-white">
            {item.caption}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {item.exifCameraGear && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]">
                <Camera className="w-3.5 h-3.5" />
                <span>{item.exifCameraGear}</span>
              </span>
            )}
            {item.isHumanProofVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>100% Humain</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1D1636] text-xs text-[#94A3B8]">
          <Lock className="w-3.5 h-3.5 text-[#10B981]" />
          <span>URL SAS Éphémère Haute Définition</span>
        </div>
      </div>
    </div>
  );
};
