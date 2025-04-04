import { Tabs } from 'expo-router';
import { Play, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  // Calculate additional padding for PWA
  const pwaBottomPadding = Platform.OS === 'web' ? 16 : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: pwaBottomPadding,
          height: 60 + pwaBottomPadding,
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Play',
          tabBarIcon: ({ color, size }) => <Play size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}