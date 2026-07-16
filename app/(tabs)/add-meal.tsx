import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { MEAL_TYPES, MealType, Confidence } from '../../src/types';
import { addMeal } from '../../src/storage';
import { estimateMeal, EstimateError } from '../../src/ai/estimateMeal';
import { useTheme } from '../../src/theme/useTheme';
import { todayKey } from '../../src/utils/date';
import { round } from '../../src/utils/format';

type Stage = 'capture' | 'estimating' | 'review';

function friendlyEstimateError(err: unknown): string {
  if (err instanceof EstimateError) {
    if (err.kind === 'no-api-key') return 'No Anthropic API key is set yet. Add one in Settings, then try again.';
    if (err.kind === 'network') return 'Could not reach the internet. Check your connection and try again.';
    if (err.kind === 'api') return `The estimate service had a problem: ${err.message}`;
    if (err.kind === 'parse') return 'Could not read the estimate that came back. You can still enter the numbers yourself below.';
  }
  return 'Something went wrong getting the estimate. You can still enter the numbers yourself below.';
}

export default function AddMealScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('capture');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('medium');

  function resetForm() {
    setMealType('breakfast');
    setNote('');
    setPhotoUri(null);
    setStage('capture');
    setErrorMessage(null);
    setDescription('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setConfidence('medium');
  }

  async function runEstimate(uri: string) {
    setPhotoUri(uri);
    setStage('estimating');
    setErrorMessage(null);
    try {
      const result = await estimateMeal(uri, note);
      setDescription(result.description);
      setCalories(String(result.calories));
      setProtein(String(result.protein_g));
      setCarbs(String(result.carbs_g));
      setFat(String(result.fat_g));
      setConfidence(result.confidence);
      setStage('review');
    } catch (err) {
      setErrorMessage(friendlyEstimateError(err));
      setDescription('');
      setCalories('0');
      setProtein('0');
      setCarbs('0');
      setFat('0');
      setConfidence('low');
      setStage('review');
    }
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Fuel Tracker needs photo library access to choose a meal photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      await runEstimate(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Fuel Tracker needs camera access to photograph a meal.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      await runEstimate(result.assets[0].uri);
    }
  }

  async function onConfirmSave() {
    if (!photoUri) return;
    const cal = Number(calories);
    const p = Number(protein);
    const c = Number(carbs);
    const f = Number(fat);
    if (![cal, p, c, f].every((n) => Number.isFinite(n) && n >= 0)) {
      Alert.alert('Check your numbers', 'Calories, protein, carbs and fat must be zero or more.');
      return;
    }

    setSaving(true);
    try {
      const mealPhotosDir = new Directory(Paths.document, 'meal-photos');
      if (!mealPhotosDir.exists) {
        mealPhotosDir.create({ intermediates: true, idempotent: true });
      }
      const destinationFile = new File(mealPhotosDir, `${Date.now()}.jpg`);
      await new File(photoUri).copy(destinationFile);

      await addMeal({
        date: todayKey(),
        mealType,
        description: description.trim() || 'Meal',
        photoUri: destinationFile.uri,
        calories: round(cal),
        protein_g: round(p),
        carbs_g: round(c),
        fat_g: round(f),
        confidence,
        note: note.trim(),
      });

      resetForm();
      router.push('/');
    } catch {
      Alert.alert('Could not save', 'Something went wrong saving this meal. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.page }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        {stage === 'capture' && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Meal type</Text>
            <View style={styles.chipRow}>
              {MEAL_TYPES.map((mt) => (
                <Pressable
                  key={mt.value}
                  onPress={() => setMealType(mt.value)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: mealType === mt.value ? theme.calories : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: mealType === mt.value ? '#fff' : theme.textPrimary, fontSize: 13 }}>
                    {mt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 20 }]}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Portion size, brand, how it was cooked..."
              placeholderTextColor={theme.textMuted}
              style={[styles.noteInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.card }]}
              multiline
            />

            <View style={styles.captureButtons}>
              <Pressable onPress={takePhoto} style={[styles.captureButton, { backgroundColor: theme.calories }]}>
                <Text style={styles.captureButtonText}>Take Photo</Text>
              </Pressable>
              <Pressable onPress={pickFromLibrary} style={[styles.captureButton, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
                <Text style={[styles.captureButtonText, { color: theme.textPrimary }]}>Choose from Library</Text>
              </Pressable>
            </View>
          </>
        )}

        {stage === 'estimating' && (
          <View style={styles.center}>
            {photoUri && <Image source={{ uri: photoUri }} style={styles.previewImage} />}
            <ActivityIndicator color={theme.calories} style={{ marginTop: 16 }} />
            <Text style={[styles.estimatingText, { color: theme.textSecondary }]}>Estimating nutrition...</Text>
          </View>
        )}

        {stage === 'review' && (
          <>
            {photoUri && <Image source={{ uri: photoUri }} style={styles.previewImage} />}
            {errorMessage && (
              <Text style={[styles.errorText, { color: theme.critical }]}>{errorMessage}</Text>
            )}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 16 }]}>Review estimate</Text>
            <Text style={[styles.confidenceText, { color: theme.textMuted }]}>Confidence: {confidence}</Text>

            <ReviewField label="Description" value={description} onChangeText={setDescription} theme={theme} />
            <ReviewField label="Calories (kcal)" value={calories} onChangeText={setCalories} keyboardType="numeric" theme={theme} />
            <ReviewField label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" theme={theme} />
            <ReviewField label="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" theme={theme} />
            <ReviewField label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="numeric" theme={theme} />

            <View style={styles.reviewButtons}>
              <Pressable
                onPress={onConfirmSave}
                disabled={saving}
                style={[styles.captureButton, { backgroundColor: theme.calories, opacity: saving ? 0.6 : 1 }]}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureButtonText}>Confirm & Save</Text>}
              </Pressable>
              <Pressable onPress={resetForm} disabled={saving} style={[styles.captureButton, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
                <Text style={[styles.captureButtonText, { color: theme.textPrimary }]}>Discard</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ReviewField({
  label,
  value,
  onChangeText,
  theme,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  theme: ReturnType<typeof useTheme>;
  keyboardType?: 'numeric' | 'default';
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.card }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  captureButtons: {
    marginTop: 28,
    gap: 12,
  },
  captureButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#ccc',
  },
  estimatingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  confidenceText: {
    fontSize: 12,
    marginBottom: 12,
    textTransform: 'capitalize',
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
  reviewButtons: {
    marginTop: 12,
    gap: 12,
  },
});
