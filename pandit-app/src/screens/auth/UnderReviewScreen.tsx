import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, ShieldCheck, PhoneCall, RefreshCw, ShieldAlert } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

export default function UnderReviewScreen() {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = React.useState(false);

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

  const handleCheckStatus = async () => {
    setRefreshing(true);
    try {
      const res = await api.getProfile();
      if (res.data) {
        await setUser(res.data);
        const newStatus = res.data.pandit_profile?.status;
        if (newStatus === 'ACTIVE') {
          alert('Congratulations! Your application has been approved.');
        } else if (newStatus === 'REJECTED') {
          alert('Your application was rejected. Check details below or contact support.');
        } else {
          alert('Your application is still under review.');
        }
      }
    } catch (err) {
      console.warn("Failed to check status:", err);
      alert('Connection error. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const profileStatus = user?.pandit_profile?.status;
  const rejectionReason = user?.pandit_profile?.rejection_reason;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          {profileStatus === 'REJECTED' ? (
            <ShieldAlert size={48} color="#EF4444" />
          ) : (
            <Clock size={48} color="#FF9933" />
          )}
        </View>

        <Text style={styles.title}>
          {profileStatus === 'REJECTED' ? 'Application Rejected' : t('underReview')}
        </Text>
        <Text style={styles.subtitle}>
          {profileStatus === 'REJECTED'
            ? 'Your registration request has been reviewed and could not be approved by the admin team at this time.'
            : t('underReviewSub')}
        </Text>

        {profileStatus === 'REJECTED' ? (
          <View style={[styles.infoCard, { borderColor: '#EF4444', backgroundColor: '#FFF5F5' }]}>
            <ShieldAlert size={20} color="#EF4444" style={{ marginRight: 12 }} />
            <Text style={[styles.infoText, { color: '#EF4444' }]}>
              Rejection Reason: {rejectionReason || 'Please contact admin support to resolve this.'}
            </Text>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <ShieldCheck size={20} color="#8B0000" style={{ marginRight: 12 }} />
            <Text style={styles.infoText}>Documents are being cross-verified with official government registries.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport} activeOpacity={0.8}>
          <PhoneCall size={18} color="#FF9933" style={{ marginRight: 8 }} />
          <Text style={styles.supportButtonText}>Contact Admin Support</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleCheckStatus} 
          disabled={refreshing} 
          activeOpacity={0.8}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.refreshButtonText}>Check Approval Status</Text>
            </>
          )}
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B0000',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
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
