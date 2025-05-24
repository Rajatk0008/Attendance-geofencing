import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ onStartScan }) {
    return (
        <View style={styles.container}>
            <Text style={styles.brand}>👤 Face Attendance</Text>

            <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Quick Tips</Text>
                <Text style={styles.instruction}>• Good lighting, face visible</Text>
                <Text style={styles.instruction}>• Geofencing enabled</Text>
                <Text style={styles.instruction}>• One attendance per device</Text>
                <Text style={styles.instruction}>
                    • 1st scan = Punch In, next = Punch Out
                </Text>
                <Text style={styles.instruction}>
                    • Use same device for both
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Start Attendance Scan" onPress={onStartScan} />
            </View>

            <Text style={styles.footer}>App Version 1.0.0</Text>
            <Button
                title="Reset Onboarding"
                onPress={async () => {
                    await AsyncStorage.removeItem('hasLaunched');
                    // Optionally reload app or reset state to show onboarding
                    setShowOnboarding(true);
                    setShowCamera(false);
                    setResult(null);
                }}
            />
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
    },
    brand: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    instructions: {
        marginBottom: 40,
        width: '80%',
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    instruction: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
    },
    buttonContainer: {
        width: '80%',
    },
    footer: {
        marginTop: 60,
        fontSize: 12,
        color: '#aaa',
    },
});
