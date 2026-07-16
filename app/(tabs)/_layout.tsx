import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/useTheme';

function HistoryHeaderButton() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/history')}
      hitSlop={12}
      style={{ paddingHorizontal: 12 }}
      accessibilityRole="button"
      accessibilityLabel="View history of past days"
    >
      <Ionicons name="time-outline" size={22} color={theme.textPrimary} />
    </Pressable>
  );
}

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
          headerRight: () => <HistoryHeaderButton />,
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
