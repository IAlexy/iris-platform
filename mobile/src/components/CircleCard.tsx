import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CircleSummary } from '../types';
import { IrisColors } from '../theme/colors';

interface CircleCardProps {
  circle: CircleSummary;
  isSelected: boolean;
  onSelect: () => void;
}

export const CircleCard: React.FC<CircleCardProps> = ({ circle, isSelected, onSelect }) => {
  const isAntiAi = circle.policy.aiContentPolicy === 'StrictlyForbidden';

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {circle.coverImageUrl && (
        <Image source={{ uri: circle.coverImageUrl }} style={styles.coverImage} />
      )}
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <View style={styles.tierBadge}>
            <Feather name="shield" size={11} color={IrisColors.accentLavender} />
            <Text style={styles.tierText}>
              {circle.trustTier === 'Tier2_CommunityVerified' ? 'Club Vérifié' : 'Cercle Privé'}
            </Text>
          </View>

          {isAntiAi && (
            <View style={styles.antiAiBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={12} color="#10B981" />
              <Text style={styles.antiAiText}>Sanctuaire Anti-IA</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomInfo}>
          <Text style={styles.name} numberOfLines={1}>{circle.name}</Text>
          <Text style={styles.stats}>
            {circle.memberCount} membres • {circle.publicationCount} œuvres
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: IrisColors.surfaceElevated,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: IrisColors.surfaceBorder,
  },
  containerSelected: {
    borderColor: IrisColors.primary,
    shadowColor: IrisColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  coverImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 8, 18, 0.65)',
    padding: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierText: {
    color: IrisColors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  antiAiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  antiAiText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomInfo: {
    marginTop: 'auto',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  stats: {
    color: IrisColors.accentLavender,
    fontSize: 11,
  },
});
