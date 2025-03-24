import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function MicrophoneButton() {
  const [showOverlay, setShowOverlay] = useState(false);

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
    transform: [{ translateY: -20 }], // Half of (icon size + padding) to center
    left: 16,
    padding: 8,
  },
  circleContainer: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }], // Half of circle height
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