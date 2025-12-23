import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivitiesScreenProps } from '../navigation/types';
import { useChildrenStore, useActivitiesStore, useAuthStore } from '../stores';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../constants/activities';
import { calculateScreenTime, getNextTier } from '../constants/screenTime';
import { UserActivity, ActivityCategory } from '../types';
import ActivityCard from '../components/ActivityCard';

export default function ActivitiesScreen({ navigation }: ActivitiesScreenProps) {
  const { user } = useAuthStore();
  const { selectedChild, dailyRecords, toggleActivity, resetDay, getTotalPoints } =
    useChildrenStore();
  const { activities, fetchActivities } = useActivitiesStore();

  useEffect(() => {
    if (user?.id) {
      fetchActivities(user.id);
    }
  }, [user?.id]);

  const totalPoints = getTotalPoints();
  const screenTime = calculateScreenTime(totalPoints);
  const nextTier = getNextTier(totalPoints);

  const sections = useMemo(() => {
    const grouped = activities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = [];
      }
      acc[activity.category].push(activity);
      return acc;
    }, {} as Record<ActivityCategory, UserActivity[]>);

    return Object.entries(grouped).map(([category, data]) => ({
      title: `${CATEGORY_ICONS[category as ActivityCategory]} ${CATEGORY_LABELS[category as ActivityCategory]}`,
      data,
    }));
  }, [activities]);

  const isActivityCompleted = (activityId: string) => {
    const record = dailyRecords.find((r) => r.activity_id === activityId);
    return record?.completed ?? false;
  };

  const handleToggle = async (activityId: string) => {
    if (!selectedChild) return;
    const today = new Date().toISOString().split('T')[0];
    await toggleActivity(selectedChild.id, activityId, today);
  };

  const handleReset = () => {
    Alert.alert(
      'Resetar Dia',
      `Tem certeza que deseja resetar todas as atividades de ${selectedChild?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            if (!selectedChild) return;
            const today = new Date().toISOString().split('T')[0];
            await resetDay(selectedChild.id, today);
          },
        },
      ]
    );
  };

  const renderActivity = ({ item }: { item: UserActivity }) => (
    <ActivityCard
      activity={item}
      completed={isActivityCompleted(item.id)}
      onToggle={() => handleToggle(item.id)}
    />
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  if (!selectedChild) {
    return (
      <View style={styles.container}>
        <Text>Nenhum filho selecionado</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{selectedChild.name}</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>pontos</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxHighlight]}>
            <Text style={styles.statValueHighlight}>{screenTime.label}</Text>
            <Text style={styles.statLabelHighlight}>tempo de tela</Text>
          </View>
        </View>

        {nextTier && (
          <Text style={styles.nextTierText}>
            +{nextTier.pointsNeeded} pts para {nextTier.reward}
          </Text>
        )}
      </View>

      {/* Activities List */}
      <SectionList
        sections={sections}
        renderItem={renderActivity}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Resetar Dia</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    backgroundColor: '#6366f1',
    padding: 20,
  },
  childInfo: {
    marginBottom: 16,
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statBoxHighlight: {
    backgroundColor: '#fff',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statValueHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabelHighlight: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
  },
  nextTierText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resetButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  resetText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
