import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '../theme/colors';
import { round } from '../utils/format';

interface DayValue {
  key: string;
  label: string;
  calories: number;
  isToday: boolean;
}

interface Props {
  data: DayValue[];
  target: number;
  theme: Palette;
}

const CHART_HEIGHT = 130;
const DASH_COUNT = 28;
// Headroom above the tallest mark so a bar's value label never rides up into
// the title/target row. The tallest bar reaches ~80% of the plot height.
const SCALE_HEADROOM = 1.25;

export function WeeklyChart({ data, target, theme }: Props) {
  const maxValue = Math.max(target, ...data.map((d) => d.calories), 1);
  const scale = maxValue * SCALE_HEADROOM;
  const targetTop = CHART_HEIGHT - (target / scale) * CHART_HEIGHT;

  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Calories, last 7 days</Text>
        <Text style={[styles.targetLabel, { color: theme.textMuted }]}>Target {round(target)}</Text>
      </View>
      <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
        <View style={[styles.dashRow, { top: targetTop }]} pointerEvents="none">
          {Array.from({ length: DASH_COUNT }).map((_, i) => (
            <View key={i} style={[styles.dash, { backgroundColor: theme.baseline }]} />
          ))}
        </View>
        <View style={styles.barsRow}>
          {data.map((d) => {
            const barHeight = Math.max(2, (d.calories / scale) * CHART_HEIGHT);
            return (
              <View key={d.key} style={styles.barColumn}>
                {/* value label + bar share one flex-end stack, so the label
                    sits directly above its own bar and rises with it */}
                {d.calories > 0 && (
                  <Text style={[styles.barValue, { color: d.isToday ? theme.calories : theme.textMuted }]}>
                    {round(d.calories)}
                  </Text>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: theme.calories,
                      opacity: d.isToday ? 1 : 0.55,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.barsRow}>
        {data.map((d) => (
          <View key={d.key} style={styles.barColumn}>
            <Text
              style={[
                styles.dayLabel,
                { color: theme.textMuted },
                d.isToday && { color: theme.textPrimary, fontWeight: '700' },
              ]}
            >
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  targetLabel: {
    fontSize: 12,
  },
  chartArea: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  dashRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dash: {
    width: 4,
    height: 1.5,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barValue: {
    fontSize: 10,
    marginBottom: 2,
    fontVariant: ['tabular-nums'],
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});
