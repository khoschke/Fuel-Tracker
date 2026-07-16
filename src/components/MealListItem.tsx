import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Meal } from '../types';
import { Palette } from '../theme/colors';
import { round } from '../utils/format';

export function MealListItem({
  meal,
  theme,
  onPress,
}: {
  meal: Meal;
  theme: Palette;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${meal.description}, ${round(meal.calories)} calories. Tap to edit or delete.`}
    >
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
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={styles.chevron} />
    </Pressable>
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
  chevron: {
    marginLeft: 4,
  },
});
