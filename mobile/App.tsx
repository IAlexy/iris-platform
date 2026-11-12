import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { IrisColors } from './src/theme/colors';
import { Header } from './src/components/Header';
import { CircleCard } from './src/components/CircleCard';
import { PublicationCard } from './src/components/PublicationCard';
import { SocialImportModal } from './src/components/SocialImportModal';
import { ApiService } from './src/services/api';
import { CircleSummary, Publication } from './src/types';

export default function App() {
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>('');
  const [feed, setFeed] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'import' | 'qr' | 'profile'>('feed');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
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

  const handleSelectCircle = async (circleId: string) => {
    setActiveCircleId(circleId);
    setLoading(true);
    try {
      const feedData = await ApiService.getFeed(circleId);
      setFeed(feedData);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialImport = async (url: string, circleId: string) => {
    const newPub = await ApiService.importSocialPost({ postUrl: url, circleId });
    setFeed((prev) => [newPub, ...prev]);
    Alert.alert('Succès', 'Post importé et archivé dans votre cercle privé !');
  };

  const handleAddCritiquePin = async (xPercent: number, yPercent: number) => {
    if (feed.length === 0) return;
    const targetPub = feed[0];
    const newPin = await ApiService.addCritiquePin(targetPub.id, {
      xPercent,
      yPercent,
      category: 'Composition',
      comment: 'Superbe placement des lumières et contraste naturel.',
    });

    setFeed((prev) =>
      prev.map((p) =>
        p.id === targetPub.id ? { ...p, critiquePins: [...p.critiquePins, newPin] } : p
      )
    );
  };

  const activeCircle = circles.find((c) => c.id === activeCircleId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <Header
        onOpenImport={() => setImportModalVisible(true)}
        activeCircleName={activeCircle?.name}
      />

      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={IrisColors.primary} />
          <Text style={styles.loadingText}>Chiffrement des clés SAS en cours...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Circles Carousel */}
          <View style={styles.circlesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vos Cercles Privés</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>+ Nouveau</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              {circles.map((circle) => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  isSelected={circle.id === activeCircleId}
                  onSelect={() => handleSelectCircle(circle.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Feed Title */}
          <View style={styles.feedSectionHeader}>
            <View style={styles.feedTitleRow}>
              <MaterialCommunityIcons name="image-multiple" size={18} color={IrisColors.primaryLight} />
              <Text style={styles.feedTitle}>Flux du Cercle</Text>
            </View>
            {activeCircle?.policy.aiContentPolicy === 'StrictlyForbidden' && (
              <View style={styles.activePolicyBadge}>
                <Feather name="shield" size={11} color="#10B981" />
                <Text style={styles.activePolicyText}>Anti-IA Actif</Text>
              </View>
            )}
          </View>

          {/* Publications List */}
          <View style={styles.feedList}>
            {feed.map((pub) => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                onAddCritiquePin={handleAddCritiquePin}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Universal Social Import Modal */}
      <SocialImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        circles={circles}
        onImport={handleSocialImport}
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('feed')}
        >
          <Feather
            name="layers"
            size={22}
            color={activeTab === 'feed' ? IrisColors.primaryLight : IrisColors.textMuted}
          />
          <Text style={[styles.navText, activeTab === 'feed' && styles.navTextActive]}>
            Cercles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setImportModalVisible(true)}
        >
          <View style={styles.centerFab}>
            <Feather name="download-cloud" size={22} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setActiveTab('qr');
            Alert.alert('Scanner QR Pass', 'Pointez la caméra vers un pass d\'événement Iris pour rejoindre le cercle instantanément.');
          }}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={22}
            color={activeTab === 'qr' ? IrisColors.primaryLight : IrisColors.textMuted}
          />
          <Text style={[styles.navText, activeTab === 'qr' && styles.navTextActive]}>
            Pass QR
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IrisColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: IrisColors.background,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: IrisColors.accentLavender,
    fontSize: 13,
  },
  circlesSection: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: IrisColors.surfaceBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: IrisColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: IrisColors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  carousel: {
    paddingLeft: 20,
  },
  feedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  feedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedTitle: {
    color: IrisColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  activePolicyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  activePolicyText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  feedList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: IrisColors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: IrisColors.surfaceBorder,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 60,
  },
  navText: {
    fontSize: 10,
    color: IrisColors.textMuted,
    fontWeight: '600',
  },
  navTextActive: {
    color: IrisColors.primaryLight,
  },
  centerFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: IrisColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: IrisColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
});
