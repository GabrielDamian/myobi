import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface AudioMessageProps {
  audioUri: string;
}

export function AudioMessage({ audioUri }: AudioMessageProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true
    }).catch(err => console.error('Error setting audio mode:', err));

    // Load audio
    loadAudio();
    
    // Cleanup
    return () => {
      if (sound) {
        sound.unloadAsync().catch(err =>
          console.error('Error unloading sound:', err)
        );
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
    } catch (err) {
      console.error('Error loading audio:', err);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // Update playing state
    if (status.isPlaying !== isPlaying) {
      setIsPlaying(status.isPlaying);
    }

    // Handle playback completion
    if (status.didJustFinish) {
      setIsPlaying(false);
      sound?.setPositionAsync(0).catch(console.error);
    }
  };

  const handlePress = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      console.error('Error playing/pausing audio:', err);
      setIsPlaying(false);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3A3A3C',
    borderRadius: 20,
    padding: 10,
    alignSelf: 'flex-start',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A4A4C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});