import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function OtpScreen({ route, navigation }: any) {
  const { phone, mode, name } = route.params || {};
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    setError('');

    // Testing bypass for "123456"
    if (otp === '123456') {
      try {
        const response = await api.verifyOtp(phone, otp, name, 'PANDIT');
        const { access_token, user } = response.data;
        await login(access_token, user);
        
        const profileStatus = user.pandit_profile?.status;
        if (!profileStatus) {
          navigation.replace('Onboarding');
        } else if (profileStatus === 'PENDING') {
          navigation.replace('UnderReview');
        }
        setLoading(false);
        return;
      } catch (e: any) {
        console.warn("Backend unavailable, using mock login:", e);
        const mockUser = {
          id: "00000000-0000-0000-0000-000000000000",
          phone: phone,
          name: name || "Test Pandit",
          city: "",
          role: "PANDIT" as const,
          is_active: true,
          created_at: new Date().toISOString(),
          pandit_profile: null
        };
        await login("mock_access_token", mockUser);
        navigation.replace('Onboarding');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await api.verifyOtp(phone, otp, name, 'PANDIT');
      const { access_token, user } = response.data;
      
      await login(access_token, user);

      const profileStatus = user.pandit_profile?.status;
      if (!profileStatus) {
        navigation.replace('Onboarding');
      } else if (profileStatus === 'PENDING') {
        navigation.replace('UnderReview');
      } else {
        // ACTIVE status will toggle Navigator stack automatically
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await api.sendOtp(phone);
      setTimer(60);
      setError('');
    } catch (e: any) {
      setError('Failed to resend OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.logoMark}>🔒</Text>
          <Text style={styles.title}>{t('verifyOtp')}</Text>
          <Text style={styles.subtitle}>{t('enterOtp', { phone })}</Text>

          <View style={styles.otpContainer}>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (text.length === 6) {
                  setError('');
                }
              }}
              autoFocus
            />
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => inputRef.current?.focus()} 
              style={styles.boxWrapper}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = otp[index] || '';
                const isFocused = otp.length === index;
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.otpBox, 
                      isFocused && styles.otpBoxFocused,
                      char.length > 0 && styles.otpBoxFilled
                    ]}
                  >
                    <Text style={styles.otpText}>{char}</Text>
                  </View>
                );
              })}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (otp.length < 6 || loading) && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={otp.length < 6 || loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('verifyOtp')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                {t('resendOtp')} in {timer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={loading}>
                <Text style={styles.resendText}>{t('resendOtp')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoMark: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 36,
  },
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  boxWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFocused: {
    borderColor: '#8B0000',
    backgroundColor: '#FFF5F5',
  },
  otpBoxFilled: {
    borderColor: '#8B0000',
  },
  otpText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#8B0000',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#C87F7F',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  resendText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
