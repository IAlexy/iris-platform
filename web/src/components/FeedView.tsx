import React, { useState } from 'react';
import { 
  Camera, 
  CheckCircle, 
  ExternalLink, 
  MessageSquare, 
  Pin, 
  Lock, 
  Heart, 
  Info
} from 'lucide-react';
import { Publication, CritiquePin } from '../types';
import { MosaicPhotoGallery } from './MosaicPhotoGallery';

interface FeedViewProps {
  publications: Publication[];
  onAddCritiquePin: (pubId: string, xPercent: number, yPercent: number) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ publications, onAddCritiquePin }) => {
  const [activeCritiquePubId, setActiveCritiquePubId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<CritiquePin | null>(null);
  const [selectedMosaicPubId, setSelectedMosaicPubId] = useState<string | null>(
    publications[0]?.id ?? null
  );

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, pubId: string) => {
    if (activeCritiquePubId !== pubId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    onAddCritiquePin(pubId, Math.round(xPercent * 10) / 10, Math.round(yPercent * 10) / 10);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 max-w-6xl mx-auto w-full">
      {/* Adaptive Mosaic Gallery (AA 2x2 Left / 9 Small / LL 2x2 Right / 9 Small) */}
      <MosaicPhotoGallery
        publications={publications}
        selectedPubId={selectedMosaicPubId}
        onSelectPublication={(pubId) => setSelectedMosaicPubId(pubId)}
      />
      {publications.map((pub) => {
        const isCritiqueActive = activeCritiquePubId === pub.id;
        const mainMedia = pub.mediaAssets[0];

        return (
          <article
            key={pub.id}
            className="bg-[#130E24] border border-[#2E2254] rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-[#2E2254]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#1D1636] border border-[#7C3AED] flex items-center justify-center font-bold text-white shadow-md">
                  {pub.authorDisplayName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">{pub.authorDisplayName}</h3>
                  <p className="text-xs text-[#94A3B8]">{pub.createdAt}</p>
                </div>
              </div>

              {/* Critique Mode Toggle */}
              {pub.critiquePins.length > 0 && (
                <button
                  onClick={() => {
                    setActiveCritiquePubId(isCritiqueActive ? null : pub.id);
                    setSelectedPin(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isCritiqueActive
                      ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30'
                      : 'bg-[#1D1636] text-[#C4B5FD] border border-[#2E2254] hover:border-[#7C3AED]'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Mode Critique ({pub.critiquePins.length} annotations)</span>
                </button>
              )}
            </div>

            {/* Badges Bar (EXIF Gear + Anti-AI + Social Provenance) */}
            <div className="px-5 py-3 bg-[#0D091A] flex flex-wrap items-center gap-2.5 border-b border-[#2E2254]/30">
              {pub.exifCameraGear && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-medium">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{pub.exifCameraGear}</span>
                </div>
              )}

              {pub.isHumanProofVerified && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7] text-xs font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Création 100% Humaine Vérifiée</span>
                </div>
              )}

              {pub.originalAuthorAttribution && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#818CF8] text-xs font-medium">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{pub.originalAuthorAttribution}</span>
                </div>
              )}
            </div>

            {/* Photo Canvas with Pins */}
            <div
              className={`relative w-full aspect-[16/10] bg-black select-none ${
                isCritiqueActive ? 'cursor-crosshair' : ''
              }`}
              onClick={(e) => handleImageClick(e, pub.id)}
            >
              <img
                src={mainMedia?.readSasUrl}
                alt={pub.caption}
                className="w-full h-full object-cover"
              />

              {/* Pins on the image */}
              {isCritiqueActive &&
                pub.critiquePins.map((pin) => (
                  <button
                    key={pin.id}
                    style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPin(selectedPin?.id === pin.id ? null : pin);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${
                      selectedPin?.id === pin.id
                        ? 'bg-[#F43F5E] ring-4 ring-[#F43F5E]/40 text-white scale-110'
                        : 'bg-[#7C3AED] border-2 border-white text-white'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                ))}

              {/* Pin Tooltip */}
              {isCritiqueActive && selectedPin && (
                <div
                  style={{
                    left: `${Math.min(Math.max(selectedPin.xPercent, 15), 75)}%`,
                    top: `${Math.min(selectedPin.yPercent + 8, 80)}%`,
                  }}
                  className="absolute z-20 -translate-x-1/2 bg-[#130E24]/95 backdrop-blur-md border border-[#7C3AED] p-3.5 rounded-xl shadow-2xl max-w-xs text-xs text-left"
                >
                  <p className="font-bold text-[#A855F7] mb-1">
                    {selectedPin.authorDisplayName} • <span className="text-[#DDD6FE]">{selectedPin.category}</span>
                  </p>
                  <p className="text-white leading-relaxed">{selectedPin.comment}</p>
                </div>
              )}

              {isCritiqueActive && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#7C3AED]/40 text-xs text-[#DDD6FE] flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[#A855F7]" />
                  <span>Cliquez sur l'image pour épingler une critique technique</span>
                </div>
              )}
            </div>

            {/* Caption & Actions */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#DDD6FE] leading-relaxed">
                <span className="font-semibold text-white">{pub.authorDisplayName} </span>
                {pub.caption}
              </p>

              <div className="pt-3 border-t border-[#2E2254]/50 flex items-center justify-between text-xs text-[#94A3B8]">
                <div className="flex items-center gap-5">
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>Apprécier</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Commentaires</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1D1636] text-[11px] text-[#94A3B8]">
                  <Lock className="w-3 h-3 text-[#10B981]" />
                  <span>Chiffré SAS 15m (Anti-Scraping)</span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
