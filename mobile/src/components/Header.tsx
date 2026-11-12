import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { IrisColors } from '../theme/colors';

interface HeaderProps {
  onOpenImport: () => void;
  activeCircleName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenImport, activeCircleName }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoDot} />
        <Text style={styles.brandTitle}>iris</Text>
        <Text style={styles.circleTag}>• {activeCircleName ?? 'Cercles'}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.importButton} onPress={onOpenImport} activeOpacity={0.8}>
          <Feather name="share-2" size={16} color={IrisColors.textSecondary} />
          <Text style={styles.importButtonText}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Feather name="bell" size={20} color={IrisColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: IrisColors.background,
    borderBottomWidth: 1,
    borderBottomColor: IrisColors.surfaceBorder,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: IrisColors.primary,
    shadowColor: IrisColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: IrisColors.textPrimary,
    letterSpacing: -0.5,
  },
  circleTag: {
    fontSize: 13,
    color: IrisColors.accentLavender,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: IrisColors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: IrisColors.surfaceBorder,
  },
  importButtonText: {
    fontSize: 13,
    color: IrisColors.textSecondary,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: IrisColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IrisColors.surfaceBorder,
  },
});
