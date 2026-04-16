import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from 'expo-av';
import { Fonts, Luxury } from '@/constants/theme';

type Props = {
  onRecordingComplete?: (uri: string | null) => void;
};

const BTN_SIZE = 56;
const BORDER = 'rgba(26, 26, 46, 0.18)';

export function AiMicButton({ onRecordingComplete }: Props) {
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
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice note'}
        style={({ pressed }) => [styles.hit, pressed && styles.hitPressed]}>
        <View style={styles.circle}>
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={24}
            color={Luxury.text}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 4 },
  hint: { fontFamily: Fonts.medium, fontSize: 13, color: Luxury.textMuted },
  hit: {
    borderRadius: BTN_SIZE / 2 + 8,
    padding: 4,
  },
  hitPressed: { opacity: 0.85 },
  circle: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: Luxury.white,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
