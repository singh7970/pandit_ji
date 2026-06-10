import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Run both initialization and animations in parallel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const checkAuth = async () => {
      // Wait for at least 2 seconds (animation + branding display)
      const timer = new Promise((resolve) => setTimeout(resolve, 2200));
      await Promise.all([initialize(), timer]);
      
      if (useAuthStore.getState().isAuthenticated) {
        // Logged in, directly go to Main
        // Managed automatically by navigator, but if manual:
      } else {
        navigation.replace('LanguageSelect');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Decorative spiritual symbol or circle */}
        <View style={styles.symbolCircle}>
          <Text style={styles.symbolText}>🕉️</Text>
        </View>
        <Text style={styles.logoTitle}>पंडितजी</Text>
        <Text style={styles.logoSub}>PanditJi</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Book Verified Pandits for Every Puja</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF9933', // Brand Saffron
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
    shadowColor: '#8B0000',
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
    fontSize: 48,
    color: '#FFFDF7',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 22,
    color: '#8B0000', // Deep Maroon
    fontWeight: '600',
    letterSpacing: 4,
    marginTop: -5,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#8B0000',
    marginVertical: 15,
    borderRadius: 1.5,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFDF7',
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
});
