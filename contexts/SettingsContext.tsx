import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  highlightMatchingNumbers: boolean;
  setHighlightMatchingNumbers: (value: boolean) => void;
  showMistakes: boolean;
  setShowMistakes: (value: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (value: boolean) => void;
  autoCheck: boolean;
  setAutoCheck: (value: boolean) => void;
  notesEnabled: boolean;
  setNotesEnabled: (value: boolean) => void;
}

const defaultSettings: SettingsContextType = {
  highlightMatchingNumbers: true,
  setHighlightMatchingNumbers: () => {},
  showMistakes: true,
  setShowMistakes: () => {},
  hapticFeedback: true,
  setHapticFeedback: () => {},
  autoCheck: false,
  setAutoCheck: () => {},
  notesEnabled: true,
  setNotesEnabled: () => {},
};

export const SettingsContext = createContext<SettingsContextType>(defaultSettings);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [highlightMatchingNumbers, setHighlightMatchingNumbers] = useState(true);
  const [showMistakes, setShowMistakes] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoCheck, setAutoCheck] = useState(false);
  const [notesEnabled, setNotesEnabled] = useState(true);

  // Load settings from AsyncStorage when provider mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const highlightSetting = await AsyncStorage.getItem('highlightMatchingNumbers');
        if (highlightSetting !== null) {
          setHighlightMatchingNumbers(highlightSetting === 'true');
        }
        
        const showMistakesSetting = await AsyncStorage.getItem('showMistakes');
        if (showMistakesSetting !== null) {
          setShowMistakes(showMistakesSetting === 'true');
        }
        
        const hapticFeedbackSetting = await AsyncStorage.getItem('hapticFeedback');
        if (hapticFeedbackSetting !== null) {
          setHapticFeedback(hapticFeedbackSetting === 'true');
        }
        
        const autoCheckSetting = await AsyncStorage.getItem('autoCheck');
        if (autoCheckSetting !== null) {
          setAutoCheck(autoCheckSetting === 'true');
        }
        
        const notesEnabledSetting = await AsyncStorage.getItem('notesEnabled');
        if (notesEnabledSetting !== null) {
          setNotesEnabled(notesEnabledSetting === 'true');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Handle highlightMatchingNumbers changes
  useEffect(() => {
    const saveSetting = async () => {
      try {
        await AsyncStorage.setItem('highlightMatchingNumbers', highlightMatchingNumbers.toString());
      } catch (error) {
        console.error('Error saving highlightMatchingNumbers setting:', error);
      }
    };
    
    saveSetting();
  }, [highlightMatchingNumbers]);

  // Handle showMistakes changes
  useEffect(() => {
    const saveSetting = async () => {
      try {
        await AsyncStorage.setItem('showMistakes', showMistakes.toString());
      } catch (error) {
        console.error('Error saving showMistakes setting:', error);
      }
    };
    
    saveSetting();
  }, [showMistakes]);

  // Handle hapticFeedback changes
  useEffect(() => {
    const saveSetting = async () => {
      try {
        await AsyncStorage.setItem('hapticFeedback', hapticFeedback.toString());
      } catch (error) {
        console.error('Error saving hapticFeedback setting:', error);
      }
    };
    
    saveSetting();
  }, [hapticFeedback]);

  // Handle autoCheck changes
  useEffect(() => {
    const saveSetting = async () => {
      try {
        await AsyncStorage.setItem('autoCheck', autoCheck.toString());
      } catch (error) {
        console.error('Error saving autoCheck setting:', error);
      }
    };
    
    saveSetting();
  }, [autoCheck]);

  // Handle notesEnabled changes
  useEffect(() => {
    const saveSetting = async () => {
      try {
        await AsyncStorage.setItem('notesEnabled', notesEnabled.toString());
      } catch (error) {
        console.error('Error saving notesEnabled setting:', error);
      }
    };
    
    saveSetting();
  }, [notesEnabled]);

  return (
    <SettingsContext.Provider
      value={{
        highlightMatchingNumbers,
        setHighlightMatchingNumbers,
        showMistakes,
        setShowMistakes,
        hapticFeedback,
        setHapticFeedback,
        autoCheck,
        setAutoCheck,
        notesEnabled,
        setNotesEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to easily access settings context
export const useSettings = () => useContext(SettingsContext);