import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/useTheme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        tabBarStyle: { backgroundColor: theme.surface },
        tabBarActiveTintColor: theme.calories,
        tabBarInactiveTintColor: theme.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-meal"
        options={{
          title: 'Add Meal',
          tabBarIcon: ({ color, size }) => <Ionicons name="camera-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
