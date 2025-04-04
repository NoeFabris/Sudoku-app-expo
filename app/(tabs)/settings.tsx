import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useSettings } from '@/contexts/SettingsContext';
import { useStats } from '@/contexts/StatsContext';
import { Alert } from 'react-native';
import { Calendar, Check, X } from 'lucide-react-native';

export default function SettingsScreen() {
  const { 
    highlightMatchingNumbers, 
    setHighlightMatchingNumbers,
    showMistakes,
    setShowMistakes,
    hapticFeedback,
    setHapticFeedback,
    autoCheck,
    setAutoCheck,
    notesEnabled,
    setNotesEnabled
  } = useSettings();

  // Get statistics from the stats context
  const { stats, resetStats } = useStats();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Format time from seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to get today's date string in YYYY-MM-DD format
  const getTodayDateString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if played today
  const playedToday = stats.lastPlayedDate === getTodayDateString();

  // Confirm and handle reset statistics
  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all your game statistics?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetStats(),
        },
      ],
      { cancelable: true }
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.section}>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Show Mistakes</Text>
            <Switch
              value={showMistakes}
              onValueChange={setShowMistakes}
              trackColor={{ false: '#ddd', true: '#000' }}
            />
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Haptic Feedback</Text>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: '#ddd', true: '#000' }}
            />
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Auto-check Solution</Text>
            <Switch
              value={autoCheck}
              onValueChange={setAutoCheck}
              trackColor={{ false: '#ddd', true: '#000' }}
            />
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Enable Notes</Text>
            <Switch
              value={notesEnabled}
              onValueChange={setNotesEnabled}
              trackColor={{ false: '#ddd', true: '#000' }}
            />
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Highlight Matching Numbers</Text>
            <Switch
              value={highlightMatchingNumbers}
              onValueChange={setHighlightMatchingNumbers}
              trackColor={{ false: '#ddd', true: '#000' }}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.gamesWon}</Text>
              <Text style={styles.statLabel}>Games Won</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <Text style={[styles.sectionTitle, {marginTop: 10, marginBottom: 15}]}>Daily Streak</Text>
            <View style={styles.streakContainer}>
              <View style={styles.streakHeader}>
                <Text style={styles.streakValue}>{stats.currentStreak}</Text>
                <View>
                  <Text style={styles.streakTitle}>Daily Streak</Text>
                  <Text style={styles.streakSubtitle}>Complete a game every day</Text>
                </View>
              </View>
              
              <View style={styles.dailyStatus}>
                <View style={styles.dailyStatusIcon}>
                  <Calendar size={20} color="#666" />
                </View>
                <View style={styles.dailyStatusContent}>
                  <Text style={styles.dailyStatusTitle}>Today's Progress</Text>
                  <View style={styles.statusContainer}>
                    {playedToday ? (
                      <>
                        <Check size={18} color="#4CAF50" />
                        <Text style={[styles.statusText, styles.statusComplete]}>Completed</Text>
                      </>
                    ) : (
                      <>
                        <X size={18} color="#FF5252" />
                        <Text style={[styles.statusText, styles.statusIncomplete]}>Not yet completed</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.streakProgressContainer}>
                <View style={[styles.streakProgress, {width: `${Math.min(stats.currentStreak/10 * 100, 100)}%`}]} />
              </View>
              <View style={styles.streakFooter}>
                <View style={styles.streakMilestone}>
                  <Text style={styles.milestoneValue}>5</Text>
                  <View style={[styles.milestoneDot, stats.currentStreak >= 5 ? styles.milestoneDotActive : null]} />
                </View>
                <View style={styles.streakMilestone}>
                  <Text style={styles.milestoneValue}>10</Text>
                  <View style={[styles.milestoneDot, stats.currentStreak >= 10 ? styles.milestoneDotActive : null]} />
                </View>
                <View style={styles.streakMilestone}>
                  <Text style={styles.milestoneValue}>25</Text>
                  <View style={[styles.milestoneDot, stats.currentStreak >= 25 ? styles.milestoneDotActive : null]} />
                </View>
                <View style={styles.streakMilestone}>
                  <Text style={styles.milestoneValue}>50</Text>
                  <View style={[styles.milestoneDot, stats.currentStreak >= 50 ? styles.milestoneDotActive : null]} />
                </View>
              </View>
              <View style={styles.streakRecord}>
                <Text style={styles.streakRecordText}>Best Streak: <Text style={styles.streakRecordValue}>{stats.longestStreak}</Text> days</Text>
              </View>
            </View>
            
            <Text style={[styles.sectionTitle, {marginTop: 20, marginBottom: 10}]}>Best Times</Text>
            <View style={styles.statTable}>
              <View style={styles.statRow}>
                <Text style={styles.statCell}>Beginner</Text>
                <Text style={styles.statCell}>{formatTime(stats.bestTime.Beginner)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statCell}>Easy</Text>
                <Text style={styles.statCell}>{formatTime(stats.bestTime.Easy)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statCell}>Medium</Text>
                <Text style={styles.statCell}>{formatTime(stats.bestTime.Medium)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statCell}>Hard</Text>
                <Text style={styles.statCell}>{formatTime(stats.bestTime.Hard)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statCell}>Expert</Text>
                <Text style={styles.statCell}>{formatTime(stats.bestTime.Expert)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Pressable style={styles.button} onPress={handleResetStats}>
            <Text style={styles.buttonText}>Reset Statistics</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.buttonDanger]}>
            <Text style={[styles.buttonText, styles.buttonTextDanger]}>Clear All Data</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 30,
    color: '#000',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 15,
    color: '#000',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 38,
    color: '#4CAF50',
    marginRight: 15,
  },
  streakTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#000',
  },
  streakSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  streakProgressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  streakProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  streakFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  streakMilestone: {
    alignItems: 'center',
  },
  milestoneValue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  milestoneDotActive: {
    backgroundColor: '#4CAF50',
  },
  streakRecord: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  streakRecordText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  streakRecordValue: {
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  statTable: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  statCell: {
    padding: 12,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000',
  },
  button: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDanger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  buttonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000',
  },
  buttonTextDanger: {
    color: '#ff4444',
  },
  dailyStatus: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  dailyStatusIcon: {
    marginRight: 12,
  },
  dailyStatusContent: {
    flex: 1,
  },
  dailyStatusTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 6,
  },
  statusComplete: {
    color: '#4CAF50',
  },
  statusIncomplete: {
    color: '#FF5252',
  },
});