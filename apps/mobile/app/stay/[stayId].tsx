import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury, Fonts } from '@/constants/theme';
import { getStay } from '@/data/travel';
import { LuxuryHeader } from '@/components/luxury-header';

export default function StayDetailScreen() {
  const { stayId } = useLocalSearchParams<{ stayId: string }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const stay = getStay(stayId ?? '');
  const [priceOpen, setPriceOpen] = useState(false);

  if (!stay) {
    return (
      <View style={[styles.screen, { paddingTop: top }]}>
        <LuxuryHeader showBack onBack={() => router.back()} />
        <View style={styles.empty}>
          <Text style={styles.emptyTxt}>Stay not found</Text>
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
          <Image source={{ uri: stay.heroImage }} style={styles.heroImg} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{stay.propertyName}</Text>
            <Text style={styles.heroLoc}>{stay.locationLabel} · {stay.nights} nights</Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>RESERVATION</Text>
          <Text style={styles.cardValue}>#{stay.itineraryNumber}</Text>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>CHECK-IN</Text>
              <Text style={styles.detailMain}>{stay.checkIn.weekday}, {stay.checkIn.date}</Text>
              <Text style={styles.detailSub}>{stay.checkIn.time}</Text>
            </View>
            <View style={styles.detailSep} />
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>CHECK-OUT</Text>
              <Text style={styles.detailMain}>{stay.checkOut.weekday}, {stay.checkOut.date}</Text>
              <Text style={styles.detailSub}>{stay.checkOut.time}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={Luxury.navy} />
            <Text style={styles.infoTxt}>{stay.adults} adults · {stay.kids} kids · {stay.rooms} room</Text>
          </View>
        </View>

        {/* Special instructions */}
        {stay.specialInstructions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SPECIAL INSTRUCTIONS</Text>
            {stay.specialInstructions.map((s, i) => (
              <View key={i} style={styles.instrRow}>
                <Ionicons name="information-circle-outline" size={18} color={Luxury.gold} />
                <Text style={styles.instrTxt}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => setPriceOpen(!priceOpen)}>
          <View style={styles.priceHeader}>
            <Text style={styles.cardLabel}>PRICING & REWARDS</Text>
            <Ionicons name={priceOpen ? 'chevron-up' : 'chevron-down'} size={20} color={Luxury.textMuted} />
          </View>
          {priceOpen && (
            <>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceKey}>Total</Text>
                <Text style={styles.priceVal}>{stay.totalPrice}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceKey}>Paid on</Text>
                <Text style={styles.priceSub}>{stay.paidOn}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Review banner */}
        <TouchableOpacity
          style={styles.reviewBanner}
          activeOpacity={0.9}
          onPress={() => router.push(`/review/${stay.id}` as Href)}>
          <View style={styles.reviewLeft}>
            <Text style={styles.reviewTitle}>How was your stay?</Text>
            <Text style={styles.reviewSub}>Share your experience and help other travelers.</Text>
          </View>
          <View style={styles.reviewBtn}>
            <Ionicons name="star" size={22} color={Luxury.white} />
          </View>
        </TouchableOpacity>
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
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Luxury.navy,
  },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,58,95,0.45)' },
  heroText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18 },
  heroName: { fontFamily: Fonts.bold, fontSize: 20, color: '#fff' },
  heroLoc: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Luxury.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Luxury.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Luxury.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardValue: { fontFamily: Fonts.medium, fontSize: 15, color: Luxury.text },
  divider: { height: 1, backgroundColor: Luxury.borderSubtle, marginVertical: 14 },

  detailRow: { flexDirection: 'row' },
  detailCol: { flex: 1 },
  detailSep: { width: 1, backgroundColor: Luxury.borderSubtle, marginHorizontal: 14 },
  detailLabel: { fontFamily: Fonts.semiBold, fontSize: 10, color: Luxury.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  detailMain: { fontFamily: Fonts.semiBold, fontSize: 16, color: Luxury.text, marginTop: 6 },
  detailSub: { fontFamily: Fonts.regular, fontSize: 14, color: Luxury.textSecondary, marginTop: 4 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  infoTxt: { fontFamily: Fonts.medium, fontSize: 14, color: Luxury.text },

  instrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 10 },
  instrTxt: { fontFamily: Fonts.regular, fontSize: 14, color: Luxury.text, flex: 1 },

  priceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  priceKey: { fontFamily: Fonts.medium, fontSize: 15, color: Luxury.text },
  priceVal: { fontFamily: Fonts.bold, fontSize: 17, color: Luxury.text },
  priceSub: { fontFamily: Fonts.regular, fontSize: 14, color: Luxury.textSecondary },

  reviewBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Luxury.navy,
  },
  reviewLeft: { flex: 1 },
  reviewTitle: { fontFamily: Fonts.semiBold, fontSize: 17, color: '#fff' },
  reviewSub: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
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
