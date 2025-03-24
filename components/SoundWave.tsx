import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SoundWaveProps {
  isRecording: boolean;
  audioLevel?: number;  // Value between 0 and 1
}

export function SoundWave({ isRecording, audioLevel = 0.5 }: SoundWaveProps) {
  const bars = 27; // Odd number for symmetry
  const animations = useRef<Animated.Value[]>(
    Array(bars).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (isRecording) {
      // Animate each bar with a slight delay
      animations.forEach((anim, index) => {
        const createAnimation = () => {
          const randomDuration = 500 + Math.random() * 500;
          const randomHeight = 0.3 + (Math.random() * 0.7 * audioLevel);
          
          Animated.sequence([
            Animated.timing(anim, {
              toValue: randomHeight,
              duration: randomDuration,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: randomDuration,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (isRecording) {
              createAnimation();
            }
          });
        };

        setTimeout(() => createAnimation(), index * 100);
      });
    }
  }, [isRecording, audioLevel]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [
                {
                  scaleY: anim,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 2,
  },
  bar: {
    width: 3,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 2,
  },
});