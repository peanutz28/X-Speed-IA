import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury, Fonts } from '@/constants/theme';

type Props = {
  onPress: () => void;
  /** Merged into the outer banner container (e.g. margins on stay detail vs. floating prompt). */
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

/**
 * “How was your stay?” CTA — same layout as the review prompt on stay detail screens.
 */
export function ReviewPromptBanner({ onPress, style, accessibilityHint }: Props) {
  return (
    <TouchableOpacity
      style={[styles.reviewBanner, style]}
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="How was your stay? Leave a review."
      accessibilityHint={accessibilityHint}>
      <View style={styles.reviewLeft}>
        <Text style={styles.reviewTitle}>How was your stay?</Text>
        <Text style={styles.reviewSub}>Share your experience and help other travelers.</Text>
      </View>
      <View style={styles.reviewBtn}>
        <Ionicons name="star" size={22} color={Luxury.white} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reviewBanner: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Luxury.navy,
  },
  reviewLeft: { flex: 1 },
  reviewTitle: { fontFamily: Fonts.semiBold, fontSize: 17, color: '#fff' },
  reviewSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  reviewBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Luxury.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
});
