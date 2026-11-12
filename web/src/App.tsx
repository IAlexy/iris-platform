import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { CircleInspector } from './components/CircleInspector';
import { SocialImportModal } from './components/SocialImportModal';
import { ApiService } from './services/api';
import { CircleSummary, Publication } from './types';
import { Loader2 } from 'lucide-react';

export function App() {
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>('');
  const [feed, setFeed] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const circleList = await ApiService.getCircles();
      setCircles(circleList);
      if (circleList.length > 0) {
        const firstId = circleList[0].id;
        setActiveCircleId(firstId);
        const feedData = await ApiService.getFeed(firstId);
        setFeed(feedData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCircle = async (id: string) => {
    setActiveCircleId(id);
    const feedData = await ApiService.getFeed(id);
    setFeed(feedData);
  };

  const handleSocialImport = async (url: string, circleId: string) => {
    const newPub = await ApiService.importSocialPost({ postUrl: url, circleId });
    setFeed((prev) => [newPub, ...prev]);
  };

  const handleAddCritiquePin = async (pubId: string, xPercent: number, yPercent: number) => {
    const newPin = await ApiService.addCritiquePin(pubId, {
      xPercent,
      yPercent,
      category: 'Composition',
      comment: 'Superbe placement géométrique et gestion des contrastes.',
    });

    setFeed((prev) =>
      prev.map((p) =>
        p.id === pubId ? { ...p, critiquePins: [...p.critiquePins, newPin] } : p
      )
    );
  };

  const activeCircle = circles.find((c) => c.id === activeCircleId);

  return (
    <div className="flex h-screen bg-[#0A0812] text-white overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        circles={circles}
        activeCircleId={activeCircleId}
        onSelectCircle={handleSelectCircle}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenNewCircle={() => alert('Créateur de cercle disponible dans le prochain sprint')}
      />

      {/* Main Studio Center Feed */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 px-8 border-b border-[#2E2254] flex items-center justify-between shrink-0 bg-[#0A0812]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight">{activeCircle?.name}</h1>
            <span className="text-xs text-[#DDD6FE]/60">• Flux Privé Déchiffré</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1D1636] border border-[#7C3AED]/40 hover:border-[#7C3AED] text-xs font-semibold text-[#DDD6FE] hover:text-white transition-all shadow-sm"
            >
              + Importer Social
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#A855F7]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs text-[#DDD6FE]/70">Déchiffrement des SAS Tokens Azure...</p>
          </div>
        ) : (
          <FeedView publications={feed} onAddCritiquePin={handleAddCritiquePin} />
        )}
      </main>

      {/* Right Column Inspector */}
      <CircleInspector
        circle={activeCircle}
        onQuickImport={(url) => handleSocialImport(url, activeCircleId)}
      />

      {/* Universal Import Modal */}
      <SocialImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        circles={circles}
        onImport={handleSocialImport}
      />
    </div>
  );
}

export default App;
