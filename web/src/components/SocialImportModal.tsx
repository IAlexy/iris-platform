import React, { useState } from 'react';
import { X, DownloadCloud, Shield, Check, Globe } from 'lucide-react';
import { CircleSummary } from '../types';

interface SocialImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  circles: CircleSummary[];
  onImport: (url: string, circleId: string) => Promise<void>;
}

export const SocialImportModal: React.FC<SocialImportModalProps> = ({
  isOpen,
  onClose,
  circles,
  onImport,
}) => {
  const [url, setUrl] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState(circles[0]?.id || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const detectPlatform = (text: string) => {
    const l = text.toLowerCase();
    if (l.includes('instagram.com')) return { name: 'Instagram', color: 'text-pink-500', bg: 'bg-pink-500/10' };
    if (l.includes('cara.app')) return { name: 'Cara Art', color: 'text-purple-400', bg: 'bg-purple-500/10' };
    if (l.includes('twitter.com') || l.includes('x.com')) return { name: 'X / Twitter', color: 'text-sky-400', bg: 'bg-sky-500/10' };
    if (l.includes('threads.net')) return { name: 'Threads', color: 'text-white', bg: 'bg-white/10' };
    if (l.includes('reddit.com')) return { name: 'Reddit', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return null;
  };

  const platform = detectPlatform(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !selectedCircleId) return;

    setLoading(true);
    try {
      await onImport(url, selectedCircleId);
      setUrl('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#130E24] border border-[#2E2254] rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative glow-subtle">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#A855F7]">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Social Universel</h2>
              <p className="text-xs text-[#94A3B8]">Sauvegardez un souvenir dans votre sanctuaire privé</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#DDD6FE]">Lien du post public :</label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://www.instagram.com/p/... ou cara.app/post/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#0A0812] border border-[#2E2254] rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#7C3AED]"
              />
              <Globe className="w-4 h-4 absolute right-3.5 top-3.5 text-[#94A3B8]" />
            </div>
          </div>

          {/* Platform Tag Preview */}
          {platform && (
            <div className={`p-2.5 rounded-xl border border-current/20 flex items-center gap-2 text-xs font-semibold ${platform.color} ${platform.bg}`}>
              <Check className="w-4 h-4" />
              <span>{platform.name} détecté • Attribution automatique conservée</span>
            </div>
          )}

          {/* Destination Circle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#DDD6FE]">Cercle de destination :</label>
            <select
              value={selectedCircleId}
              onChange={(e) => setSelectedCircleId(e.target.value)}
              className="w-full bg-[#0A0812] border border-[#2E2254] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
            >
              {circles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.trustTier === 'Tier2_CommunityVerified' ? 'Sanctuaire Artiste' : 'Famille'})
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-start gap-2.5 text-xs text-[#10B981]">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Les images sont transférées sur Azure Blob privé (SAS 15m), purgées de tout cookie ou traceur commercial tiers.
            </span>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#1D1636] hover:bg-[#2E2254] text-xs font-semibold text-[#DDD6FE] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:opacity-95 disabled:opacity-50 text-xs font-semibold text-white transition-opacity shadow-lg shadow-[#7C3AED]/25"
            >
              {loading ? 'Extraction en cours...' : 'Importer dans le Cercle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
