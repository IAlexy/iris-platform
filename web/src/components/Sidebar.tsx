import React from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  PlusCircle, 
  Settings, 
  Share2, 
  Lock
} from 'lucide-react';
import { CircleSummary } from '../types';

interface SidebarProps {
  circles: CircleSummary[];
  activeCircleId: string;
  onSelectCircle: (id: string) => void;
  onOpenImport: () => void;
  onOpenNewCircle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  circles,
  activeCircleId,
  onSelectCircle,
  onOpenImport,
  onOpenNewCircle,
}) => {
  return (
    <aside className="w-72 bg-[#0A0812] border-r border-[#2E2254] flex flex-col justify-between p-5 select-none h-screen sticky top-0">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center glow-amethyst">
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              iris <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#A855F7] border border-[#7C3AED]/40">Studio</span>
            </span>
            <p className="text-xs text-[#DDD6FE]/60 font-medium">Cercles Visuels Privés</p>
          </div>
        </div>

        {/* Action Button: Universal Import */}
        <button
          onClick={onOpenImport}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white font-semibold text-sm shadow-lg shadow-[#7C3AED]/25 hover:opacity-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Importer un Post</span>
        </button>

        {/* Navigation Sections */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]/60">Mes Cercles</p>
          <div className="space-y-1 mt-2">
            {circles.map((c) => {
              const isSelected = c.id === activeCircleId;
              const isAntiAi = c.policy.aiContentPolicy === 'StrictlyForbidden';

              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCircle(c.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-sm transition-all ${
                    isSelected
                      ? 'bg-[#1D1636] text-white border border-[#7C3AED]/60 font-medium shadow-sm'
                      : 'text-[#DDD6FE]/80 hover:bg-[#130E24] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-[#7C3AED] glow-amethyst' : 'bg-[#94A3B8]/40'
                      }`}
                    />
                    <span className="truncate">{c.name}</span>
                  </div>

                  {isAntiAi && (
                    <span title="Sanctuaire Anti-IA actif" className="text-[#10B981] ml-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-1 pt-2">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]/60">Espace Privé</p>
          <div className="space-y-0.5 mt-2">
            <button
              onClick={onOpenNewCircle}
              className="w-full px-3.5 py-2 rounded-lg flex items-center gap-3 text-sm text-[#DDD6FE]/70 hover:bg-[#130E24] hover:text-white transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#8B5CF6]" />
              <span>Créer un Cercle</span>
            </button>
            <button className="w-full px-3.5 py-2 rounded-lg flex items-center gap-3 text-sm text-[#DDD6FE]/70 hover:bg-[#130E24] hover:text-white transition-all">
              <QrCode className="w-4 h-4 text-[#DDD6FE]/60" />
              <span>Pass Événement (QR)</span>
            </button>
            <button className="w-full px-3.5 py-2 rounded-lg flex items-center gap-3 text-sm text-[#DDD6FE]/70 hover:bg-[#130E24] hover:text-white transition-all">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Trust & Safety Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="pt-4 border-t border-[#2E2254] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1D1636] border border-[#7C3AED] flex items-center justify-center font-bold text-sm text-white">
            A
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Alexy D.</p>
            <p className="text-[11px] text-[#10B981] flex items-center gap-1 font-medium">
              <Lock className="w-2.5 h-2.5" /> Clé Azure Active
            </p>
          </div>
        </div>
        <button className="text-[#DDD6FE]/50 hover:text-white transition-all p-1.5 rounded-lg hover:bg-[#130E24]">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
