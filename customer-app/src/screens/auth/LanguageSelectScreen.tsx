import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function LanguageSelectScreen({ navigation }: any) {
  const { setLanguage, language } = useAuthStore();
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState<'en' | 'hi'>(language);

  const handleSelect = (lang: 'en' | 'hi') => {
    setSelected(lang);
  };

  const handleContinue = async () => {
    await setLanguage(selected);
    i18n.changeLanguage(selected);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>चुनें भाषा / Select Language</Text>
        <Text style={styles.subtitle}>Choose your preferred language for using Vidhi Vidhan</Text>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.card, selected === 'en' && styles.cardSelected]}
            onPress={() => handleSelect('en')}
            activeOpacity={0.8}
          >
            <View style={[styles.circle, selected === 'en' && styles.circleSelected]}>
              {selected === 'en' && <View style={styles.dot} />}
            </View>
            <Text style={[styles.cardText, selected === 'en' && styles.cardTextSelected]}>English</Text>
            <Text style={styles.cardSubText}>Read & Write in English</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, selected === 'hi' && styles.cardSelected]}
            onPress={() => handleSelect('hi')}
            activeOpacity={0.8}
          >
            <View style={[styles.circle, selected === 'hi' && styles.circleSelected]}>
              {selected === 'hi' && <View style={styles.dot} />}
            </View>
            <Text style={[styles.cardText, selected === 'hi' && styles.cardTextSelected]}>हिंदी</Text>
            <Text style={styles.cardSubText}>हिंदी में पढ़ें और लिखें</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.buttonText}>Continue / आगे बढ़ें</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7', // Off-white
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EFEBE4',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#FF9933', // Saffron
    backgroundColor: '#FFF8F0',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C8C2B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  circleSelected: {
    borderColor: '#FF9933',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9933',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardTextSelected: {
    color: '#FF9933',
  },
  cardSubText: {
    fontSize: 12,
    color: '#888888',
    position: 'absolute',
    right: 20,
  },
  button: {
    width: width - 48,
    backgroundColor: '#FF9933',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
