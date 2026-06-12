import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight, Award, User, BookOpen, ShieldAlert } from 'lucide-react-native';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const CITIES = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune'];
const SAMPRADAYAS = ['Vedic', 'Vaishnav', 'Shaiva', 'Smartism'];
const LANGUAGES = ['Hindi', 'Sanskrit', 'English', 'Bhojpuri', 'Marathi', 'Kannada', 'Telugu'];
const PUJAS = [
  { id: '1', name: 'Satyanarayan Puja' },
  { id: '2', name: 'Griha Pravesh Puja' },
  { id: '3', name: 'Ganesh Puja' },
  { id: '4', name: 'Maha Mrityunjaya Jaap' },
  { id: '5', name: 'Rudrabhishek Puja' },
];

export default function OnboardingScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, setUser, token, login } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [bio, setBio] = useState('');
  const [sampraday, setSampraday] = useState(SAMPRADAYAS[0]);
  const [experience, setExperience] = useState('5');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPujas, setSelectedPujas] = useState<string[]>([]);
  const [pujas, setPujas] = useState<{ id: string; name: string }[]>(PUJAS);

  useEffect(() => {
    api.getPujas()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setPujas(res.data.map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch pujas from DB:", err);
      });
  }, []);

  const handleToggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => 
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleTogglePuja = (pujaName: string) => {
    setSelectedPujas((prev) => 
      prev.includes(pujaName) ? prev.filter((p) => p !== pujaName) : [...prev, pujaName]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedLanguages.length === 0 || selectedPujas.length === 0) {
      alert('Please select at least one language and one puja.');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Update general user profile name/city
      await api.updateProfile({
        name,
        city,
      });

      // 2. Submit application details
      await api.applyPandit({
        sampraday,
        specialisations: selectedPujas,
        languages: selectedLanguages,
        experience_years: parseInt(experience, 10),
        bio,
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        document_urls: ['aadhar_mock_url.png', 'pan_mock_url.png'],
      });

      // 3. Update global store
      const updatedUser = {
        ...user!,
        name,
        city,
        pandit_profile: {
          status: 'PENDING' as const,
          sampraday,
          specialisations: selectedPujas,
          languages: selectedLanguages,
          experience_years: parseInt(experience, 10),
          tier: 'VERIFIED' as const,
          rating_avg: 5.0,
        }
      };

      await login(token!, updatedUser);
      setSubmitting(false);
      navigation.replace('UnderReview');
    } catch (e) {
      // fallback simulation for demo/dev
      const updatedUser = {
        ...user!,
        name: name || 'Pandit Dev Shastri',
        city,
        pandit_profile: {
          status: 'PENDING' as const,
          sampraday,
          specialisations: selectedPujas,
          languages: selectedLanguages,
          experience_years: parseInt(experience, 10),
          tier: 'VERIFIED' as const,
          rating_avg: 5.0,
        }
      };
      await login(token!, updatedUser);
      setSubmitting(false);
      navigation.replace('UnderReview');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {step > 1 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{t('register')}</Text>
        <Text style={styles.stepIndicator}>Step {step} of 4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <Text style={styles.sectionSub}>Please tell us your basic contact profile details:</Text>
            
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Pandit Ramesh Shastri"
              placeholderTextColor="#A0988E"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Service City</Text>
            <View style={styles.cityChips}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cityChip, city === c && styles.cityChipActive]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.cityChipText, city === c && styles.cityChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Short Bio / Biography</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Write a brief profile description for devotees"
              placeholderTextColor="#A0988E"
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
            />
          </View>
        )}

        {/* Step 2: Professional Details */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Lineage & Experience</Text>
            <Text style={styles.sectionSub}>Provide details about your sampraday and service years:</Text>

            <Text style={styles.label}>Lineage / Sampraday</Text>
            <View style={styles.cityChips}>
              {SAMPRADAYAS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.cityChip, sampraday === s && styles.cityChipActive]}
                  onPress={() => setSampraday(s)}
                >
                  <Text style={[styles.cityChipText, sampraday === s && styles.cityChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10"
              placeholderTextColor="#A0988E"
              keyboardType="number-pad"
              value={experience}
              onChangeText={setExperience}
            />
          </View>
        )}

        {/* Step 3: Specialisations & Languages */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Languages & Pujas</Text>
            <Text style={styles.sectionSub}>Select the languages you speak and the pujas you perform:</Text>

            <Text style={styles.label}>Languages Spoken</Text>
            <View style={styles.gridContainer}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.checkboxChip, isSelected && styles.checkboxChipActive]}
                    onPress={() => handleToggleLanguage(lang)}
                  >
                    <Text style={[styles.checkboxChipText, isSelected && styles.checkboxChipTextActive]}>
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>Pujas Specialisation</Text>
            <View style={styles.listContainer}>
              {pujas.map((puja) => {
                const isSelected = selectedPujas.includes(puja.name);
                return (
                  <TouchableOpacity
                    key={puja.id}
                    style={[styles.rowSelector, isSelected && styles.rowSelectorActive]}
                    onPress={() => handleTogglePuja(puja.name)}
                  >
                    <Text style={[styles.rowSelectorText, isSelected && styles.rowSelectorTextActive]}>
                      {puja.name}
                    </Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Text style={{ color: '#FFFFFF', fontSize: 10 }}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 4: Documents Upload & Verification */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Credentials Upload</Text>
            <Text style={styles.sectionSub}>Upload copy of identity documents for security review:</Text>

            <View style={styles.uploadCard}>
              <Text style={styles.uploadTitle}>Aadhaar Card Front / Back</Text>
              <Text style={styles.uploadSub}>PDF or Image up to 5MB</Text>
              <View style={styles.uploadStatus}>
                <CheckCircle2 size={16} color="#22C55E" style={{ marginRight: 6 }} />
                <Text style={styles.uploadStatusText}>Document Attached</Text>
              </View>
            </View>

            <View style={styles.uploadCard}>
              <Text style={styles.uploadTitle}>Vedic Certification / Reference</Text>
              <Text style={styles.uploadSub}>Optional temple reference letters</Text>
              <View style={styles.uploadStatus}>
                <CheckCircle2 size={16} color="#22C55E" style={{ marginRight: 6 }} />
                <Text style={styles.uploadStatusText}>Document Attached</Text>
              </View>
            </View>
          </View>
        )}

        {/* Navigation Actions */}
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={submitting}
          activeOpacity={0.9}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {step === 4 ? t('submitApplication') : t('continue')}
              </Text>
              {step < 4 && <ChevronRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />}
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE0',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFEBE4',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  stepIndicator: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sectionSub: {
    fontSize: 13,
    color: '#666666',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    marginBottom: 20,
  },
  cityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  cityChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cityChipActive: {
    borderColor: '#8B0000',
    backgroundColor: '#FFF5F5',
  },
  cityChipText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: '#8B0000',
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkboxChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  checkboxChipActive: {
    borderColor: '#8B0000',
    backgroundColor: '#FFF5F5',
  },
  checkboxChipText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  checkboxChipTextActive: {
    color: '#8B0000',
    fontWeight: '800',
  },
  listContainer: {
    gap: 10,
  },
  rowSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 14,
    padding: 16,
  },
  rowSelectorActive: {
    borderColor: '#8B0000',
    backgroundColor: '#FFF5F5',
  },
  rowSelectorText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  rowSelectorTextActive: {
    color: '#8B0000',
    fontWeight: '800',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C8C2B7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: '#8B0000',
    backgroundColor: '#8B0000',
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  uploadSub: {
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  uploadStatusText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#8B0000',
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
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
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
