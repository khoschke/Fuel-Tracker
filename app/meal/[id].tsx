import React, { useCallback, useState } from 'react';
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
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getMealById, updateMeal, deleteMeal } from '../../src/storage';
import { Meal, MealType, MEAL_TYPES } from '../../src/types';
import { useTheme } from '../../src/theme/useTheme';
import { round } from '../../src/utils/format';

export default function MealDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [meal, setMeal] = useState<Meal | null>(null);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const found = await getMealById(id);
    if (!found) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setMeal(found);
    setMealType(found.mealType);
    setDescription(found.description);
    setCalories(String(found.calories));
    setProtein(String(found.protein_g));
    setCarbs(String(found.carbs_g));
    setFat(String(found.fat_g));
    setNote(found.note);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onSave() {
    if (!id) return;
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
      await updateMeal(id, {
        mealType,
        description: description.trim() || 'Meal',
        calories: round(cal),
        protein_g: round(p),
        carbs_g: round(c),
        fat_g: round(f),
        note: note.trim(),
      });
      router.back();
    } catch {
      Alert.alert('Could not save', 'Something went wrong updating this meal. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function onDelete() {
    if (!id) return;
    Alert.alert('Delete this meal?', 'This removes it from your day and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteMeal(id);
            router.back();
          } catch {
            setDeleting(false);
            Alert.alert('Could not delete', 'Something went wrong. Please try again.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.calories} />
      </View>
    );
  }

  if (notFound || !meal) {
    return (
      <View style={[styles.center, { backgroundColor: theme.page }]}>
        <Text style={[styles.notFound, { color: theme.textSecondary }]}>
          This meal is no longer here.
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.primaryButton, { backgroundColor: theme.calories }]}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.page }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: meal.photoUri }} style={styles.photo} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 16 }]}>Meal type</Text>
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

        <EditField label="Description" value={description} onChangeText={setDescription} theme={theme} />
        <EditField label="Calories (kcal)" value={calories} onChangeText={setCalories} keyboardType="numeric" theme={theme} />
        <EditField label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" theme={theme} />
        <EditField label="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" theme={theme} />
        <EditField label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="numeric" theme={theme} />
        <EditField
          label="Note"
          value={note}
          onChangeText={setNote}
          theme={theme}
          multiline
          placeholder="Portion size, brand, how it was cooked..."
        />

        <Pressable
          onPress={onSave}
          disabled={saving || deleting}
          style={[styles.primaryButton, { backgroundColor: theme.calories, opacity: saving || deleting ? 0.6 : 1 }]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save changes</Text>}
        </Pressable>

        <Pressable
          onPress={onDelete}
          disabled={saving || deleting}
          style={[styles.deleteButton, { borderColor: theme.critical, opacity: saving || deleting ? 0.6 : 1 }]}
        >
          {deleting ? (
            <ActivityIndicator color={theme.critical} />
          ) : (
            <Text style={[styles.deleteButtonText, { color: theme.critical }]}>Delete meal</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  theme,
  keyboardType,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  theme: ReturnType<typeof useTheme>;
  keyboardType?: 'numeric' | 'default';
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.card },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  notFound: {
    fontSize: 15,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#ccc',
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
    marginBottom: 20,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
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
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
