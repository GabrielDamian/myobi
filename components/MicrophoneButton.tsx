import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SoundWave } from './SoundWave';
import { Audio } from 'expo-av';

interface MicrophoneButtonProps {
  onAudioRecorded: (audioUri: string, amplitudes: number[]) => void;
}

export function MicrophoneButton({ onAudioRecorded }: MicrophoneButtonProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  const [lastSecond, setLastSecond] = useState(-1);

  useEffect(() => {
    if (showOverlay) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [showOverlay]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 100);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Reset states
      setAmplitudes([]);
      setLastSecond(-1);

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording && status.metering !== undefined) {
            // Convert dB meter level to a value between 0 and 1
            const normalizedLevel = (status.metering + 160) / 160;
            const level = Math.max(0, Math.min(normalizedLevel, 1));
            setAudioLevel(level);

            // Store amplitude every second
            const currentSecond = Math.floor(status.durationMillis / 1000);
            if (currentSecond !== lastSecond) {
              setLastSecond(currentSecond);
              setAmplitudes(prev => [...prev, level]);
            }
          }
        },
        50 // Update interval in milliseconds
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setShowOverlay(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      setIsRecording(false);
      setRecordingTime(0);
      setAudioLevel(0);
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        onAudioRecorded(uri, amplitudes);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }

    setRecording(null);
    setIsRecording(false);
    setRecordingTime(0);
    setAudioLevel(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendAudio = async () => {
    await stopRecording();
    setShowOverlay(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowOverlay(true)}
      >
        <MaterialIcons name="mic" size={20} color="#666" />
      </TouchableOpacity>

      {showOverlay && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.trashButton}
            onPress={() => setShowOverlay(false)}
          >
            <MaterialIcons name="delete" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.waveContainer}>
            <SoundWave isRecording={isRecording} audioLevel={audioLevel} />
          </View>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {formatTime(Math.floor(recordingTime / 10))}
            </Text>
          </View>
          <View style={styles.circleContainer}>
            <TouchableOpacity style={styles.circle} onPress={handleSendAudio}>
              <MaterialIcons name="arrow-forward" size={20} color="#B20000" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#B20000',
    zIndex: 999,
  },
  trashButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    left: 16,
    padding: 8,
  },
  waveContainer: {
    position: 'absolute',
    left: 70,
    right: 120,
    top: '50%',
    transform: [{ translateY: -30 }],
  },
  timerContainer: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    right: 70,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  circleContainer: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    right: 16,
    padding: 8,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});