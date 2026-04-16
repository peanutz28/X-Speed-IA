import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury, Fonts } from '@/constants/theme';
import { FOLLOWUP_OPTIONS, REVIEW_CATEGORIES, IMG } from '@/data/travel';
import { LuxuryHeader } from '@/components/luxury-header';

export default function FollowupScreen() {
  const { stayId, categories } = useLocalSearchParams<{ stayId: string; categories: string }>();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();

  const categoryKeys = useMemo(() => (categories ?? '').split(',').filter(Boolean), [categories]);
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [allAnswers, setAllAnswers] = useState<Record<string, number[]>>({});

  const currentKey = categoryKeys[stepIdx];
  const currentCategory = REVIEW_CATEGORIES.find((c) => c.key === currentKey);
  const options = FOLLOWUP_OPTIONS[currentKey] ?? [];
  const totalSteps = categoryKeys.length;

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleContinue = () => {
    setAllAnswers((prev) => ({ ...prev, [currentKey]: Array.from(selected) }));

    if (stepIdx + 1 >= totalSteps) {
      router.replace('/(tabs)' as Href);
    } else {
      setStepIdx((i) => i + 1);
      setSelected(new Set());
    }
  };

  const handleSkip = () => {
    if (stepIdx + 1 >= totalSteps) {
      router.replace('/(tabs)' as Href);
    } else {
      setStepIdx((i) => i + 1);
      setSelected(new Set());
    }
  };

  const label = currentKey ? currentKey.charAt(0).toUpperCase() + currentKey.slice(1) : '';

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      <LuxuryHeader showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero with category image */}
        {currentCategory && (
          <View style={styles.heroBanner}>
            <Image source={{ uri: currentCategory.image }} style={styles.heroImg} contentFit="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Ionicons name="chatbubbles-outline" size={28} color="#fff" />
              <Text style={styles.heroTitle}>Tell us more</Text>
            </View>
          </View>
        )}

        {/* Step indicator */}
        {totalSteps > 1 && (
          <Text style={styles.step}>Question {stepIdx + 1} of {totalSteps}</Text>
        )}

        <View style={styles.topicChip}>
          <Ionicons name="chatbubble-outline" size={16} color={Luxury.gold} />
          <Text style={styles.topicTxt}>{label}</Text>
        </View>

        <Text style={styles.heading}>What felt off?</Text>
        <Text style={styles.sub}>Select any that apply — this helps other travelers.</Text>

        {options.map((opt, i) => {
          const active = selected.has(i);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, active && styles.optionActive]}
              activeOpacity={0.85}
              onPress={() => toggle(i)}>
              <Ionicons
                name={active ? 'checkbox' : 'square-outline'}
                size={22}
                color={active ? Luxury.navy : Luxury.textMuted}
              />
              <Text style={[styles.optTxt, active && styles.optTxtActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.btn, selected.size === 0 && styles.btnDisabled]}
          activeOpacity={0.85}
          onPress={handleContinue}>
          <Text style={styles.btnTxt}>
            {stepIdx + 1 >= totalSteps ? 'Submit review' : 'Continue'}
          </Text>
        </TouchableOpacity>
        <View style={styles.footLinks}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.link}>Skip this question</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)' as Href)}>
            <Text style={[styles.link, styles.linkDanger]}>End review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Luxury.white },
  scroll: { paddingHorizontal: 24, paddingBottom: 20 },

  heroBanner: {
    marginHorizontal: -24,
    height: 140,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(25,30,59,0.55)' },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroTitle: { fontFamily: Fonts.instrumentSerif, fontSize: 22, color: '#fff' },

  step: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Luxury.textMuted,
    marginBottom: 12,
  },

  topicChip: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Luxury.goldDim,
    borderWidth: 1,
    borderColor: 'rgba(212,150,10,0.25)',
    marginBottom: 20,
  },
  topicTxt: { fontFamily: Fonts.semiBold, fontSize: 13, color: Luxury.goldBright },

  heading: { fontFamily: Fonts.instrumentSerif, fontSize: 26, color: Luxury.text },
  sub: { fontFamily: Fonts.regular, fontSize: 15, color: Luxury.textSecondary, marginTop: 8, marginBottom: 26 },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 16,
    backgroundColor: Luxury.bg,
    borderWidth: 1,
    borderColor: Luxury.border,
    marginBottom: 12,
  },
  optionActive: {
    borderColor: Luxury.navy,
    backgroundColor: 'rgba(30,58,95,0.06)',
  },
  optTxt: { fontFamily: Fonts.medium, fontSize: 15, color: Luxury.text, flex: 1 },
  optTxtActive: { color: Luxury.navy },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Luxury.borderSubtle,
    backgroundColor: Luxury.white,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Luxury.navy,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnTxt: { fontFamily: Fonts.semiBold, fontSize: 16, color: '#fff' },
  footLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  link: { fontFamily: Fonts.medium, fontSize: 14, color: Luxury.textSecondary },
  linkDanger: { color: Luxury.danger },
});
