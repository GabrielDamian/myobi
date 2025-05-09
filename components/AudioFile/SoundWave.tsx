import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SoundWaveProps {
  isRecording: boolean;
  audioLevel: number;
}

const BAR_COUNT = 40;
const BAR_WIDTH = 3;
const BAR_GAP = 4;
const MIN_SCALE = 0.0001;
const BASE_HEIGHT = 30;
const MOVEMENT_RIGHT_TO_LEFT = 0.5; // Controls wave movement speed (lower = slower)

export function SoundWave({ isRecording, audioLevel }: SoundWaveProps) {
  const animatedValues = useRef(
    Array(BAR_COUNT).fill(0).map(() => new Animated.Value(MIN_SCALE))
  ).current;

  const timePhase = useRef(0);
  const animationRef = useRef<number>();

  const getComplexWaveScale = (index: number, audioLevel: number, timePhase: number) => {
    // Base wave with time-based phase shift for right to left movement
    const baseWave = Math.sin((index / BAR_COUNT) * Math.PI * 2 + timePhase);
    
    // Secondary waves with different frequencies
    const wave2 = Math.sin((index / BAR_COUNT) * Math.PI * 4 + timePhase * 1.5) * 0.3;
    const wave3 = Math.sin((index / BAR_COUNT) * Math.PI * 6 + timePhase * 0.75) * 0.2;
    
    // Combine waves with aggressive decay
    let scale = (baseWave + wave2 + wave3) / 2;
    
    // More sensitive audio level response
    const effectiveAudioLevel = audioLevel || 0;
    const audioScale = effectiveAudioLevel < 0.05
        ? MIN_SCALE
        : Math.pow(effectiveAudioLevel, 1.2); // Less aggressive power for smoother response
    
    scale = scale * audioScale;

    // Scale to MIN_SCALE-1 range with better minimum visibility
    const finalScale = Math.max(0.1, Math.min(1, scale + 0.5));
    
    // Keep more of the wave visible
    return effectiveAudioLevel < 0.02 ? 0.1 : finalScale
  };

  useEffect(() => {
    const animate = () => {
      if (isRecording) {
        timePhase.current += MOVEMENT_RIGHT_TO_LEFT; // Controlled by MOVEMENT_RIGHT_TO_LEFT constant

        // Instant update of all bars
        animatedValues.forEach((value, index) => {
          const targetScale = getComplexWaveScale(index, audioLevel, timePhase.current);
          value.setValue(targetScale);
        });

        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isRecording) {
      animate();
    } else {
      // Instant reset of all bars
      animatedValues.forEach(value => value.setValue(MIN_SCALE));

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isRecording]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.barsContainer}>
          {animatedValues.map((value, index) => (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                {
                  opacity: isRecording ? 1 : 0.5,
                  transform: [{
                    scaleY: value
                  }]
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BASE_HEIGHT,
    width: 'auto',
    justifyContent: 'center',
  },
  bar: {
    width: BAR_WIDTH,
    height: BASE_HEIGHT,
    marginHorizontal: BAR_GAP / 2,
    backgroundColor: '#fff',
    borderRadius: 18,
  },
  audioLevel: {
    marginLeft: 10,
    fontSize: 12,
  },
});