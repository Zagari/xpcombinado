import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity, UserActivity } from '../types';

interface ActivityCardProps {
  activity: Activity | UserActivity;
  completed: boolean;
  onToggle: () => void;
}

export default function ActivityCard({
  activity,
  completed,
  onToggle,
}: ActivityCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, completed && styles.containerCompleted]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text
          style={[styles.name, completed && styles.nameCompleted]}
          numberOfLines={2}
        >
          {activity.name}
        </Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{activity.points} pts</Text>
        </View>
      </View>

      <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  containerCompleted: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  nameCompleted: {
    color: '#22c55e',
  },
  pointsBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
