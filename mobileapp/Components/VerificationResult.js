import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useState } from 'react';

export default function VerificationResult({ result, onRetry }) {
  const [selectedDate, setSelectedDate] = useState(null);

  if (!result) {
    return <EmptyStateView onRetry={onRetry} message="No result available" />;
  }

  if (result.error) {
    return <EmptyStateView onRetry={onRetry} message={`Error: ${result.error}`} isError />;
  }

  const { userData, attendanceHistory } = result;
  
  const renderAttendanceItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.attendanceItem,
        selectedDate === item.date && styles.selectedAttendanceItem
      ]}
      onPress={() => setSelectedDate(selectedDate === item.date ? null : item.date)}
      activeOpacity={0.7}
    >
      <View style={styles.attendanceHeader}>
        <View style={[styles.statusIndicator, 
          { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={styles.attendanceDate}>{formatDate(item.date)}</Text>
        <Text style={[styles.attendanceStatus, 
          { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      
      {selectedDate === item.date && (
        <View style={styles.attendanceDetails}>
          <View style={styles.timeRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Punch In</Text>
              <Text style={styles.timeValue}>{item.punch_in_time || 'Not recorded'}</Text>
            </View>
            
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Punch Out</Text>
              <Text style={styles.timeValue}>{item.punch_out_time || 'Not recorded'}</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={[styles.card, styles.statusCard]}>
          <View style={[
            styles.statusIcon, 
            { backgroundColor: result.success ? '#e7f6e7' : '#ffebee' }
          ]}>
            <Text style={styles.statusEmoji}>
              {result.success ? '✅' : '❌'}
            </Text>
          </View>
          
          <Text style={[
            styles.statusText,
            { color: result.success ? '#2e7d32' : '#c62828' }
          ]}>
            {result.message}
          </Text>
          
          {!result.success && (
            <Text style={styles.statusSubtext}>
              Please try again or contact support.
            </Text>
          )}
        </View>
        
        {/* User Data Card */}
        {userData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Information</Text>
            
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Name</Text>
              <Text style={styles.userInfoValue}>{userData.name || 'N/A'}</Text>
            </View>
            
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Email</Text>
              <Text style={styles.userInfoValue}>{userData.email || 'N/A'}</Text>
            </View>
            
            <View style={styles.divider} />
            
            {userData.attendanceToday ? (
              <>
                <Text style={styles.cardSubtitle}>Today's Attendance</Text>
                
                <View style={styles.timeRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Punch In</Text>
                    <Text style={styles.timeValue}>
                      {userData.attendanceToday.punchInTime || 'Not recorded'}
                    </Text>
                  </View>
                  
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeLabel}>Punch Out</Text>
                    <Text style={styles.timeValue}>
                      {userData.attendanceToday.punchOutTime || 'Not recorded'}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.noAttendanceText}>
                No attendance recorded for today
              </Text>
            )}
          </View>
        )}
        
        {/* Attendance History Card */}
        {attendanceHistory?.length > 0 && (
          <View style={[styles.card, styles.historyCard]}>
            <Text style={styles.cardTitle}>Attendance History</Text>
            
            <FlatList
              data={attendanceHistory}
              renderItem={renderAttendanceItem}
              keyExtractor={(item) => item.date}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            />
          </View>
        )}
      </ScrollView>
      
      {/* Bottom Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.8}
          accessibilityLabel="Retry face scan"
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Helper Components
const EmptyStateView = ({ onRetry, message, isError = false }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateEmoji}>{isError ? '❌' : '🔍'}</Text>
      <Text style={styles.emptyStateMessage}>{message}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// Helper Functions
const formatDate = (dateString) => {
  try {
    // Assuming dateString is in format YYYY-MM-DD
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'present':
      return '#2e7d32'; // green
    case 'absent':
      return '#c62828'; // red
    case 'late':
      return '#f57c00'; // orange
    case 'half day':
      return '#1976d2'; // blue
    default:
      return '#757575'; // gray
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80,
  },
  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCard: {
    alignItems: 'center',
    padding: 24,
  },
  historyCard: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#263238',
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
    color: '#455a64',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  
  // Status Section
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  
  // User Info Section
  userInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  userInfoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#757575',
    width: '30%',
  },
  userInfoValue: {
    fontSize: 15,
    color: '#212121',
    flex: 1,
  },
  noAttendanceText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Time Blocks
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeBlock: {
    flexDirection: 'column',
    width: '48%',
  },
  timeLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  
  // Attendance History List
  attendanceItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  selectedAttendanceItem: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  attendanceDate: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
    flex: 1,
  },
  attendanceStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  attendanceDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  listSeparator: {
    height: 8,
  },
  
  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#616161',
  },
});