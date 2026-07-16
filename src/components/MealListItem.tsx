import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Meal } from '../types';
import { Palette } from '../theme/colors';
import { round } from '../utils/format';

export function MealListItem({ meal, theme }: { meal: Meal; theme: Palette }) {
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Image source={{ uri: meal.photoUri }} style={styles.photo} />
      <View style={styles.details}>
        <Text style={[styles.description, { color: theme.textPrimary }]} numberOfLines={1}>
          {meal.description}
        </Text>
        <Text style={[styles.macros, { color: theme.textSecondary }]}>
          {round(meal.calories)} kcal · P{round(meal.protein_g)}g · C{round(meal.carbs_g)}g · F{round(meal.fat_g)}g
        </Text>
        {meal.confidence !== 'high' && (
          <Text style={[styles.confidence, { color: theme.textMuted }]}>
            {meal.confidence} confidence estimate
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
  },
  macros: {
    fontSize: 12,
    marginTop: 2,
  },
  confidence: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
