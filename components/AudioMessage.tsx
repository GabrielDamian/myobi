import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface AudioMessageProps {
  audioUri: string;
}

export function AudioMessage({ audioUri }: AudioMessageProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    // Load the audio file when the component mounts
    loadAudio();
    
    // Cleanup when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const loadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);

      // Get duration
      const status = await newSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDuration(status.durationMillis);
      }
    } catch (err) {
      console.error('Error loading audio:', err);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const formatDuration = (ms: number | null): string => {
    if (!ms) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePress = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
        await sound.playAsync();
      }
    } catch (err) {
      console.error('Error playing/pausing audio:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePress}
      >
        <FontAwesome
          name={isPlaying ? "pause" : "play"}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      <ThemedText style={styles.duration}>
        {formatDuration(duration)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});