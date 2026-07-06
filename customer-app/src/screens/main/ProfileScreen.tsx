import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { User, MapPin, Globe, Bell, LogOut, Shield, HelpCircle, Share2, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const { user, logout, language, setLanguage } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to logout from Vidhi Vidhan?');
      if (confirm) {
        logout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout from Vidhi Vidhan?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Logout', 
            style: 'destructive',
            onPress: async () => {
              await logout();
            }
          }
        ]
      );
    }
  };

  const toggleLanguage = async () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    await setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Download Vidhi Vidhan - Book Verified Pandits for Every Puja, on-demand! Join us now.',
      });
    } catch (error) {
      // Ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Devotee'}</Text>
            <Text style={styles.userPhone}>{user?.phone || ''}</Text>
            <View style={styles.cityBadge}>
              <MapPin size={10} color="#FF9933" style={{ marginRight: 2 }} />
              <Text style={styles.cityBadgeText}>{user?.city || 'Not Selected'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Groups */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Preferences</Text>

          {/* Language Row */}
          <TouchableOpacity style={styles.row} onPress={toggleLanguage} activeOpacity={0.8}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF8F0' }]}>
              <Globe size={20} color="#FF9933" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>App Language / भाषा</Text>
              <Text style={styles.rowSub}>{language === 'en' ? 'English' : 'हिंदी'}</Text>
            </View>
            <Text style={styles.langSwitchAction}>Change</Text>
          </TouchableOpacity>

          {/* Notifications Row */}
          <View style={styles.row}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF8F0' }]}>
              <Bell size={20} color="#FF9933" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSub}>Receive updates about your bookings</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#EFEBE4', true: '#FFEADB' }}
              thumbColor={notificationsEnabled ? '#FF9933' : '#F4F3F0'}
            />
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Account & Services</Text>

          {/* Saved Addresses */}
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('SavedAddresses')} 
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF8F0' }]}>
              <MapPin size={20} color="#FF9933" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Saved Addresses</Text>
              <Text style={styles.rowSub}>Manage puja delivery locations</Text>
            </View>
            <ChevronRight size={18} color="#C8C2B7" />
          </TouchableOpacity>

          {/* Share App */}
          <TouchableOpacity style={styles.row} onPress={handleShare} activeOpacity={0.8}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF8F0' }]}>
              <Share2 size={20} color="#FF9933" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Share App</Text>
              <Text style={styles.rowSub}>Invite friends and family</Text>
            </View>
            <ChevronRight size={18} color="#C8C2B7" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Support & Legal</Text>

          {/* Help & Support */}
          <TouchableOpacity style={styles.row} activeOpacity={0.8}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF8F0' }]}>
              <HelpCircle size={20} color="#FF9933" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Help & Support</Text>
              <Text style={styles.rowSub}>24/7 client care desk</Text>
            </View>
            <ChevronRight size={18} color="#C8C2B7" />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity style={styles.row} activeOpacity={0.8}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF8F0' }]}>
              <Shield size={20} color="#FF9933" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Privacy Policy</Text>
              <Text style={styles.rowSub}>Data security & terms of service</Text>
            </View>
            <ChevronRight size={18} color="#C8C2B7" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Vidhi Vidhan Customer App · v1.0.0 (Beta)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 28,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F5ECE0',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userPhone: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: '#FCAE68',
  },
  cityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9933',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A0988E',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5ECE0',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  rowSub: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  langSwitchAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF9933',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    height: 50,
    marginHorizontal: 24,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#A0988E',
    marginTop: 28,
  },
});
