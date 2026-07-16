import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../src/theme/useTheme';

export default function RootLayout() {
  const theme = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="meal/[id]"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Meal',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.textPrimary,
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            headerShown: true,
            title: 'History',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.textPrimary,
          }}
        />
        <Stack.Screen
          name="day/[date]"
          options={{
            headerShown: true,
            title: 'Day',
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.textPrimary,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
