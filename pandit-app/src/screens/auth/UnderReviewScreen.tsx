import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, ShieldCheck, PhoneCall } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

export default function UnderReviewScreen() {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  const handleContactSupport = () => {
    Linking.openURL('tel:+919876543210').catch(() => {
      alert('Please call +919876543210');
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout failed:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Clock size={48} color="#FF9933" />
        </View>

        <Text style={styles.title}>{t('underReview')}</Text>
        <Text style={styles.subtitle}>{t('underReviewSub')}</Text>

        <View style={styles.infoCard}>
          <ShieldCheck size={20} color="#8B0000" style={{ marginRight: 12 }} />
          <Text style={styles.infoText}>Documents are being cross-verified with official government registries.</Text>
        </View>

        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport} activeOpacity={0.8}>
          <PhoneCall size={18} color="#FF9933" style={{ marginRight: 8 }} />
          <Text style={styles.supportButtonText}>Contact Admin Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE8D0',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FCAE68',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#8B0000',
    fontWeight: '600',
    lineHeight: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF9933',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  supportButtonText: {
    fontSize: 14,
    color: '#FF9933',
    fontWeight: '700',
  },
  logoutButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
