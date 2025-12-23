import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivitiesSettingsScreenProps } from '../navigation/types';
import { useAuthStore, useActivitiesStore } from '../stores';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../constants/activities';
import { UserActivity, ActivityCategory } from '../types';

const CATEGORIES: ActivityCategory[] = [
  'hygiene',
  'organization',
  'chores',
  'pet_care',
  'development',
  'behavior',
];

export default function ActivitiesSettingsScreen({ navigation }: ActivitiesSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { activities, fetchActivities, addActivity, updateActivity, deleteActivity, resetToDefaults, isLoading } =
    useActivitiesStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<UserActivity | null>(null);
  const [name, setName] = useState('');
  const [points, setPoints] = useState('1');
  const [category, setCategory] = useState<ActivityCategory>('hygiene');

  useEffect(() => {
    if (user?.id) {
      fetchActivities(user.id);
    }
  }, [user?.id]);

  const sections = useMemo(() => {
    const grouped = activities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = [];
      }
      acc[activity.category].push(activity);
      return acc;
    }, {} as Record<ActivityCategory, UserActivity[]>);

    return Object.entries(grouped).map(([cat, data]) => ({
      title: `${CATEGORY_ICONS[cat as ActivityCategory]} ${CATEGORY_LABELS[cat as ActivityCategory]}`,
      category: cat as ActivityCategory,
      data,
    }));
  }, [activities]);

  const openAddModal = () => {
    setEditingActivity(null);
    setName('');
    setPoints('1');
    setCategory('hygiene');
    setModalVisible(true);
  };

  const openEditModal = (activity: UserActivity) => {
    setEditingActivity(activity);
    setName(activity.name);
    setPoints(String(activity.points));
    setCategory(activity.category);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite o nome da atividade');
      return;
    }

    const pointsNum = parseInt(points, 10);
    if (isNaN(pointsNum) || pointsNum < 1 || pointsNum > 10) {
      Alert.alert('Erro', 'Pontos devem ser entre 1 e 10');
      return;
    }

    if (!user?.id) return;

    if (editingActivity) {
      const { error } = await updateActivity(editingActivity.id, name.trim(), pointsNum, category);
      if (error) {
        Alert.alert('Erro', error);
        return;
      }
    } else {
      const { error } = await addActivity(user.id, name.trim(), pointsNum, category);
      if (error) {
        Alert.alert('Erro', error);
        return;
      }
    }

    setModalVisible(false);
  };

  const handleDelete = (activity: UserActivity) => {
    Alert.alert(
      'Deletar Atividade',
      `Deseja remover "${activity.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteActivity(activity.id);
            if (error) {
              Alert.alert('Erro', error);
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar Padrão',
      'Isso vai apagar todas as suas atividades personalizadas e restaurar a lista original. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            const { error } = await resetToDefaults(user.id);
            if (error) {
              Alert.alert('Erro', error);
            } else {
              Alert.alert('Sucesso', 'Atividades restauradas para o padrão');
            }
          },
        },
      ]
    );
  };

  const renderActivity = ({ item }: { item: UserActivity }) => (
    <View style={styles.activityCard}>
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{item.name}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{item.points} pts</Text>
        </View>
      </View>
      <View style={styles.activityActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteText}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurar Atividades</Text>
        <Text style={styles.headerSubtitle}>
          {activities.length} atividades configuradas
        </Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Nova Atividade</Text>
      </TouchableOpacity>

      <SectionList
        sections={sections}
        renderItem={renderActivity}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />

      <TouchableOpacity
        style={[styles.resetButton, { bottom: 24 + insets.bottom }]}
        onPress={handleReset}
      >
        <Text style={styles.resetText}>Restaurar Padrão</Text>
      </TouchableOpacity>

      {/* Modal para Adicionar/Editar */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
            </Text>

            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da atividade"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Pontos (1-10)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="1"
              placeholderTextColor="#999"
              value={points}
              onChangeText={setPoints}
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={styles.inputLabel}>Categoria</Text>
            <View style={styles.categoryPicker}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {CATEGORY_ICONS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.categoryLabel}>
              {CATEGORY_LABELS[category]}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleSave}
              >
                <Text style={styles.modalConfirmText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#6366f1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
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
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  activityActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
  },
  editText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  categoryPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryOptionSelected: {
    backgroundColor: '#6366f1',
  },
  categoryOptionText: {
    fontSize: 20,
  },
  categoryOptionTextSelected: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
