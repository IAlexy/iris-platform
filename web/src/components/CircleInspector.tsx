import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Camera, 
  MapPinOff, 
  Sparkles, 
  Share2, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { CircleSummary } from '../types';

interface CircleInspectorProps {
  circle?: CircleSummary;
  onQuickImport: (url: string) => Promise<void>;
}

export const CircleInspector: React.FC<CircleInspectorProps> = ({ circle, onQuickImport }) => {
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);

  if (!circle) return null;

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setImporting(true);
    try {
      await onQuickImport(url);
      setUrl('');
    } finally {
      setImporting(false);
    }
  };

  const isAntiAi = circle.policy.aiContentPolicy === 'StrictlyForbidden';

  return (
    <aside className="w-80 bg-[#0A0812] border-l border-[#2E2254] p-5 space-y-6 select-none h-screen sticky top-0 overflow-y-auto hidden xl:block">
      {/* Circle Card Overview */}
      <div className="bg-[#130E24] border border-[#2E2254] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A855F7] px-2 py-0.5 rounded bg-[#7C3AED]/15 border border-[#7C3AED]/30">
            {circle.trustTier === 'Tier2_CommunityVerified' ? 'Tier 2 • Club Vérifié' : 'Tier 1 • Privé'}
          </span>
          <span className="text-xs text-[#94A3B8] flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {circle.memberCount}
          </span>
        </div>

        <h2 className="font-bold text-base text-white">{circle.name}</h2>
        <p className="text-xs text-[#DDD6FE]/70 leading-relaxed">{circle.description}</p>
      </div>

      {/* Quick Social Import Box */}
      <div className="bg-gradient-to-b from-[#130E24] to-[#1D1636] border border-[#7C3AED]/40 rounded-2xl p-4 space-y-3 glow-subtle">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Share2 className="w-4 h-4 text-[#A855F7]" />
          <span>Import Social Express</span>
        </div>
        <p className="text-xs text-[#DDD6FE]/70">
          Collez une URL Instagram, Cara, X ou Reddit pour l'archiver dans ce cercle :
        </p>
        <form onSubmit={handleImportSubmit} className="space-y-2">
          <input
            type="url"
            placeholder="https://instagram.com/p/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-[#0A0812] border border-[#2E2254] rounded-xl px-3 py-2 text-xs text-white placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#7C3AED]"
          />
          <button
            type="submit"
            disabled={!url.trim() || importing}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#8B5CF6] disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md"
          >
            {importing ? (
              <span>Extraction en cours...</span>
            ) : (
              <>
                <span>Archiver dans le Cercle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Policy Engine Breakdown */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]/60">
          Règles Actives (CirclePolicy)
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-[#130E24] border border-[#2E2254] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className={`w-4 h-4 ${isAntiAi ? 'text-[#10B981]' : 'text-[#94A3B8]'}`} />
              <div>
                <p className="font-semibold text-white">Filtre Anti-IA</p>
                <p className="text-[11px] text-[#94A3B8]">
                  {isAntiAi ? 'Interdiction stricte + C2PA' : 'Autorisé avec badge'}
                </p>
              </div>
            </div>
            {isAntiAi && <Check className="w-4 h-4 text-[#10B981]" />}
          </div>

          <div className="p-3 rounded-xl bg-[#130E24] border border-[#2E2254] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-[#8B5CF6]" />
              <div>
                <p className="font-semibold text-white">Preuve Matériel (EXIF)</p>
                <p className="text-[11px] text-[#94A3B8]">Extraction optique & capteur</p>
              </div>
            </div>
            <Check className="w-4 h-4 text-[#10B981]" />
          </div>

          <div className="p-3 rounded-xl bg-[#130E24] border border-[#2E2254] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPinOff className="w-4 h-4 text-[#F43F5E]" />
              <div>
                <p className="font-semibold text-white">Nettoyage GPS</p>
                <p className="text-[11px] text-[#94A3B8]">Suppression auto des coordonnées</p>
              </div>
            </div>
            <Check className="w-4 h-4 text-[#10B981]" />
          </div>

          <div className="p-3 rounded-xl bg-[#130E24] border border-[#2E2254] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#A855F7]" />
              <div>
                <p className="font-semibold text-white">Mode Critique</p>
                <p className="text-[11px] text-[#94A3B8]">Annotations sur coordonnées</p>
              </div>
            </div>
            <Check className="w-4 h-4 text-[#10B981]" />
          </div>
        </div>
      </div>
    </aside>
  );
};
