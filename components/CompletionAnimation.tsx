import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface CompletionAnimationProps {
  startPos: { x: number, y: number };
  onAnimationComplete: () => void;
  color?: string;
}

export default function CompletionAnimation({ 
  startPos, 
  onAnimationComplete,
  color = '#4CAF50' 
}: CompletionAnimationProps) {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);
  
  useEffect(() => {
    // Start the animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      }),
    ]).start(() => {
      // After showing animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        delay: 300,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    });
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  return (
    <View style={[styles.container, { left: startPos.x - 25, top: startPos.y - 25 }]}>
      <Animated.View
        style={[
          styles.animationCircle,
          {
            backgroundColor: color,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  animationCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});