import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Platform, PermissionsAndroid, NativeEventEmitter, NativeModules } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SoundWave } from './SoundWave';

export function MicrophoneButton() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.5);
  const [recordingTime, setRecordingTime] = useState(0);

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
        // Simulate audio level changes when recording
        setAudioLevel(Math.random() * 0.7 + 0.3); // Random value between 0.3 and 1.0
      }, 100);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
      setRecordingTime(0);
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'App needs access to your microphone to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      return;
    }

    try {
      setIsRecording(true);
      // Note: Actual audio recording implementation would go here
      // For now, we're just simulating the recording state and audio levels
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        // Note: Actual audio recording stop implementation would go here
      } catch (error) {
        console.error('Failed to stop recording:', error);
      }
    }
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
            <Text style={styles.timerText}>{formatTime(Math.floor(recordingTime / 10))}</Text>
          </View>
          <View style={styles.circleContainer}>
            <View style={styles.circle}>
              <MaterialIcons name="arrow-forward" size={20} color="#B20000" />
            </View>
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