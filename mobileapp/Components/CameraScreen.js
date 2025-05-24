import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform,
  AppState,
} from 'react-native';
import { verifyFace } from '../services/api';

export default function CameraScreen({ onResult, onBack }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [flashMode, setFlashMode] = useState('off');
  const appState = useRef(AppState.currentState);

  const windowWidth = Dimensions.get('window').width;
  const overlaySize = windowWidth * 0.8;
  const overlayBorderRadius = overlaySize / 2;

  // Helper to check location + GPS
  async function checkLocationAndGps() {
    try {
      // Check location permission
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return false;

      // Check GPS enabled on device
      const gpsEnabled = await Location.hasServicesEnabledAsync();
      return gpsEnabled;
    } catch {
      return false;
    }
  }

  // AppState listener for returning from settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Re-check location & GPS when app comes back
        const locationOk = await checkLocationAndGps();
        if (locationOk && !loading) {
          setError(null);
          // Only start countdown if not already counting down
          if (countdown === null) {
            setCountdown(3);
          }
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [countdown, loading]);

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // Reset countdown immediately to prevent stuck '0'
      setCountdown(null);
      takePicture();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (permission === null) {
    return <LoadingView message="Loading camera permissions..." />;
  }
  if (!permission.granted) {
    return <PermissionView onRequestPermission={requestPermission} />;
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    if (facing === 'front') {
      Alert.alert('Flash not available', 'Flash is only available when using the back camera.', [{ text: 'OK' }]);
      return;
    }
    setFlashMode(current => (current === 'off' ? 'on' : 'off'));
  };

  const startCountdown = async () => {
    setError(null);

    // Check location and GPS before starting countdown
    const locationOk = await checkLocationAndGps();
    if (!locationOk) {
      Alert.alert(
        'Location Services Required',
        'Please enable location services and GPS to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
        { cancelable: false }
      );
      return;
    }
    setCountdown(3);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
      });

      const base64Image = `data:image/jpeg;base64,${photo.base64}`;
      const result = await verifyFace(base64Image);

      setLoading(false);

      if (result.error) {
        setError(result.error);
        return;
      }
      onResult(result);
    } catch (error) {
      setLoading(false);
      setError(error.message || 'Failed to capture photo');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing={facing}
          flashMode={flashMode}
          enableTorch={facing === 'back' && flashMode === 'on'}
        />

        <View style={styles.overlay}>
          <View
            style={[
              styles.faceOverlay,
              {
                width: overlaySize,
                height: overlaySize,
                borderRadius: overlayBorderRadius,
              },
            ]}
          />
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>Position your face within the circle</Text>
        </View>

        {countdown !== null && countdown > 0 && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>
      

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setCountdown(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.iconButton, facing === 'front' && styles.disabledButton]}
          onPress={toggleFlash}
          disabled={facing === 'front'}
        >
          <Text style={styles.iconText}>{flashMode === 'off' ? '💡' : '⚡'}</Text>
          <Text style={[styles.buttonLabel, facing === 'front' && styles.disabledText]}>Flash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={startCountdown}
          disabled={loading || countdown !== null}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
          <Text style={styles.iconText}>🔄</Text>
          <Text style={styles.buttonLabel}>Flip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const LoadingView = ({ message }) => (
  <View style={styles.centeredContainer}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const PermissionView = ({ onRequestPermission }) => (
  <View style={styles.centeredContainer}>
    <View style={styles.cameraIconContainer}>
      <Text style={styles.cameraIcon}>📷</Text>
    </View>
    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
    <Text style={styles.permissionMessage}>We need camera permission to verify your identity</Text>
    <TouchableOpacity style={styles.permissionButton} onPress={onRequestPermission}>
      <Text style={styles.permissionButtonText}>Grant Permission</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  faceOverlay: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'transparent',
  },
  instructionContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  countdownText: {
    fontSize: 72,
    color: 'white',
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
  },
  iconText: {
    fontSize: 24,
    marginBottom: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 12,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#2196F3',
    fontWeight: '600',
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#2196F3',
  },
  cameraIconContainer: {
    marginBottom: 20,
  },
  cameraIcon: {
    fontSize: 80,
    color: '#2196F3',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },

  // Back button styles
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
