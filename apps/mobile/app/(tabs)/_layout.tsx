import { Tabs } from 'expo-router';
import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
import { ReviewNotificationHost } from '@/components/review-notification-host';
import { Luxury } from '@/constants/theme';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: Luxury.navy,
          tabBarInactiveTintColor: Luxury.textMuted,
          tabBarLabelStyle: { fontSize: 9, fontFamily: 'Poppins_500Medium', marginBottom: 4 },
          tabBarIconStyle: { marginTop: 4 },
          tabBarStyle: {
            height: 52,
            paddingTop: 4,
            backgroundColor: Luxury.white,
            borderTopWidth: 1,
            borderTopColor: Luxury.border,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            title: 'Trips',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
      <ReviewNotificationHost />
    </View>
  );
}
