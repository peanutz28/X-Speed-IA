import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Luxury, Fonts } from '@/constants/theme';
import { REVIEW_CATEGORIES, getStayForReview } from '@/data/travel';
import { LuxuryHeader } from '@/components/luxury-header';
import { AiMicButton } from '@/components/ai-mic-button';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 64;
const SWIPE_THRESHOLD = SCREEN_W * 0.25;
const FLY_OUT_MS = 300;

type Verdict = 'like' | 'dislike' | 'na';

export default function ReviewSwipeScreen() {
  const { stayId } = useLocalSearchParams<{ stayId: string }>();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const stay = getStayForReview(stayId ?? '');

  const [idx, setIdx] = useState(0);
  const verdictsRef = useRef<Record<string, Verdict>>({});
  const swiping = useRef(false);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);

  const current = REVIEW_CATEGORIES[idx];
  const total = REVIEW_CATEGORIES.length;

  const finishAllSwipes = useCallback(() => {
    const disliked = Object.entries(verdictsRef.current)
      .filter(([, v]) => v === 'dislike')
      .map(([k]) => k);

    if (disliked.length > 0) {
      router.replace(
        `/review/${stayId}/followup?categories=${disliked.join(',')}` as Href
      );
    } else {
      router.replace('/(tabs)' as Href);
    }
  }, [stayId, router]);

  const advanceCard = useCallback(
    (v: Verdict, categoryKey: string) => {
      verdictsRef.current[categoryKey] = v;

      const nextIdx = idx + 1;
      if (nextIdx >= total) {
        finishAllSwipes();
        return;
      }

      tx.value = 0;
      ty.value = 0;
      rot.value = 0;
      opacity.value = 0;

      setIdx(nextIdx);

      requestAnimationFrame(() => {
        opacity.value = withTiming(1, { duration: 200 });
        swiping.current = false;
      });
    },
    [idx, total, finishAllSwipes, tx, ty, rot, opacity]
  );

  const flyOut = useCallback(
    (dir: 'left' | 'right' | 'down', v: Verdict) => {
      if (swiping.current || !current) return;
      swiping.current = true;

      const toX = dir === 'left' ? -SCREEN_W * 1.3 : dir === 'right' ? SCREEN_W * 1.3 : 0;
      const toY = dir === 'down' ? 500 : 0;
      const toRot = dir === 'left' ? -20 : dir === 'right' ? 20 : 0;
      const key = current.key;

      tx.value = withTiming(toX, { duration: FLY_OUT_MS, easing: Easing.in(Easing.ease) });
      ty.value = withTiming(toY, { duration: FLY_OUT_MS, easing: Easing.in(Easing.ease) });
      rot.value = withTiming(toRot, { duration: FLY_OUT_MS, easing: Easing.in(Easing.ease) });

      opacity.value = withDelay(
        FLY_OUT_MS - 50,
        withTiming(0, { duration: 50 }, () => {
          runOnJS(advanceCard)(v, key);
        })
      );
    },
    [current, tx, ty, rot, opacity, advanceCard]
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .activeOffsetY([-15, 15])
    .onUpdate((e) => {
      if (swiping.current) return;
      tx.value = e.translationX;
      ty.value = e.translationY;
      rot.value = (e.translationX / SCREEN_W) * 18;
    })
    .onEnd((e) => {
      if (swiping.current) return;
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(flyOut)('left', 'dislike');
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(flyOut)('right', 'like');
      } else if (e.translationY > 100) {
        runOnJS(flyOut)('down', 'na');
      } else {
        tx.value = withTiming(0, { duration: 200 });
        ty.value = withTiming(0, { duration: 200 });
        rot.value = withTiming(0, { duration: 200 });
      }
    });

  const cardAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  const likeIndicator = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(tx.value / (SWIPE_THRESHOLD * 0.8), 0), 1),
  }));
  const dislikeIndicator = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(-tx.value / (SWIPE_THRESHOLD * 0.8), 0), 1),
  }));
  const naIndicator = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(ty.value / 80, 0), 1),
  }));

  if (!stay || !current) {
    return (
      <View style={[styles.screen, { paddingTop: top }]}>
        <LuxuryHeader showBack onBack={() => router.back()} />
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={56} color={Luxury.gold} />
          <Text style={styles.emptyTitle}>All done!</Text>
          <Text style={styles.emptyTxt}>Thanks for your review.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      <LuxuryHeader showBack onBack={() => router.back()} />
      <Text style={styles.title}>{stay.propertyName}</Text>
      <Text style={styles.subtitle}>{idx + 1} of {total}</Text>

      <View style={styles.dots}>
        {REVIEW_CATEGORIES.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive, i < idx && styles.dotDone]} />
        ))}
      </View>

      <View style={styles.cardArea}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, cardAnim]}>
            <Image source={{ uri: current.image }} style={styles.cardImg} contentFit="cover" />
            <View style={styles.cardGrad} />
            <Text style={styles.cardLabel}>{current.label}</Text>

            <Animated.View style={[styles.indicator, styles.indicatorLike, likeIndicator]}>
              <Ionicons name="heart" size={32} color="#fff" />
            </Animated.View>
            <Animated.View style={[styles.indicator, styles.indicatorDislike, dislikeIndicator]}>
              <Ionicons name="close" size={32} color="#fff" />
            </Animated.View>
            <Animated.View style={[styles.indicator, styles.indicatorNa, naIndicator]}>
              <Text style={styles.naText}>N/A</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.dislikeBtn]}
          onPress={() => flyOut('left', 'dislike')}
          activeOpacity={0.85}>
          <Ionicons name="close" size={28} color={Luxury.danger} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.naBtn]}
          onPress={() => flyOut('down', 'na')}
          activeOpacity={0.85}>
          <Ionicons name="remove" size={20} color={Luxury.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => flyOut('right', 'like')}
          activeOpacity={0.85}>
          <Ionicons name="heart" size={26} color={Luxury.success} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingBottom: bottom + 8 }}>
        <AiMicButton onRecordingComplete={(uri) => console.log('voice note:', uri)} />
      </View>
    </View>
  );
}

const HALF_CARD = (SCREEN_W - 64) / 2 - 32;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Luxury.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 22, color: Luxury.text },
  emptyTxt: { fontFamily: Fonts.regular, fontSize: 15, color: Luxury.textSecondary, textAlign: 'center' },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Luxury.text,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Luxury.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Luxury.border },
  dotActive: { backgroundColor: Luxury.gold, width: 24, borderRadius: 4 },
  dotDone: { backgroundColor: Luxury.navy },

  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: CARD_W,
    height: CARD_W * 1.28,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Luxury.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: Luxury.border,
  },
  cardImg: { ...StyleSheet.absoluteFillObject },
  cardGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  cardLabel: {
    position: 'absolute',
    bottom: 28,
    left: 24,
    right: 24,
    fontFamily: Fonts.bold,
    fontSize: 30,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  indicator: {
    position: 'absolute',
    top: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  indicatorLike: {
    right: 20,
    backgroundColor: 'rgba(22,163,74,0.85)',
    borderColor: '#fff',
  },
  indicatorDislike: {
    left: 20,
    backgroundColor: 'rgba(239,68,68,0.85)',
    borderColor: '#fff',
  },
  indicatorNa: {
    top: 20,
    alignSelf: 'center',
    left: HALF_CARD,
    backgroundColor: 'rgba(107,114,128,0.85)',
    borderColor: '#fff',
  },
  naText: { fontFamily: Fonts.bold, fontSize: 14, color: '#fff' },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    marginBottom: 6,
  },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dislikeBtn: { borderColor: Luxury.danger, backgroundColor: Luxury.white },
  likeBtn: { borderColor: Luxury.success, backgroundColor: Luxury.white },
  naBtn: { borderColor: Luxury.border, backgroundColor: Luxury.white, width: 48, height: 48, borderRadius: 24 },
});
