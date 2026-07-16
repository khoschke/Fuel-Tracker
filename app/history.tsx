import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getSettings, getLoggedDates, getDailyTotals, DayTotals } from '../src/storage';
import { Settings } from '../src/types';
import { useTheme } from '../src/theme/useTheme';
import { friendlyDateLabel } from '../src/utils/date';
import { round } from '../src/utils/format';

const DAYS_TO_SHOW = 60;

export default function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [days, setDays] = useState<DayTotals[]>([]);

  const load = useCallback(async () => {
    const s = await getSettings();
    const dates = await getLoggedDates(DAYS_TO_SHOW);
    const totalsByDate = await getDailyTotals(dates);
    setSettings(s);
    setDays(dates.map((d) => totalsByDate[d]).filter(Boolean));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !settings) {
    return (
      <View style={[styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.calories} />
      </View>
    );
  }

  if (days.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.page }]}>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No history yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Days you log meals will appear here so you can look back over your week.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.page }} contentContainerStyle={styles.content}>
      {days.map((day) => {
        const pct = settings.calTarget > 0 ? Math.min(100, (day.calories / settings.calTarget) * 100) : 0;
        const hitCarbs = day.carbs_g >= settings.carbTarget;
        return (
          <Pressable
            key={day.date}
            onPress={() => router.push(`/day/${day.date}`)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.rowHeader}>
              <Text style={[styles.dateLabel, { color: theme.textPrimary }]}>{friendlyDateLabel(day.date)}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </View>

            <View style={styles.calorieRow}>
              <Text style={[styles.calorieValue, { color: theme.textPrimary }]}>
                {round(day.calories)}
                <Text style={[styles.calorieTarget, { color: theme.textMuted }]}> / {round(settings.calTarget)} kcal</Text>
              </Text>
              <Text style={[styles.mealCount, { color: theme.textMuted }]}>
                {day.mealCount} {day.mealCount === 1 ? 'meal' : 'meals'}
              </Text>
            </View>

            <View style={[styles.track, { backgroundColor: theme.gridline }]}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.calories }]} />
            </View>

            <Text style={[styles.macroLine, { color: theme.textSecondary }]}>
              <Text style={{ color: hitCarbs ? theme.good : theme.textSecondary, fontWeight: hitCarbs ? '700' : '400' }}>
                C{round(day.carbs_g)}g
              </Text>
              {'  ·  '}P{round(day.protein_g)}g{'  ·  '}F{round(day.fat_g)}g
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  calorieValue: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  calorieTarget: {
    fontSize: 13,
    fontWeight: '400',
  },
  mealCount: {
    fontSize: 12,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: 8,
    borderRadius: 999,
  },
  macroLine: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});
