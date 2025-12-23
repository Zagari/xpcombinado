import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenTimeSettingsScreenProps } from '../navigation/types';
import { useAuthStore, useScreenTimeStore } from '../stores';
import { UserScreenTimeConversion } from '../types';

function formatMinutesLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

export default function ScreenTimeSettingsScreen({ navigation }: ScreenTimeSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { conversions, fetchConversions, updateConversion, resetToDefaults, isLoading } =
    useScreenTimeStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingConversion, setEditingConversion] = useState<UserScreenTimeConversion | null>(null);
  const [points, setPoints] = useState('');
  const [minutes, setMinutes] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchConversions(user.id);
    }
  }, [user?.id]);

  const openEditModal = (conversion: UserScreenTimeConversion) => {
    setEditingConversion(conversion);
    setPoints(String(conversion.points));
    setMinutes(String(conversion.minutes));
    setModalVisible(true);
  };

  const validateConversion = (newPoints: number, newMinutes: number): string | null => {
    if (!editingConversion) return null;

    // Criar lista simulada com o novo valor
    const updatedConversions = conversions
      .map((c) =>
        c.id === editingConversion.id
          ? { ...c, points: newPoints, minutes: newMinutes }
          : c
      )
      .sort((a, b) => a.points - b.points);

    // Verificar se os minutos estão em ordem crescente conforme os pontos aumentam
    for (let i = 1; i < updatedConversions.length; i++) {
      const prev = updatedConversions[i - 1];
      const curr = updatedConversions[i];

      if (curr.minutes < prev.minutes) {
        return `Faixas com mais pontos devem ter mais tempo de tela. ${curr.points} pts (${formatMinutesLabel(curr.minutes)}) não pode ter menos tempo que ${prev.points} pts (${formatMinutesLabel(prev.minutes)}).`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const pointsNum = parseInt(points, 10);
    const minutesNum = parseInt(minutes, 10);

    if (isNaN(pointsNum) || pointsNum < 1) {
      Alert.alert('Erro', 'Pontos devem ser maior que 0');
      return;
    }

    if (isNaN(minutesNum) || minutesNum < 1) {
      Alert.alert('Erro', 'Minutos devem ser maior que 0');
      return;
    }

    if (!editingConversion) return;

    // Validar consistencia da tabela
    const validationError = validateConversion(pointsNum, minutesNum);
    if (validationError) {
      Alert.alert('Erro de Validação', validationError);
      return;
    }

    const { error } = await updateConversion(editingConversion.id, pointsNum, minutesNum);
    if (error) {
      Alert.alert('Erro', error);
      return;
    }

    setModalVisible(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar Padrão',
      'Isso vai restaurar a tabela de conversão para os valores originais. Deseja continuar?',
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
              Alert.alert('Sucesso', 'Tabela restaurada para o padrão');
            }
          },
        },
      ]
    );
  };

  const renderConversion = ({ item }: { item: UserScreenTimeConversion }) => (
    <View style={styles.conversionCard}>
      <View style={styles.conversionInfo}>
        <Text style={styles.pointsText}>{item.points} pts</Text>
        <Text style={styles.arrowText}>=</Text>
        <Text style={styles.minutesText}>{formatMinutesLabel(item.minutes)}</Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openEditModal(item)}
      >
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversão de Pontos</Text>
        <Text style={styles.headerSubtitle}>
          {conversions.length} faixas de conversão
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Configure quantos pontos são necessários para ganhar tempo de tela
        </Text>
      </View>

      <FlatList
        data={conversions}
        renderItem={renderConversion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={[styles.resetButton, { bottom: 24 + insets.bottom }]}
        onPress={handleReset}
      >
        <Text style={styles.resetText}>Restaurar Padrão</Text>
      </TouchableOpacity>

      {/* Modal para Editar */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Conversão</Text>

            <Text style={styles.inputLabel}>Pontos necessários</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="10"
              placeholderTextColor="#999"
              value={points}
              onChangeText={setPoints}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.inputLabel}>Tempo de tela (minutos)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="15"
              placeholderTextColor="#999"
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
              maxLength={3}
            />

            <View style={styles.previewBox}>
              <Text style={styles.previewText}>
                {points || '0'} pts = {formatMinutesLabel(parseInt(minutes, 10) || 0)}
              </Text>
            </View>

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
  infoBox: {
    backgroundColor: '#e0e7ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    color: '#6366f1',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  conversionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conversionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    width: 70,
  },
  arrowText: {
    fontSize: 18,
    color: '#999',
    marginHorizontal: 12,
  },
  minutesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
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
  previewBox: {
    backgroundColor: '#e0e7ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
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
