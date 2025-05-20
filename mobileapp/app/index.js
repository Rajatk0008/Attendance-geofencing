import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Camera from 'expo-camera';
import CameraScreen from '../Components/CameraScreen';
import VerificationResult from '../Components/VerificationResult';

export default function Index() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!result ? (
        <CameraScreen onResult={setResult} />
      ) : (
        <VerificationResult result={result} onRetry={() => setResult(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
