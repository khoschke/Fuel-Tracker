import * as SecureStore from 'expo-secure-store';

const KEY = 'anthropic_api_key';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY);
}

export async function setApiKey(value: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) {
    await SecureStore.deleteItemAsync(KEY);
    return;
  }
  await SecureStore.setItemAsync(KEY, trimmed);
}
