import { View, Text, StyleSheet, Button } from 'react-native';
import { DASHBOARD_LINKS } from '../constants/urls';
import * as Linking from 'expo-linking';

export default function VerificationResult({ result, onRetry }) {
  const openLink = async () => {
    const url = DASHBOARD_LINKS.user;
    console.log('Opening URL:', url);
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        console.error('Cannot open URL:', url);
        alert('Unable to open the link.');
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      alert('Failed to open the link.');
    }
  };

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No result available</Text>
        <Button title="Try Again" onPress={onRetry} accessibilityLabel="Retry face scan" />
      </View>
    );
  }

  if (result.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {result.error}</Text>
        <Button title="Try Again" onPress={onRetry} accessibilityLabel="Retry face scan" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={result.success ? styles.success : styles.error}>
        {result.message}
        {!result.success && ' Please try again or contact support.'}
      </Text>
      <Button title="Try Again" onPress={onRetry} accessibilityLabel="Retry face scan" />
      {result.success && (
        <View style={styles.links}>
          <Button
            title="Go to User Dashboard"
            onPress={openLink}
            accessibilityLabel="Open user dashboard"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  success: { fontSize: 20, color: 'green', marginBottom: 20, textAlign: 'center' },
  error: { fontSize: 20, color: 'red', marginBottom: 20, textAlign: 'center' },
  links: { marginTop: 20, gap: 10 },
});