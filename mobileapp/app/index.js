import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import * as Camera from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../Components/HomeScreen';
import OnboardingCarousel from '../Components/OnboardingCarousel';
import CameraScreen from '../Components/CameraScreen';
import VerificationResult from '../Components/VerificationResult';

export default function Index() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Check if first launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setShowOnboarding(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      }
    };
    checkFirstLaunch();
  }, []);

  // Camera permission logic
  useEffect(() => {
    if (!permission) {
      requestPermission().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [permission]);

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
  };

  const handleRetry = () => {
    setResult(null);
    setShowCamera(false);
  };

  // New handler for Back inside CameraScreen
  const handleCameraBack = () => {
    // Simply hide camera, don't clear result (you can clear if you want)
    setShowCamera(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.info}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.warning}>Camera permission is required.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingCarousel onDone={handleOnboardingDone} />;
  }

  if (showCamera) {
    return !result ? (
      <CameraScreen onResult={setResult} onBack={handleCameraBack} />
    ) : (
      <VerificationResult result={result} onRetry={handleRetry} />
    );
  }

  // Default: Show Home Screen
  return <HomeScreen onStartScan={() => setShowCamera(true)} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  warning: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
