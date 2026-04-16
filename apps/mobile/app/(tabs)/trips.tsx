import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury, Fonts } from '@/constants/theme';
import { TRIPS } from '@/data/travel';
import { LuxuryHeader } from '@/components/luxury-header';

export default function TripsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      <LuxuryHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your trips</Text>
        <Text style={styles.sub}>Upcoming getaways and past journeys.</Text>

        {TRIPS.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => router.push(`/trip/${trip.id}` as Href)}>
            <Image source={{ uri: trip.coverImage }} style={styles.cardImg} contentFit="cover" />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.dest}>{trip.destination}</Text>
                <Ionicons name="chevron-forward" size={20} color={Luxury.gold} />
              </View>
              <Text style={styles.dates}>{trip.dateRange}</Text>
              <View style={styles.stats}>
                <Text style={styles.stat}>
                  {trip.bookingsCount} booking{trip.bookingsCount !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.stat}>{trip.savesCount} saves</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Luxury.white },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { fontFamily: Fonts.bold, fontSize: 26, color: Luxury.text, marginTop: 8 },
  sub: { fontFamily: Fonts.regular, fontSize: 14, color: Luxury.textSecondary, marginTop: 6, marginBottom: 22 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: Luxury.white,
    borderWidth: 1,
    borderColor: Luxury.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dest: { fontFamily: Fonts.semiBold, fontSize: 20, color: Luxury.text, flex: 1 },
  dates: { fontFamily: Fonts.regular, fontSize: 14, color: Luxury.textSecondary, marginTop: 6 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  stat: { fontFamily: Fonts.medium, fontSize: 13, color: Luxury.gold },
  dot: { color: Luxury.textMuted },
});
