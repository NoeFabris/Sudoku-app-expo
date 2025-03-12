import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Difficulty } from '@/utils/sudoku';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

export default function DifficultySelector({
  difficulty,
  onSelect,
}: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

  return (
    <View style={styles.container}>
      {difficulties.map(level => (
        <Pressable
          key={level}
          style={[
            styles.option,
            difficulty === level && styles.selectedOption,
          ]}
          onPress={() => onSelect(level)}>
          <Text
            style={[
              styles.optionText,
              difficulty === level && styles.selectedOptionText,
            ]}>
            {level}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#000',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
});