import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury } from '@/constants/theme';
import { IMG } from '@/data/travel';

type Props = {
  showBack?: boolean;
  onBack?: () => void;
  rightAvatar?: boolean;
};

export function LuxuryHeader({ showBack, onBack, rightAvatar = true }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12} accessibilityRole="button">
            <Ionicons name="chevron-back" size={22} color={Luxury.navy} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>
      <View style={styles.brand}>
        <Image
          source={require('@/assets/images/expedia logo.png')}
          style={styles.logoImage}
          contentFit="contain"
          accessibilityLabel="Expedia"
        />
      </View>
      <View style={styles.side}>
        {rightAvatar ? (
          <Image source={{ uri: IMG.profile }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 52,
    backgroundColor: Luxury.white,
  },
  side: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSpacer: { width: 36, height: 36 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Luxury.bg,
    borderWidth: 1,
    borderColor: Luxury.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minHeight: 32,
  },
  /** Official Expedia wordmark asset (icon + “Expedia”); sized to match prior header balance. */
  logoImage: {
    height: 30,
    width: 148,
    maxWidth: '100%',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Luxury.border,
  },
});
