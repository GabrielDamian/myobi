import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface AudioMessageProps {
  audioUri: string;
  amplitudes: number[];
}

const BAR_COUNT = 30;

function mapAmplitudesToBars(amplitudes: number[]): number[] {
  console.log("mapAmplitudesToBars:", amplitudes);
  const barsHeight =  Array.from({ length: BAR_COUNT }, (_, i) => {
    const index = Math.floor(i * amplitudes.length / BAR_COUNT);
    return amplitudes[index] || 0;
  });

  const windowSize = 1;
  
  // Calculate moving average
  const smoothedBars = barsHeight.map((value, index) => {
    let sum = value;
    let count = 1;
    
    // Add left neighbors
    for (let i = 1; i <= windowSize; i++) {
      if (index - i >= 0) {
        sum += barsHeight[index - i];
        count++;
      }
    }
    
    // Add right neighbors
    for (let i = 1; i <= windowSize; i++) {
      if (index + i < barsHeight.length) {
        sum += barsHeight[index + i];
        count++;
      }
    }
    
    return sum / count;
  });

  // Normalize values between 0 and 1
  const min = Math.min(...smoothedBars);
  const max = Math.max(...smoothedBars);
  const normalizedBars = smoothedBars.map(value =>
    max === min ? 0 : (value - min) / (max - min)
  );

  return normalizedBars;
}
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BASE_HEIGHT = 30;
const MIN_HEIGHT = 4;

export function AudioMessage({ audioUri, amplitudes }: AudioMessageProps) {
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const audioLevels = mapAmplitudesToBars(amplitudes);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
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
        { 
          shouldPlay: false,
          progressUpdateIntervalMillis: 50,
        },
        onPlaybackStatusUpdate
      );

      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }

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

    // Update position
    setPosition(status.positionMillis);

    // Handle playback completion
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
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
      <View style={styles.barsContainer}>
        {audioLevels.map((level, index) => {
          const isCurrentBar = index <= Math.floor((position / duration) * BAR_COUNT);
          const barHeight = Math.max(MIN_HEIGHT, BASE_HEIGHT * level);
          
          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: barHeight,
                  opacity: isCurrentBar ? 1 : 0.4,
                  backgroundColor: isCurrentBar ? '#4A90E2' : '#8E8E93',
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3A3A3C',
    borderRadius: 20,
    padding: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    width: 220,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A4A4C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BASE_HEIGHT,
    width: BAR_COUNT * (BAR_WIDTH + BAR_GAP),
  },
  bar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_GAP / 2,
    borderRadius: BAR_WIDTH / 2,
  },
});