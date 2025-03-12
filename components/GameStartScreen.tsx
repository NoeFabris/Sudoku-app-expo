import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import type { Difficulty } from '@/utils/sudoku';

interface GameStartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

export default function GameStartScreen({ onStart }: GameStartScreenProps) {
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>('Medium');

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.subtitle}>Select difficulty</Text>
        
        <View style={styles.difficultyContainer}>
          {difficulties.map(difficulty => (
            <Pressable
              key={difficulty}
              style={[
                styles.difficultyOption,
                selectedDifficulty === difficulty && styles.selectedOption
              ]}
              onPress={() => setSelectedDifficulty(difficulty)}
            >
              <Text 
                style={[
                  styles.difficultyText,
                  selectedDifficulty === difficulty && styles.selectedOptionText
                ]}
              >
                {difficulty}
              </Text>
            </Pressable>
          ))}
        </View>
        
        <Pressable 
          style={styles.startButton}
          onPress={() => onStart(selectedDifficulty)}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 42,
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    color: '#666',
    marginBottom: 40,
  },
  difficultyContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 40,
  },
  difficultyOption: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#000',
  },
  difficultyText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#666',
  },
  selectedOptionText: {
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
  }
});