import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SettingsScreenProps } from '../navigation/types';
import { useAuthStore, useActivitiesStore, useScreenTimeStore } from '../stores';

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user } = useAuthStore();
  const { activities, fetchActivities } = useActivitiesStore();
  const { conversions, fetchConversions } = useScreenTimeStore();

  useEffect(() => {
    if (user?.id) {
      fetchActivities(user.id);
      fetchConversions(user.id);
    }
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuracoes</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ActivitiesSettings')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>📋</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>Configurar Atividades</Text>
            <Text style={styles.menuSubtitle}>
              {activities.length} atividades configuradas
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ScreenTimeSettings')}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>⏱️</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>Configurar Tempo de Tela</Text>
            <Text style={styles.menuSubtitle}>
              {conversions.length} faixas de conversao
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  },
});
