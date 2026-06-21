import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, Platform } from 'react-native';
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
        <View style={styles.symbolCircle}>
          <View style={styles.symbolInner}>
            <Text style={styles.symbolText}>ॐ</Text>
          </View>
        </View>
        <Text style={styles.logoTitle}>विधि विधान</Text>
        <Text style={styles.logoSub}>Vidhi Vidhan</Text>
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
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#E07B39',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  symbolInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: '#C9933A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FDF8F3',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
    textAlign: 'center',
    marginTop: Platform.OS === 'web' ? 0 : -6,
  },
  logoTitle: {
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
