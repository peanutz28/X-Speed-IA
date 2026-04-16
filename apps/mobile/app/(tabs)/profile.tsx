import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Luxury, Fonts } from '@/constants/theme';
import { IMG } from '@/data/travel';
import { LuxuryHeader } from '@/components/luxury-header';

const ROWS = [
  { icon: 'person-outline' as const, label: 'Personal information' },
  { icon: 'notifications-outline' as const, label: 'Notifications' },
  { icon: 'card-outline' as const, label: 'Payments & wallet' },
  { icon: 'shield-checkmark-outline' as const, label: 'Privacy & security' },
  { icon: 'help-circle-outline' as const, label: 'Help center' },
];

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      <LuxuryHeader rightAvatar={false} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile banner with image background */}
        <View style={styles.banner}>
          <Image source={{ uri: IMG.profileBanner }} style={styles.bannerImg} contentFit="cover" />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <Image source={{ uri: IMG.profile }} style={styles.avatar} contentFit="cover" />
            <Text style={styles.name}>Jaden Cole</Text>
            <Text style={styles.email}>jaden@reviewiq.app</Text>
            <View style={styles.tier}>
              <Ionicons name="diamond-outline" size={14} color={Luxury.gold} />
              <Text style={styles.tierTxt}>Gold guest</Text>
            </View>
          </View>
        </View>

        {ROWS.map((r) => (
          <TouchableOpacity key={r.label} style={styles.row} activeOpacity={0.85} onPress={() => Alert.alert(r.label, 'Connects to your account API later.')}>
            <Ionicons name={r.icon} size={22} color={Luxury.navy} />
            <Text style={styles.rowTxt}>{r.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Luxury.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.signOut} onPress={() => Alert.alert('Sign out', 'Hook up to auth when ready.')}>
          <Text style={styles.signOutTxt}>Sign out</Text>
        </TouchableOpacity>
        <Text style={styles.ver}>Expedia · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Luxury.white },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  banner: {
    marginHorizontal: -20,
    height: 240,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  bannerImg: { ...StyleSheet.absoluteFillObject },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,58,95,0.55)' },
  bannerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: { fontFamily: Fonts.bold, fontSize: 22, color: '#fff', marginTop: 14 },
  email: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tierTxt: { fontFamily: Fonts.semiBold, fontSize: 12, color: '#fff' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Luxury.borderSubtle,
  },
  rowTxt: { flex: 1, fontFamily: Fonts.medium, fontSize: 15, color: Luxury.text },
  signOut: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Luxury.danger,
    alignItems: 'center',
  },
  signOutTxt: { fontFamily: Fonts.semiBold, fontSize: 15, color: Luxury.danger },
  ver: { fontFamily: Fonts.regular, fontSize: 12, color: Luxury.textMuted, textAlign: 'center', marginTop: 24 },
});
