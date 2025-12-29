import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { FamilySafetyScreenProps } from '../navigation/types';
import { useAuthStore, useChildrenStore, useFamilySafetyStore } from '../stores';

export default function FamilySafetyScreen({ navigation }: FamilySafetyScreenProps) {
  const { user } = useAuthStore();
  const { children } = useChildrenStore();
  const {
    connection,
    mappings,
    msAccounts,
    isLoading,
    fetchConnection,
    fetchMsAccounts,
    fetchMappings,
    setConnected,
    disconnect,
    createMapping,
    deleteMapping,
    getLoginUrl,
    handleOAuthCallback,
  } = useFamilySafetyStore();

  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState('');
  const [showCallbackModal, setShowCallbackModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConnection(user.id);
      fetchMappings();
    }
  }, [user]);

  useEffect(() => {
    if (connection?.is_connected) {
      fetchMsAccounts();
    }
  }, [connection?.is_connected]);

  const handleConnect = async () => {
    const loginUrl = await getLoginUrl();
    if (!loginUrl) {
      Alert.alert('Erro', 'Nao foi possivel obter URL de login. Verifique se o servidor esta configurado.');
      return;
    }

    await WebBrowser.openBrowserAsync(loginUrl);
    setShowCallbackModal(true);
  };

  const handleCallbackSubmit = async () => {
    if (!callbackUrl.trim()) {
      Alert.alert('Erro', 'Cole a URL de retorno');
      return;
    }

    const { error } = await handleOAuthCallback(callbackUrl);

    if (error) {
      Alert.alert('Erro', error);
      return;
    }

    if (user) {
      await setConnected(user.id);
    }

    setShowCallbackModal(false);
    setCallbackUrl('');
    Alert.alert('Sucesso', 'Conectado ao Microsoft Family Safety!');
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Desconectar',
      'Tem certeza que deseja desconectar do Microsoft Family Safety?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            if (user) {
              await disconnect(user.id);
            }
          },
        },
      ]
    );
  };

  const handleMapChild = (childId: string) => {
    setSelectedChildId(childId);
    setShowMappingModal(true);
  };

  const handleSelectMsAccount = async (msAccount: { id: string; name: string }) => {
    if (!selectedChildId) return;

    const { error } = await createMapping(
      selectedChildId,
      msAccount.id,
      msAccount.name
    );

    if (error) {
      Alert.alert('Erro', error);
    } else {
      setShowMappingModal(false);
      setSelectedChildId(null);
    }
  };

  const handleRemoveMapping = (mappingId: string) => {
    Alert.alert(
      'Remover Mapeamento',
      'Tem certeza que deseja remover este mapeamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteMapping(mappingId),
        },
      ]
    );
  };

  const getChildMapping = (childId: string) => {
    return mappings.find((m) => m.child_id === childId);
  };

  if (!connection?.is_connected) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Microsoft Family Safety</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>Conecte sua conta</Text>
          <Text style={styles.emptyDescription}>
            Conecte sua conta Microsoft para controlar o tempo de tela dos
            dispositivos Windows e Android dos seus filhos.
          </Text>
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectButtonText}>Conectar Conta Microsoft</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showCallbackModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cole a URL de Retorno</Text>
              <Text style={styles.modalDescription}>
                Apos fazer login na Microsoft, copie a URL completa da pagina em branco e cole aqui:
              </Text>
              <TextInput
                style={styles.callbackInput}
                value={callbackUrl}
                onChangeText={setCallbackUrl}
                placeholder="https://..."
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowCallbackModal(false);
                    setCallbackUrl('');
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleCallbackSubmit}
                >
                  <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Microsoft Family Safety</Text>
      </View>
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>✅</Text>
            <Text style={styles.statusTitle}>Conectado</Text>
          </View>
          <TouchableOpacity onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>Desconectar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Mapeamento de Filhos</Text>
        <Text style={styles.sectionDescription}>
          Vincule cada filho do XPCombinado a sua conta no Microsoft Family Safety
        </Text>

        {children.map((child) => {
          const mapping = getChildMapping(child.id);

          return (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.childInfo}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>
                    {child.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.childName}>{child.name}</Text>
                  {mapping ? (
                    <Text style={styles.mappingText}>
                      → {mapping.ms_account_name}
                    </Text>
                  ) : (
                    <Text style={styles.notMappedText}>Nao mapeado</Text>
                  )}
                </View>
              </View>

              {mapping ? (
                <TouchableOpacity onPress={() => handleRemoveMapping(mapping.id)}>
                  <Text style={styles.removeText}>Remover</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => handleMapChild(child.id)}
                >
                  <Text style={styles.mapButtonText}>Mapear</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {children.length === 0 && (
          <View style={styles.noChildrenCard}>
            <Text style={styles.noChildrenText}>
              Adicione filhos na tela inicial para poder mapeá-los.
            </Text>
          </View>
        )}

        <Modal visible={showMappingModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione a Conta MS Family</Text>

              {isLoading ? (
                <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
              ) : msAccounts.length > 0 ? (
                msAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={styles.accountOption}
                    onPress={() => handleSelectMsAccount(account)}
                  >
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountUsage}>
                      Uso hoje: {account.today_usage} min
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noAccountsText}>
                  Nenhuma conta encontrada. Verifique se ha membros da familia configurados no Microsoft Family Safety.
                </Text>
              )}

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowMappingModal(false);
                  setSelectedChildId(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  connectButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  disconnectText: {
    color: '#ef4444',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  mappingText: {
    fontSize: 14,
    color: '#22c55e',
    marginTop: 2,
  },
  notMappedText: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  mapButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeText: {
    color: '#ef4444',
    fontSize: 14,
  },
  noChildrenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noChildrenText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  callbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  accountOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  accountUsage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noAccountsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  loader: {
    marginVertical: 24,
  },
});
