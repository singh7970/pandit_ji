import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

const LoginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Phone number is required'),
});

const SignupSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .required('Phone number is required'),
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
});

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.logoMark}>🔱</Text>
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' 
              ? 'Sign in to access your partner dashboard' 
              : 'Register as a new partner to start earning'}
          </Text>

          {/* Segmented Toggle Control */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, mode === 'login' && styles.toggleActive]}
              onPress={() => setMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, mode === 'signup' && styles.toggleActive]}
              onPress={() => setMode('signup')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          <Formik
            initialValues={{ phone: '', name: '' }}
            validationSchema={mode === 'signup' ? SignupSchema : LoginSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              const fullPhone = `+91${values.phone}`;
              try {
                // Call backend to send OTP with selected mode
                await api.sendOtp(fullPhone, mode);
                navigation.navigate('Otp', { 
                  phone: fullPhone, 
                  mode, 
                  name: mode === 'signup' ? values.name : undefined 
                });
              } catch (err: any) {
                const errMsg = err.response?.data?.detail || 'Failed to send OTP. Please try again.';
                setFieldError('phone', errMsg);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                {mode === 'signup' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputContainerName}>
                      <TextInput
                        style={styles.inputName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#A0988E"
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        value={values.name}
                        editable={!isSubmitting}
                      />
                    </View>
                    {errors.name && touched.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                  </View>
                )}

                <Text style={styles.inputLabel}>{t('phonePrompt')}</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.prefix}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your number"
                    placeholderTextColor="#A0988E"
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    value={values.phone}
                    editable={!isSubmitting}
                  />
                </View>

                {errors.phone && touched.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                <TouchableOpacity
                  style={[styles.button, isSubmitting && styles.buttonDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.9}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>{t('sendOtp')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
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
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
    borderRightWidth: 1.5,
    borderRightColor: '#EFEBE4',
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  } as any,
  inputContainerName: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputName: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  } as any,
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#8B0000',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C7267',
  },
  toggleTextActive: {
    color: '#8B0000',
    fontWeight: '700',
  },
});
