import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Publication, CritiquePin } from '../types';
import { IrisColors } from '../theme/colors';

interface PublicationCardProps {
  publication: Publication;
  onAddCritiquePin?: (xPercent: number, yPercent: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PublicationCard: React.FC<PublicationCardProps> = ({ publication, onAddCritiquePin }) => {
  const [showCritiqueMode, setShowCritiqueMode] = useState(false);
  const [activePin, setActivePin] = useState<CritiquePin | null>(null);

  const mainMedia = publication.mediaAssets[0];

  const handleImagePress = (event: any) => {
    if (!showCritiqueMode || !onAddCritiquePin) return;

    const { locationX, locationY } = event.nativeEvent;
    const xPercent = (locationX / SCREEN_WIDTH) * 100;
    const yPercent = (locationY / (SCREEN_WIDTH * 0.75)) * 100;

    onAddCritiquePin(xPercent, yPercent);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{publication.authorDisplayName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{publication.authorDisplayName}</Text>
            <Text style={styles.timestamp}>{publication.createdAt}</Text>
          </View>
        </View>

        {publication.critiquePins.length > 0 && (
          <TouchableOpacity
            style={[styles.critiqueToggle, showCritiqueMode && styles.critiqueToggleActive]}
            onPress={() => setShowCritiqueMode(!showCritiqueMode)}
          >
            <MaterialCommunityIcons
              name="pin-outline"
              size={14}
              color={showCritiqueMode ? '#FFFFFF' : IrisColors.accentLavender}
            />
            <Text style={[styles.critiqueToggleText, showCritiqueMode && styles.critiqueToggleTextActive]}>
              Critiques ({publication.critiquePins.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Badges Bar (Anti-AI Gear + Provenance) */}
      <View style={styles.badgesContainer}>
        {publication.exifCameraGear && (
          <View style={styles.gearBadge}>
            <Feather name="camera" size={12} color={IrisColors.verifiedGear} />
            <Text style={styles.gearBadgeText}>{publication.exifCameraGear}</Text>
          </View>
        )}

        {publication.isHumanProofVerified && (
          <View style={styles.humanBadge}>
            <Feather name="check-circle" size={12} color={IrisColors.humanProof} />
            <Text style={styles.humanBadgeText}>100% Humain</Text>
          </View>
        )}

        {publication.originalAuthorAttribution && (
          <View style={styles.importBadge}>
            <Feather name="external-link" size={12} color={IrisColors.socialImport} />
            <Text style={styles.importBadgeText}>{publication.originalAuthorAttribution}</Text>
          </View>
        )}
      </View>

      {/* Main Photo with Critique Pins Overlay */}
      <TouchableOpacity
        activeOpacity={showCritiqueMode ? 0.9 : 1}
        onPress={handleImagePress}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: mainMedia?.readSasUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Critique Pins */}
        {showCritiqueMode &&
          publication.critiquePins.map((pin) => (
            <TouchableOpacity
              key={pin.id}
              style={[
                styles.pinMarker,
                { left: `${pin.xPercent}%`, top: `${pin.yPercent}%` },
                activePin?.id === pin.id && styles.pinMarkerActive,
              ]}
              onPress={() => setActivePin(activePin?.id === pin.id ? null : pin)}
            >
              <MaterialCommunityIcons name="pin" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ))}

        {/* Tooltip for Active Pin */}
        {activePin && (
          <View style={[styles.pinTooltip, { top: `${Math.min(activePin.yPercent + 6, 75)}%` }]}>
            <Text style={styles.pinAuthor}>{activePin.authorDisplayName} ({activePin.category})</Text>
            <Text style={styles.pinComment}>{activePin.comment}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption & Footer */}
      <View style={styles.footer}>
        <Text style={styles.caption}>
          <Text style={styles.captionAuthor}>{publication.authorDisplayName} </Text>
          {publication.caption}
        </Text>

        <View style={styles.interactionRow}>
          <View style={styles.interactionActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="heart" size={18} color={IrisColors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="message-circle" size={18} color={IrisColors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="bookmark" size={18} color={IrisColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.encryptedTag}>
            <Feather name="lock" size={11} color={IrisColors.textMuted} />
            <Text style={styles.encryptedText}>SAS 15m</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: IrisColors.cardBackground,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: IrisColors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: IrisColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: IrisColors.primary,
  },
  avatarText: {
    color: IrisColors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  authorName: {
    color: IrisColors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    color: IrisColors.textMuted,
    fontSize: 12,
  },
  critiqueToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: IrisColors.surfaceElevated,
    borderWidth: 1,
    borderColor: IrisColors.surfaceBorder,
  },
  critiqueToggleActive: {
    backgroundColor: IrisColors.primary,
    borderColor: IrisColors.primaryLight,
  },
  critiqueToggleText: {
    fontSize: 12,
    color: IrisColors.textSecondary,
    fontWeight: '600',
  },
  critiqueToggleTextActive: {
    color: '#FFFFFF',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  gearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  gearBadgeText: {
    fontSize: 11,
    color: IrisColors.verifiedGear,
    fontWeight: '600',
  },
  humanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  humanBadgeText: {
    fontSize: 11,
    color: IrisColors.humanProof,
    fontWeight: '600',
  },
  importBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  importBadgeText: {
    fontSize: 11,
    color: IrisColors.socialImport,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.75,
    position: 'relative',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pinMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: IrisColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  pinMarkerActive: {
    backgroundColor: IrisColors.aiFlagged,
    transform: [{ scale: 1.2 }, { translateX: -12 }, { translateY: -12 }],
  },
  pinTooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(19, 14, 36, 0.95)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IrisColors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  pinAuthor: {
    color: IrisColors.accentLavender,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  pinComment: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    padding: 14,
  },
  caption: {
    color: IrisColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  captionAuthor: {
    color: IrisColors.textPrimary,
    fontWeight: '700',
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: IrisColors.surfaceBorder,
    paddingTop: 10,
  },
  interactionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  encryptedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: IrisColors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  encryptedText: {
    fontSize: 10,
    color: IrisColors.textMuted,
    fontWeight: '600',
  },
});
