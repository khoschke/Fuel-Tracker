import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'anthropic_api_key';

// expo-secure-store has no web backend. Native (iOS/Android) is the real
// target for this app; the localStorage fallback exists only so a web
// preview of the UI doesn't crash.
export async function getApiKey(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
  }
  return SecureStore.getItemAsync(KEY);
}

export async function setApiKey(value: string): Promise<void> {
  const trimmed = value.trim();

  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    if (!trimmed) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, trimmed);
    }
    return;
  }

  if (!trimmed) {
    await SecureStore.deleteItemAsync(KEY);
    return;
  }
  await SecureStore.setItemAsync(KEY, trimmed);
}
