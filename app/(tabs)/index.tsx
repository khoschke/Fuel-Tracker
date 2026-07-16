import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, AppState } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getSettings, getMealsForDate, getCaloriesByDate } from '../../src/storage';
import { Meal, MealType, Settings, MEAL_TYPES } from '../../src/types';
import { useTheme } from '../../src/theme/useTheme';
import { todayKey, lastNDayKeys, shortDayLabel, daysUntil } from '../../src/utils/date';
import { round } from '../../src/utils/format';
import { MacroMeter } from '../../src/components/MacroMeter';
import { WeeklyChart } from '../../src/components/WeeklyChart';
import { RaceCountdown } from '../../src/components/RaceCountdown';
import { FuelReferenceCard } from '../../src/components/FuelReferenceCard';
import { MealListItem } from '../../src/components/MealListItem';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [weekData, setWeekData] = useState<{ key: string; label: string; calories: number; isToday: boolean }[]>([]);

  const load = useCallback(async () => {
    const [s, meals] = await Promise.all([getSettings(), getMealsForDate(todayKey())]);
    const days = lastNDayKeys(7);
    const caloriesByDate = await getCaloriesByDate(days);
    const today = todayKey();

    setSettings(s);
    setTodaysMeals(meals);
    setWeekData(
      days.map((key) => ({
        key,
        label: shortDayLabel(key),
        calories: caloriesByDate[key] ?? 0,
        isToday: key === today,
      }))
    );
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Reload when the app comes back to the foreground, so a day boundary
  // crossed while the app was backgrounded is picked up without a tab switch.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        load();
      }
    });
    return () => subscription.remove();
  }, [load]);

  if (loading || !settings) {
    return (
      <View style={[styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.calories} />
      </View>
    );
  }

  const totals = todaysMeals.reduce(
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
    meals: todaysMeals.filter((m) => m.mealType === mt.value),
  })).filter((g) => g.meals.length > 0);

  return (
    <ScrollView style={{ backgroundColor: theme.page }} contentContainerStyle={styles.content}>
      <RaceCountdown raceName={settings.raceName} daysRemaining={daysUntil(settings.raceDate)} theme={theme} />

      <MacroMeter label="Calories" value={totals.calories} target={settings.calTarget} unit=" kcal" color={theme.calories} theme={theme} />
      <MacroMeter label="Carbohydrate" value={totals.carbs} target={settings.carbTarget} unit="g" color={theme.carbs} theme={theme} emphasized />
      <MacroMeter label="Protein" value={totals.protein} target={settings.proteinTarget} unit="g" color={theme.protein} theme={theme} />
      <MacroMeter label="Fat" value={totals.fat} target={settings.fatTarget} unit="g" color={theme.fat} theme={theme} />

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 8 }]}>
        <WeeklyChart data={weekData} target={settings.calTarget} theme={theme} />
      </View>

      <View style={styles.mealsSection}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's meals</Text>
        {groups.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No meals logged yet today</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Photograph your first meal to see it here.
            </Text>
            <Pressable
              onPress={() => router.push('/add-meal')}
              style={[styles.emptyButton, { backgroundColor: theme.calories }]}
            >
              <Text style={styles.emptyButtonText}>Add a meal</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {groups.map((g) => (
              <View key={g.type} style={styles.mealGroup}>
                <Text style={[styles.groupLabel, { color: theme.textMuted }]}>{g.label}</Text>
                {g.meals.map((m) => (
                  <MealListItem key={m.id} meal={m} theme={theme} />
                ))}
              </View>
            ))}
            <View style={[styles.totalRow, { borderColor: theme.border }]}>
              <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Daily total</Text>
              <Text style={[styles.totalValue, { color: theme.textPrimary }]}>
                {round(totals.calories)} kcal · P{round(totals.protein)}g · C{round(totals.carbs)}g · F{round(totals.fat)}g
              </Text>
            </View>
          </>
        )}
      </View>

      <FuelReferenceCard theme={theme} />
    </ScrollView>
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
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  mealsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
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
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
