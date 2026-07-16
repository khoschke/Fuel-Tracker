import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getSettings, saveSettings, getApiKey, setApiKey } from '../../src/storage';
import { Settings } from '../../src/types';
import { useTheme } from '../../src/theme/useTheme';

function Field({
  label,
  value,
  onChangeText,
  theme,
  keyboardType,
  placeholder,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  theme: ReturnType<typeof useTheme>;
  keyboardType?: 'numeric' | 'default';
  placeholder?: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.card },
        ]}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calTarget, setCalTarget] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [carbTarget, setCarbTarget] = useState('');
  const [fatTarget, setFatTarget] = useState('');
  const [raceName, setRaceName] = useState('');
  const [raceDate, setRaceDate] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);

  const load = useCallback(async () => {
    const settings = await getSettings();
    setCalTarget(String(settings.calTarget));
    setProteinTarget(String(settings.proteinTarget));
    setCarbTarget(String(settings.carbTarget));
    setFatTarget(String(settings.fatTarget));
    setRaceName(settings.raceName);
    setRaceDate(settings.raceDate);
    const key = await getApiKey();
    setHasStoredKey(!!key);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function parseTarget(text: string): number | null {
    const n = Number(text);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n);
  }

  function isValidDate(text: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(new Date(text).getTime());
  }

  async function onSave() {
    const cal = parseTarget(calTarget);
    const protein = parseTarget(proteinTarget);
    const carb = parseTarget(carbTarget);
    const fat = parseTarget(fatTarget);

    if (cal === null || protein === null || carb === null || fat === null) {
      Alert.alert('Check your numbers', 'Targets must be positive numbers.');
      return;
    }
    if (!raceName.trim()) {
      Alert.alert('Race name needed', 'Enter a name for your race.');
      return;
    }
    if (!isValidDate(raceDate)) {
      Alert.alert('Check the race date', 'Use the format YYYY-MM-DD, e.g. 2026-08-30.');
      return;
    }

    setSaving(true);
    try {
      const settings: Settings = {
        calTarget: cal,
        proteinTarget: protein,
        carbTarget: carb,
        fatTarget: fat,
        raceName: raceName.trim(),
        raceDate,
      };
      await saveSettings(settings);

      if (apiKeyInput.trim()) {
        await setApiKey(apiKeyInput.trim());
        setHasStoredKey(true);
        setApiKeyInput('');
      }

      Alert.alert('Saved', 'Your settings have been saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.calories} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.page }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily targets</Text>
        <Field label="Calories (kcal)" value={calTarget} onChangeText={setCalTarget} keyboardType="numeric" theme={theme} />
        <Field label="Protein (g)" value={proteinTarget} onChangeText={setProteinTarget} keyboardType="numeric" theme={theme} />
        <Field label="Carbohydrate (g)" value={carbTarget} onChangeText={setCarbTarget} keyboardType="numeric" theme={theme} />
        <Field label="Fat (g)" value={fatTarget} onChangeText={setFatTarget} keyboardType="numeric" theme={theme} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 24 }]}>Race</Text>
        <Field label="Race name" value={raceName} onChangeText={setRaceName} theme={theme} />
        <Field label="Race date (YYYY-MM-DD)" value={raceDate} onChangeText={setRaceDate} placeholder="2026-08-30" theme={theme} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 24 }]}>Anthropic API key</Text>
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
          {hasStoredKey
            ? 'A key is saved on this device. Enter a new one below to replace it.'
            : 'Paste your Anthropic API key from console.anthropic.com to enable meal estimates. It is stored securely on this device only, never in the app’s code or in git.'}
        </Text>
        <Field
          label="API key"
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          placeholder={hasStoredKey ? '•••••••• (saved)' : 'sk-ant-...'}
          secureTextEntry
          theme={theme}
        />

        <Pressable
          onPress={onSave}
          disabled={saving}
          style={[styles.saveButton, { backgroundColor: theme.calories, opacity: saving ? 0.6 : 1 }]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 17,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
