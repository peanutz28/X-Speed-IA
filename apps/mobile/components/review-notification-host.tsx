import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRouter, useSegments, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ReviewPromptBanner } from '@/components/review-prompt-banner';
import { Luxury } from '@/constants/theme';
import { SIMULATED_REVIEW_PROMPT_STAY_ID } from '@/data/travel';

const TAB_BAR_HEIGHT = 52;

function shouldShowOnCurrentRoute(segments: string[]): boolean {
  if (segments.includes('stay')) return false;
  if (segments.includes('review')) return false;
  if (segments.includes('trip')) return false;
  if (segments.includes('modal')) return false;
  return true;
}

/**
 * Simulated push-style review reminder: same banner as stay detail, pinned above the tab bar.
 * Tap → full review flow for {@link SIMULATED_REVIEW_PROMPT_STAY_ID}.
 */
export function ReviewNotificationHost() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const allowedHere = useMemo(() => shouldShowOnCurrentRoute(segments as string[]), [segments]);
  const visible = allowedHere && !dismissed;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  useEffect(() => {
    if (visible) return;
    opacity.setValue(0);
    translateY.setValue(20);
  }, [visible, opacity, translateY]);

  const bottomOffset = TAB_BAR_HEIGHT + insets.bottom + 10;

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: bottomOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <View style={styles.inner}>
        <Pressable
          style={styles.dismiss}
          onPress={() => setDismissed(true)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss review reminder">
          <Ionicons name="close" size={20} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <ReviewPromptBanner
          onPress={() => {
            setDismissed(true);
            router.push(`/review/${SIMULATED_REVIEW_PROMPT_STAY_ID}` as Href);
          }}
          accessibilityHint="Opens the review screen for your recent stay."
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  inner: {
    position: 'relative',
  },
  dismiss: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Luxury.navy,
    borderWidth: 2,
    borderColor: Luxury.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
