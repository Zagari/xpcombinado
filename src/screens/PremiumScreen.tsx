import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { PremiumScreenProps } from '../navigation/types';
import { useAuthStore, useSubscriptionStore } from '../stores';

export default function PremiumScreen({ navigation }: PremiumScreenProps) {
  const { user } = useAuthStore();
  const { isPremium, mockPurchase } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user?.id) return;

    Alert.alert(
      'Modo de Teste',
      'Esta é uma compra simulada para testes. Em produção, você será redirecionado para a loja de aplicativos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular Compra',
          onPress: async () => {
            setIsLoading(true);
            const { error } = await mockPurchase(user.id);
            setIsLoading(false);

            if (error) {
              Alert.alert('Erro', error);
            } else {
              Alert.alert(
                'Sucesso!',
                'Você agora é um usuário Premium! Aproveite todos os recursos.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          },
        },
      ]
    );
  };

  if (isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Premium</Text>
        </View>
        <View style={styles.premiumActiveContainer}>
          <Text style={styles.premiumBadge}>Premium Ativo</Text>
          <Text style={styles.premiumMessage}>
            Você já tem acesso a todos os recursos premium!
          </Text>
          <View style={styles.featuresList}>
            <FeatureItem icon="🔗" text="Integração Microsoft Family Safety" />
            <FeatureItem icon="📊" text="Relatórios detalhados" soon />
            <FeatureItem icon="👨‍👩‍👧‍👦" text="Filhos ilimitados" soon />
            <FeatureItem icon="🎨" text="Temas personalizados" soon />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seja Premium</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>⭐</Text>
          <Text style={styles.heroTitle}>Desbloqueie Todo o Potencial</Text>
          <Text style={styles.heroSubtitle}>
            Tenha acesso a recursos exclusivos para gerenciar melhor o tempo de
            tela dos seus filhos
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Recursos Premium</Text>
          <FeatureItem
            icon="🔗"
            text="Integração Microsoft Family Safety"
            description="Controle dispositivos Windows e Android diretamente pelo app"
          />
          <FeatureItem
            icon="📊"
            text="Relatórios detalhados"
            description="Acompanhe o progresso ao longo do tempo"
            soon
          />
          <FeatureItem
            icon="👨‍👩‍👧‍👦"
            text="Filhos ilimitados"
            description="Adicione quantos filhos precisar"
            soon
          />
          <FeatureItem
            icon="🎨"
            text="Temas personalizados"
            description="Personalize as cores do aplicativo"
            soon
          />
        </View>

        <View style={styles.pricingSection}>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Assinatura Mensal</Text>
            <Text style={styles.priceValue}>R$ 9,90/mês</Text>
            <Text style={styles.priceNote}>Cancele quando quiser</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, isLoading && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.purchaseButtonText}>Assinar Premium</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          * Compra simulada para testes. A integração com Google Play e App
          Store será implementada em breve.
        </Text>
      </ScrollView>
    </View>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
  description?: string;
  soon?: boolean;
}

function FeatureItem({ icon, text, description, soon }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureText}>{text}</Text>
          {soon && <Text style={styles.soonBadge}>Em breve</Text>}
        </View>
        {description && (
          <Text style={styles.featureDescription}>{description}</Text>
        )}
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
    flex: 1,
    padding: 16,
  },
  premiumActiveContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: '#10b981',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginBottom: 16,
  },
  premiumMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresList: {
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  soonBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  pricingSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  priceCard: {
    backgroundColor: '#6366f1',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  purchaseButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
});
