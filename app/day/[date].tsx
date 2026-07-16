import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getSettings, getMealsForDate } from '../../src/storage';
import { Meal, MealType, Settings, MEAL_TYPES } from '../../src/types';
import { useTheme } from '../../src/theme/useTheme';
import { friendlyDateLabel } from '../../src/utils/date';
import { round } from '../../src/utils/format';
import { MealListItem } from '../../src/components/MealListItem';

export default function DayDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);

  const load = useCallback(async () => {
    if (!date) {
      setLoading(false);
      return;
    }
    const [s, dayMeals] = await Promise.all([getSettings(), getMealsForDate(date)]);
    setSettings(s);
    setMeals(dayMeals);
    setLoading(false);
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const title = date ? friendlyDateLabel(date) : 'Day';

  if (loading || !settings) {
    return (
      <View style={[styles.center, { backgroundColor: theme.page }]}>
        <Stack.Screen options={{ title }} />
        <ActivityIndicator color={theme.calories} />
      </View>
    );
  }

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein_g,
      carbs: acc.carbs + m.carbs_g,
      fat: acc.fat + m.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const groups = MEAL_TYPES.map((mt) => ({
    type: mt.value as MealType,
    label: mt.label,
    meals: meals.filter((m) => m.mealType === mt.value),
  })).filter((g) => g.meals.length > 0);

  const hitCarbs = totals.carbs >= settings.carbTarget;

  return (
    <ScrollView style={{ backgroundColor: theme.page }} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />

      {groups.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Nothing logged on this day</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Any meals for this day were removed.
          </Text>
        </View>
      ) : (
        <>
          {groups.map((g) => (
            <View key={g.type} style={styles.mealGroup}>
              <Text style={[styles.groupLabel, { color: theme.textMuted }]}>{g.label}</Text>
              {g.meals.map((m) => (
                <MealListItem key={m.id} meal={m} theme={theme} onPress={() => router.push(`/meal/${m.id}`)} />
              ))}
            </View>
          ))}

          <View style={[styles.totalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Day total</Text>
            <View style={styles.totalGrid}>
              <TotalCell label="Calories" value={`${round(totals.calories)}`} target={`${round(settings.calTarget)}`} theme={theme} />
              <TotalCell
                label="Carbs"
                value={`${round(totals.carbs)}g`}
                target={`${round(settings.carbTarget)}g`}
                theme={theme}
                highlight={hitCarbs ? theme.good : undefined}
              />
              <TotalCell label="Protein" value={`${round(totals.protein)}g`} target={`${round(settings.proteinTarget)}g`} theme={theme} />
              <TotalCell label="Fat" value={`${round(totals.fat)}g`} target={`${round(settings.fatTarget)}g`} theme={theme} />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function TotalCell({
  label,
  value,
  target,
  theme,
  highlight,
}: {
  label: string;
  value: string;
  target: string;
  theme: ReturnType<typeof useTheme>;
  highlight?: string;
}) {
  return (
    <View style={styles.totalCell}>
      <Text style={[styles.cellLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.cellValue, { color: highlight ?? theme.textPrimary }]}>
        {value}
        <Text style={[styles.cellTarget, { color: theme.textMuted }]}> / {target}</Text>
      </Text>
    </View>
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
  mealGroup: {
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  totalCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  totalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  totalCell: {
    width: '50%',
    marginBottom: 12,
  },
  cellLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cellTarget: {
    fontSize: 13,
    fontWeight: '400',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
