import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury, Fonts } from '@/constants/theme';
import { getTrip } from '@/data/travel';
import { LuxuryHeader } from '@/components/luxury-header';

const { width: SCREEN_W } = Dimensions.get('window');
const TABS = ['Itinerary', 'Bookings', 'Saves'] as const;

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const trip = getTrip(tripId ?? '');
  const [tab, setTab] = useState<(typeof TABS)[number]>('Bookings');

  if (!trip) {
    return (
      <View style={[styles.screen, { paddingTop: top }]}>
        <LuxuryHeader showBack onBack={() => router.back()} />
        <View style={styles.empty}>
          <Text style={styles.emptyTxt}>Trip not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      <LuxuryHeader showBack onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: trip.coverImage }} style={styles.heroImg} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{trip.destination}</Text>
            <Text style={styles.heroDates}>{trip.dateRange}</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} hitSlop={8}>
            <Ionicons name="share-outline" size={20} color={Luxury.navy} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)} activeOpacity={0.8}>
              <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'Bookings' && (
          <>
            {/* Bookings carousel */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {trip.bookings.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.bookingCard}
                  activeOpacity={0.92}
                  onPress={() => router.push(`/stay/${b.stayId}` as Href)}>
                  <Image source={{ uri: b.image }} style={styles.bookingImg} contentFit="cover" />
                  <View style={styles.bookingPad}>
                    <Text style={styles.bookingName} numberOfLines={2}>{b.name}</Text>
                    <Text style={styles.bookingDates}>{b.checkIn}</Text>
                    <Text style={styles.bookingDates}>{b.checkOut}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Suggested stays */}
            <Text style={styles.section}>Places to stay</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {trip.suggestedStays.map((s) => (
                <View key={s.id} style={styles.sugCard}>
                  <Image source={{ uri: s.image }} style={styles.sugImg} contentFit="cover" />
                  <View style={styles.sugPad}>
                    <Text style={styles.sugName} numberOfLines={1}>{s.name}</Text>
                    <Text style={styles.sugPrice}>${s.price}<Text style={styles.perNight}> / night</Text></Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Activities */}
            <Text style={styles.section}>Things to do</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {trip.activities.map((a) => (
                <View key={a.id} style={styles.actCard}>
                  <Image source={{ uri: a.image }} style={styles.actImg} contentFit="cover" />
                  <View style={styles.actGrad} />
                  <Text style={styles.actName}>{a.name}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Cars */}
            <Text style={styles.section}>Car rentals</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {trip.cars.map((c) => (
                <View key={c.id} style={styles.carCard}>
                  <Image source={{ uri: c.image }} style={styles.carImg} contentFit="cover" />
                  <Text style={styles.carLabel}>{c.label}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {tab === 'Itinerary' && (
          <View style={styles.placeholder}>
            <Ionicons name="map-outline" size={44} color={Luxury.textMuted} />
            <Text style={styles.placeholderTxt}>Your day-by-day itinerary lives here.</Text>
            <Text style={styles.placeholderSub}>Add flights, transfers, or custom events.</Text>
          </View>
        )}

        {tab === 'Saves' && (
          <View style={styles.placeholder}>
            <Ionicons name="bookmark-outline" size={44} color={Luxury.textMuted} />
            <Text style={styles.placeholderTxt}>Saved places & activities</Text>
            <Text style={styles.placeholderSub}>Tap the heart on any item to save it here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Luxury.white },
  scroll: { paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontFamily: Fonts.medium, fontSize: 16, color: Luxury.textMuted },

  hero: {
    marginHorizontal: 16,
    marginTop: 4,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Luxury.navy,
  },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,58,95,0.45)' },
  heroContent: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18 },
  heroTitle: { fontFamily: Fonts.bold, fontSize: 28, color: '#fff' },
  heroDates: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  shareBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Luxury.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: Luxury.white,
    padding: 4,
    borderWidth: 1,
    borderColor: Luxury.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: Luxury.navy },
  tabTxt: { fontFamily: Fonts.semiBold, fontSize: 14, color: Luxury.textSecondary },
  tabTxtActive: { color: '#fff' },

  hScroll: { paddingLeft: 20, paddingRight: 8, marginBottom: 20 },
  section: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Luxury.text,
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 4,
  },

  bookingCard: {
    width: SCREEN_W * 0.72,
    marginRight: 14,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Luxury.white,
    borderWidth: 1,
    borderColor: Luxury.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  bookingImg: { width: '100%', height: 120 },
  bookingPad: { padding: 14 },
  bookingName: { fontFamily: Fonts.semiBold, fontSize: 16, color: Luxury.text },
  bookingDates: { fontFamily: Fonts.regular, fontSize: 13, color: Luxury.textSecondary, marginTop: 4 },

  sugCard: {
    width: 170,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Luxury.white,
    borderWidth: 1,
    borderColor: Luxury.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sugImg: { width: '100%', height: 110 },
  sugPad: { padding: 12 },
  sugName: { fontFamily: Fonts.semiBold, fontSize: 14, color: Luxury.text },
  sugPrice: { fontFamily: Fonts.bold, fontSize: 16, color: Luxury.text, marginTop: 6 },
  perNight: { fontFamily: Fonts.regular, fontSize: 12, color: Luxury.textMuted },

  actCard: {
    width: 160,
    height: 100,
    marginRight: 14,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  actImg: { ...StyleSheet.absoluteFillObject },
  actGrad: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  actName: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#fff',
  },

  carCard: {
    width: 120,
    height: 80,
    marginRight: 14,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Luxury.white,
    borderWidth: 1,
    borderColor: Luxury.border,
    position: 'relative',
  },
  carImg: { width: '100%', height: 56 },
  carLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Luxury.textSecondary, textAlign: 'center', marginTop: 4 },

  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
  },
  placeholderTxt: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Luxury.text,
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSub: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Luxury.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
