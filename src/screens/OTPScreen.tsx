import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { OTPScreenProps } from '../navigation/types';
import { useAuthStore } from '../stores';

export default function OTPScreen({ route, navigation }: OTPScreenProps) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const sendOtp = useAuthStore((state) => state.sendOtp);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code || otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Erro', 'Digite o codigo completo de 6 digitos');
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOtp(email, otpCode);
    setIsLoading(false);

    if (error) {
      Alert.alert('Erro', 'Codigo invalido ou expirado');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    const { error } = await sendOtp(email);
    setIsLoading(false);

    if (error) {
      Alert.alert('Erro', error);
    } else {
      Alert.alert('Sucesso', 'Novo codigo enviado para seu email');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verificar Email</Text>
        <Text style={styles.subtitle}>
          Digite o codigo de 6 digitos enviado para{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, (isLoading || otp.join('').length !== 6) && styles.buttonDisabled]}
          onPress={() => handleVerifyOtp()}
          disabled={isLoading || otp.join('').length !== 6}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Verificando...' : 'Verificar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOtp}
          disabled={resendTimer > 0 || isLoading}
        >
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendTextDisabled]}>
            {resendTimer > 0
              ? `Reenviar codigo em ${resendTimer}s`
              : 'Reenviar codigo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Alterar email</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: '#fff',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  otpInputFilled: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});
