import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { Fonts, Luxury } from '@/constants/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type Props = {
  onRecordingComplete?: (uri: string | null) => void;
};

export function AiMicButton({ onRecordingComplete }: Props) {
  const pulse = useSharedValue(0);
  const spin = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    spin.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [pulse, spin, glow]);

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${spin.value}deg` },
      { scale: 1 + pulse.value * 0.06 },
    ],
    opacity: 0.7 + pulse.value * 0.3,
  }));

  const middleRingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${-spin.value * 0.7}deg` },
      { scale: 1 + glow.value * 0.04 },
    ],
    opacity: 0.6 + glow.value * 0.4,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.08 }],
    shadowOpacity: 0.4 + glow.value * 0.4,
  }));

  const [recording, setRecording] = React.useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);

  async function startRecording() {
    if (Platform.OS === 'web') {
      Alert.alert('Voice notes', 'Recording is available on the iOS and Android apps.');
      onRecordingComplete?.(null);
      return;
    }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone', 'Permission is required to record a voice note.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      console.warn('Recording failed', e);
      Alert.alert('Recording', 'Could not start recording.');
    }
  }

  async function stopRecording() {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecording(null);
      onRecordingComplete?.(uri ?? null);
    } catch (e) {
      console.warn('Stop recording failed', e);
      setRecording(null);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        {isRecording ? 'Listening… tap to stop' : 'Add a voice note'}
      </Text>
      <Pressable
        onPress={isRecording ? stopRecording : startRecording}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice note'}>
        <View style={styles.orbContainer}>
          {/* Outer ring — purple to cyan gradient */}
          <Animated.View style={[styles.ringOuter, outerRingStyle]}>
            <LinearGradient
              colors={['#7B2FBE', '#3B82F6', '#06B6D4', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ringGrad}
            />
          </Animated.View>

          {/* Middle ring — blue to purple */}
          <Animated.View style={[styles.ringMiddle, middleRingStyle]}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#3B82F6', '#06B6D4']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.ringGrad}
            />
          </Animated.View>

          {/* Inner glowing core */}
          <Animated.View style={[styles.core, innerGlowStyle]}>
            <LinearGradient
              colors={isRecording
                ? ['#EF4444', '#F97316', '#EF4444']
                : ['#1E1B4B', '#312E81', '#1E1B4B']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coreGrad}>
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={28}
                color="#fff"
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

const ORB_SIZE = 80;
const RING_OUTER = ORB_SIZE + 20;
const RING_MIDDLE = ORB_SIZE + 8;
const CORE_SIZE = ORB_SIZE - 10;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 4 },
  hint: { fontFamily: Fonts.medium, fontSize: 13, color: Luxury.textMuted },

  orbContainer: {
    width: RING_OUTER,
    height: RING_OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringOuter: {
    position: 'absolute',
    width: RING_OUTER,
    height: RING_OUTER,
    borderRadius: RING_OUTER / 2,
    overflow: 'hidden',
  },
  ringMiddle: {
    position: 'absolute',
    width: RING_MIDDLE,
    height: RING_MIDDLE,
    borderRadius: RING_MIDDLE / 2,
    overflow: 'hidden',
  },
  ringGrad: {
    flex: 1,
    borderRadius: 999,
  },

  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  coreGrad: {
    flex: 1,
    borderRadius: CORE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
