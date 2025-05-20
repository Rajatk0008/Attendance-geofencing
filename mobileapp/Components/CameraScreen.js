import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Button, Alert, Linking } from 'react-native';
import { verifyFace } from '../services/api';

export default function CameraScreen({ onResult }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (permission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      setError(null);
      console.log('Starting takePicture');
      try {
        console.log('Capturing photo');
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        console.log('Photo captured');
        const base64Image = `data:image/jpeg;base64,${photo.base64}`;
        console.log('Calling verifyFace');
        const result = await verifyFace(base64Image);
        console.log('API Response:', JSON.stringify(result, null, 2));
        setLoading(false);
        if (result.error) {
          setError(result.error);
          if (result.error.includes('Location services') || result.error.includes('GPS')) {
            Alert.alert(
              'Location Error',
              result.error + ' Open settings to enable GPS?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Settings', onPress: () => Linking.openSettings() },
              ]
            );
          } else {
            Alert.alert('Error', result.error);
          }
          return;
        }
        onResult(result);
      } catch (error) {
        console.error('takePicture error:', error.message);
        setLoading(false);
        setError(error.message || 'Failed to capture photo');
        Alert.alert('Error', error.message || 'Failed to capture photo');
      }
    } else {
      console.log('Camera ref not ready');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={facing} />
      <Text style={styles.hint}>Position your face clearly in the frame</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePicture} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>Scan Face</Text>}
        </TouchableOpacity>
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={() => setError(null)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#00000099',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  text: { color: 'white', fontSize: 18 },
  message: { textAlign: 'center', marginBottom: 20 },
  hint: { color: 'white', textAlign: 'center', marginBottom: 10 },
  errorContainer: { padding: 10, alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 10 },
});