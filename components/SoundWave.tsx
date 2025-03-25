import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface SoundWaveProps {
  isRecording: boolean;
  audioLevel: number;
}

export function SoundWave({ isRecording, audioLevel }: SoundWaveProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Audio Level: {audioLevel.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});