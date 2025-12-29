import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivitiesScreenProps } from '../navigation/types';
import { useChildrenStore, useActivitiesStore, useAuthStore, useScreenTimeStore, useSubscriptionStore, useFamilySafetyStore } from '../stores';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../constants/activities';
import { UserActivity, ActivityCategory } from '../types';
import ActivityCard from '../components/ActivityCard';

export default function ActivitiesScreen({ navigation }: ActivitiesScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { selectedChild, dailyRecords, toggleActivity, resetDay, getTotalPoints } =
    useChildrenStore();
  const { activities, fetchActivities } = useActivitiesStore();
  const { fetchConversions, calculateScreenTime, getNextTier } = useScreenTimeStore();
  const { isPremium } = useSubscriptionStore();
  const {
    connection,
    mappings,
    activeSessions,
    isLoading: isFamilySafetyLoading,
    fetchConnection,
    fetchMappings,
    fetchActiveSessions,
    releaseTime,
    cancelSession,
  } = useFamilySafetyStore();

  const [countdown, setCountdown] = useState<string | null>(null);

  // Check if this child has a MS Family mapping
  const childMapping = useMemo(() => {
    if (!selectedChild) return null;
    return mappings.find((m) => m.child_id === selectedChild.id);
  }, [selectedChild, mappings]);

  // Check if this child has an active session
  const activeSession = useMemo(() => {
    if (!selectedChild) return null;
    return activeSessions.find((s) => s.child_id === selectedChild.id && s.status === 'active');
  }, [selectedChild, activeSessions]);

  // Can show release button?
  const canReleaseTime = isPremium && connection?.is_connected && childMapping && !activeSession;

  useEffect(() => {
    if (user?.id) {
      fetchActivities(user.id);
      fetchConversions(user.id);
      fetchConnection(user.id);
      fetchMappings();
      fetchActiveSessions();
    }
  }, [user?.id]);

  // Countdown timer for active session
  useEffect(() => {
    if (!activeSession) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expires = new Date(activeSession.expires_at).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setCountdown('Expirado');
        fetchActiveSessions(); // Refresh to get updated status
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

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

  const handleReleaseTime = () => {
    if (!selectedChild || screenTime.minutes === 0) {
      Alert.alert('Sem tempo', 'Complete atividades para ganhar tempo de tela.');
      return;
    }

    Alert.alert(
      'Liberar Tempo',
      `Liberar ${screenTime.label} de tela para ${selectedChild.name}?\n\nOs dispositivos Windows/Android serao desbloqueados automaticamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          onPress: async () => {
            const { error } = await releaseTime(selectedChild.id, screenTime.minutes);
            if (error) {
              Alert.alert('Erro', error);
            } else {
              Alert.alert('Sucesso', `${screenTime.label} liberados para ${selectedChild.name}!`);
            }
          },
        },
      ]
    );
  };

  const handleCancelSession = () => {
    if (!activeSession) return;

    Alert.alert(
      'Cancelar Tempo',
      'Tem certeza que deseja cancelar o tempo liberado? Os dispositivos serao bloqueados novamente.',
      [
        { text: 'Nao', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await cancelSession(activeSession.id);
            if (error) {
              Alert.alert('Erro', error);
            }
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

        {/* Active Session Status */}
        {activeSession && (
          <View style={styles.sessionCard}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionIcon}>🎮</Text>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionTitle}>Tempo Liberado</Text>
                <Text style={styles.sessionCountdown}>
                  Restante: {countdown || 'Calculando...'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.cancelSessionButton}
              onPress={handleCancelSession}
              disabled={isFamilySafetyLoading}
            >
              {isFamilySafetyLoading ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Text style={styles.cancelSessionText}>Cancelar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Release Time Button */}
        {canReleaseTime && screenTime.minutes > 0 && (
          <TouchableOpacity
            style={styles.releaseButton}
            onPress={handleReleaseTime}
            disabled={isFamilySafetyLoading}
          >
            {isFamilySafetyLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.releaseButtonIcon}>🎮</Text>
                <Text style={styles.releaseButtonText}>Liberar Tempo no Dispositivo</Text>
              </>
            )}
          </TouchableOpacity>
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
      <TouchableOpacity
        style={[styles.resetButton, { bottom: 24 + insets.bottom }]}
        onPress={handleReset}
      >
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
  sessionCard: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sessionCountdown: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  cancelSessionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cancelSessionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  releaseButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  releaseButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  releaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
