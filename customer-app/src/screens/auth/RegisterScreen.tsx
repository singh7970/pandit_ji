import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const CITIES = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune'];

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Full name is required'),
});

export default function RegisterScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, setUser, login, token } = useAuthStore();
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.logoMark}>🌸</Text>
          <Text style={styles.title}>{t('register')}</Text>
          <Text style={styles.subtitle}>Tell us a bit more about you to get started</Text>

          <Formik
            initialValues={{ name: '' }}
            validationSchema={RegisterSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const response = await api.updateProfile({
                  name: values.name,
                  city: selectedCity,
                });
                
                // Update profile in store
                const updatedUser = {
                  ...user!,
                  name: values.name,
                  city: selectedCity,
                };
                
                // Re-login to update state completely
                await login(token!, updatedUser);
              } catch (e: any) {
                setSubmitting(false);
                setFieldError('name', e.response?.data?.detail || 'Failed to update profile. Try again.');
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                {/* Name Input */}
                <Text style={styles.inputLabel}>{t('fullName')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
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

                {/* City Select */}
                <Text style={[styles.inputLabel, { marginTop: 20 }]}>{t('selectCity')}</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowDropdown(!showDropdown)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownButtonText}>{selectedCity}</Text>
                    <Text style={styles.arrowIcon}>{showDropdown ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {showDropdown && (
                    <View style={styles.dropdownList}>
                      {CITIES.map((city) => (
                        <TouchableOpacity
                          key={city}
                          style={[styles.dropdownItem, selectedCity === city && styles.dropdownItemActive]}
                          onPress={() => {
                            setSelectedCity(city);
                            setShowDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, selectedCity === city && styles.dropdownItemTextActive]}>
                            {city}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.button, isSubmitting && styles.buttonDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.9}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>{t('continue')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  logoMark: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
  dropdownContainer: {
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#888888',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F2EB',
  },
  dropdownItemActive: {
    backgroundColor: '#FFF8F0',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#FF9933',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#FF9933',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#FCAE68',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
