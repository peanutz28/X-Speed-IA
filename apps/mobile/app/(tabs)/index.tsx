import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury, Fonts } from '@/constants/theme';
import {
  RECENT_SEARCHES,
  VIEWED_PROPERTIES,
  RECENT_STAYS_HOME,
} from '@/data/travel';
import { LuxuryHeader } from '@/components/luxury-header';

const CATEGORIES = [
  { id: 'stays', label: 'Stays', icon: 'bed-outline' as const },
  { id: 'flights', label: 'Flights', icon: 'airplane-outline' as const },
  { id: 'cars', label: 'Cars', icon: 'car-outline' as const },
  { id: 'packages', label: 'Packages', icon: 'gift-outline' as const },
];

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      <LuxuryHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hi, Jaden.</Text>

        {/* Category quick-links */}
        <View style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.id} style={styles.catBtn} activeOpacity={0.85}>
              <View style={styles.catIcon}>
                <Ionicons name={c.icon} size={26} color={Luxury.navy} />
              </View>
              <Text style={styles.catLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent searches */}
        <Text style={styles.section}>Your recent searches</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {RECENT_SEARCHES.map((s) => (
            <TouchableOpacity key={s.id} style={styles.searchCard} activeOpacity={0.9}>
              <Image source={{ uri: s.image }} style={styles.searchImg} contentFit="cover" />
              <View style={styles.searchBody}>
                <Text style={styles.searchHeadline}>
                  {s.type} in {s.destination}
                </Text>
                <Text style={styles.searchMeta}>{s.dates}</Text>
                <Text style={styles.searchMeta}>{s.guests}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recently viewed properties */}
        <Text style={styles.section}>Your recently viewed properties</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {VIEWED_PROPERTIES.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.propCard}
              activeOpacity={0.92}
              onPress={() => router.push('/trip/cancun-dec-2025' as Href)}>
              <View style={styles.propImgWrap}>
                <Image source={{ uri: p.image }} style={styles.propImg} contentFit="cover" />
                <TouchableOpacity style={styles.heartBtn} hitSlop={8}>
                  <Ionicons name={p.fav ? 'heart' : 'heart-outline'} size={18} color={p.fav ? '#EF4444' : '#fff'} />
                </TouchableOpacity>
              </View>
              <View style={styles.propPad}>
                <Text style={styles.propName} numberOfLines={2}>{p.name}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingNum}>{p.rating}/10</Text>
                  <Text style={styles.reviewCount}>({p.reviews.toLocaleString()})</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent stays */}
        <Text style={styles.section}>Recent stays</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {RECENT_STAYS_HOME.map((st) => (
            <TouchableOpacity
              key={st.id}
              style={styles.stayCard}
              activeOpacity={0.92}
              onPress={() => router.push(`/stay/${st.id}` as Href)}>
              <Image source={{ uri: st.image }} style={styles.stayImg} contentFit="cover" />
              <View style={styles.stayGrad} />
              <View style={styles.stayText}>
                <Text style={styles.stayName}>{st.name}</Text>
                <Text style={styles.stayDates}>{st.dates}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Luxury.white },
  scroll: { paddingBottom: 32 },

  greeting: {
    fontFamily: Fonts.regular,
    fontSize: 22,
    color: Luxury.text,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },

  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  catBtn: { alignItems: 'center', width: 72 },
  catIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Luxury.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Luxury.textSecondary, marginTop: 8 },

  section: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Luxury.text,
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 4,
  },
  hScroll: { paddingLeft: 20, paddingRight: 8, marginBottom: 26 },

  searchCard: {
    width: 260,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Luxury.white,
    borderWidth: 1,
    borderColor: Luxury.border,
  },
  searchImg: { width: '100%', height: 100 },
  searchBody: { padding: 14 },
  searchHeadline: { fontFamily: Fonts.semiBold, fontSize: 15, color: Luxury.text },
  searchMeta: { fontFamily: Fonts.regular, fontSize: 13, color: Luxury.textSecondary, marginTop: 3 },

  propCard: {
    width: 180,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Luxury.white,
    borderWidth: 1,
    borderColor: Luxury.border,
  },
  propImgWrap: { position: 'relative' },
  propImg: { width: '100%', height: 130 },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propPad: { padding: 12 },
  propName: { fontFamily: Fonts.semiBold, fontSize: 14, color: Luxury.text, minHeight: 38 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingNum: { fontFamily: Fonts.bold, fontSize: 14, color: Luxury.text },
  reviewCount: { fontFamily: Fonts.regular, fontSize: 12, color: Luxury.textMuted },

  stayCard: {
    width: 220,
    height: 160,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  stayImg: { ...StyleSheet.absoluteFillObject },
  stayGrad: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  stayText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14 },
  stayName: { fontFamily: Fonts.semiBold, fontSize: 15, color: '#fff' },
  stayDates: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
});
