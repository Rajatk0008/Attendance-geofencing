import { API_URL } from '../constants/urls';
import * as Location from 'expo-location';

export const verifyFace = async (base64Image) => {
  try {
    if (!base64Image || typeof base64Image !== 'string') {
      return { error: 'Invalid or missing image data' };
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Location permission denied. Enable in settings.' };
    }

    const isLocationEnabled = await Location.hasServicesEnabledAsync();
    if (!isLocationEnabled) {
      return { error: 'Location services are disabled. Enable GPS in settings.' };
    }

    let latitude, longitude;
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
      ({ latitude, longitude } = position.coords);
      console.log('Location:', { latitude, longitude });
    } catch (error) {
      console.warn('Location fetch failed:', error.message);
      return { error: 'Location unavailable. Ensure GPS is enabled.' };
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90 || isNaN(longitude) || longitude < -180 || longitude > 180) {
      return { error: 'Invalid coordinates' };
    }

    const url = `${API_URL.replace(/\/$/, '')}/api/verify-face`;
    console.log('API_URL:', API_URL);
    console.log('Request URL:', url);
    console.log('Request Payload:', { image: base64Image.slice(0, 50) + '...', latitude, longitude });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, latitude, longitude }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.slice(0, 200));
      return { error: `Server returned non-JSON response: ${text.slice(0, 100)}` };
    }

    const data = await response.json();
    console.log('verifyFace response:', data);
    if (!response.ok) {
      return { error: data.error || `HTTP error ${response.status}` };
    }
    return data;
  } catch (error) {
    console.error('verifyFace error:', error.name, error.message);
    if (error.name === 'AbortError') {
      return { error: 'Request timed out. Check server connection.' };
    }
    return { error: 'Failed to verify face. Check network or server.' };
  }
};