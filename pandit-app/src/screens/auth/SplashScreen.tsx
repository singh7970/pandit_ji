import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.85)).current;
  const { initialize, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const checkAuth = async () => {
      const timer = new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.all([initialize(), timer]);
      
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.user) {
        const status = state.user.pandit_profile?.status;
        if (!status) {
          navigation.replace('Onboarding');
        } else if (status === 'PENDING') {
          navigation.replace('UnderReview');
        } else {
          // ACTIVE -> Switch automatically via store/navigator toggle
        }
      } else {
        navigation.replace('LanguageSelect');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.symbolCircle}>
          <Text style={styles.symbolText}>🕉️</Text>
        </View>
        <Text style={styles.logoTitle}>पंडितजी</Text>
        <Text style={styles.logoSub}>PANDIT PARTNER</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Perform Sacred Pujas & Support Devotees</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000', // Deep Maroon background for Partner App (distinguishes it from customer app!)
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  symbolCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFDF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  symbolText: {
    fontSize: 50,
  },
  logoTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 44,
    color: '#FFFDF7',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 16,
    color: '#FF9933', // Saffron accent
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: -5,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#FF9933',
    marginVertical: 15,
    borderRadius: 1.5,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFDF7',
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
});
