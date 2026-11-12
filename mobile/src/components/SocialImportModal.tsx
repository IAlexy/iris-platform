import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { IrisColors } from '../theme/colors';
import { CircleSummary } from '../types';

interface SocialImportModalProps {
  visible: boolean;
  onClose: () => void;
  circles: CircleSummary[];
  onImport: (url: string, circleId: string) => Promise<void>;
}

export const SocialImportModal: React.FC<SocialImportModalProps> = ({
  visible,
  onClose,
  circles,
  onImport,
}) => {
  const [url, setUrl] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState(circles[0]?.id || '');
  const [loading, setLoading] = useState(false);

  const detectPlatform = (text: string) => {
    const l = text.toLowerCase();
    if (l.includes('instagram.com')) return { name: 'Instagram', icon: 'instagram', color: '#E1306C' };
    if (l.includes('cara.app')) return { name: 'Cara Art', icon: 'palette', color: '#A855F7' };
    if (l.includes('twitter.com') || l.includes('x.com')) return { name: 'X / Twitter', icon: 'twitter', color: '#38BDF8' };
    if (l.includes('threads.net')) return { name: 'Threads', icon: 'at', color: '#FFFFFF' };
    if (l.includes('reddit.com')) return { name: 'Reddit', icon: 'reddit-alien', color: '#FF4500' };
    return null;
  };

  const platform = detectPlatform(url);

  const handleImport = async () => {
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
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Feather name="download-cloud" size={20} color={IrisColors.primaryLight} />
              <Text style={styles.modalTitle}>Import Universel</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={IrisColors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Sauvegardez n'importe quel post (Instagram, Cara, X, Reddit) dans vos cercles privés avec attribution automatique.
          </Text>

          {/* URL Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Collez le lien du post ici..."
              placeholderTextColor={IrisColors.textMuted}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {url.length > 0 && (
              <TouchableOpacity onPress={() => setUrl('')} style={styles.clearBtn}>
                <Feather name="x-circle" size={16} color={IrisColors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Detected Platform Tag */}
          {platform && (
            <View style={styles.platformBadge}>
              <FontAwesome5 name={platform.icon} size={14} color={platform.color} />
              <Text style={[styles.platformText, { color: platform.color }]}>
                {platform.name} détecté — Attribution créateur conservée
              </Text>
            </View>
          )}

          {/* Destination Circle Selector */}
          <Text style={styles.sectionLabel}>Cercle de destination :</Text>
          <View style={styles.circlesList}>
            {circles.map((c) => {
              const isSelected = selectedCircleId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.circleOption, isSelected && styles.circleOptionSelected]}
                  onPress={() => setSelectedCircleId(c.id)}
                >
                  <View style={[styles.circleIndicator, isSelected && styles.circleIndicatorActive]} />
                  <Text style={[styles.circleOptionText, isSelected && styles.circleOptionTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Features note */}
          <View style={styles.infoBox}>
            <Feather name="shield" size={14} color={IrisColors.verifiedGear} />
            <Text style={styles.infoBoxText}>
              L'image est placée dans le SAS Azure privé, nettoyée de tout tracker tiers.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.importBtn, (!url.trim() || loading) && styles.importBtnDisabled]}
            onPress={handleImport}
            disabled={!url.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={18} color="#FFFFFF" />
                <Text style={styles.importBtnText}>Importer dans l'album</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: IrisColors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: IrisColors.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: IrisColors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: IrisColors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: IrisColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IrisColors.surfaceBorder,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: IrisColors.textSecondary,
    marginBottom: 10,
  },
  circlesList: {
    gap: 8,
    marginBottom: 16,
  },
  circleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: IrisColors.surfaceElevated,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: IrisColors.surfaceBorder,
  },
  circleOptionSelected: {
    borderColor: IrisColors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  circleIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: IrisColors.textMuted,
  },
  circleIndicatorActive: {
    backgroundColor: IrisColors.primary,
  },
  circleOptionText: {
    color: IrisColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  circleOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 11,
    color: IrisColors.textSecondary,
    lineHeight: 15,
  },
  importBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: IrisColors.primary,
    height: 50,
    borderRadius: 14,
    shadowColor: IrisColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  importBtnDisabled: {
    opacity: 0.5,
  },
  importBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
