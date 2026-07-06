import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { LogOut, Globe, Phone, MapPin, Award, BookOpen, Share2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Perform sacred pujas and connect with devotees on Panditji App! Download now.',
      });
    } catch (error) {}
  };

  const p = user?.pandit_profile;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Pandit Shastri'}</Text>
          <Text style={styles.userRole}>Vedic Priest & Ritual Specialist</Text>
        </View>

        {/* Professional Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Credentials</Text>
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <Award size={18} color="#8B0000" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.itemLabel}>Sampraday (Lineage)</Text>
                <Text style={styles.itemValue}>{p?.sampraday || 'Vedic'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemRow}>
              <BookOpen size={18} color="#8B0000" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.itemLabel}>{t('experience')}</Text>
                <Text style={styles.itemValue}>{p?.experience_years || 5} Years</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={[styles.itemRow, { alignItems: 'flex-start' }]}>
              <Globe size={18} color="#8B0000" style={{ marginRight: 12, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{t('languages')}</Text>
                <View style={styles.tagGrid}>
                  {(p?.languages || ['Hindi', 'Sanskrit']).map((lang, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Location</Text>
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <Phone size={18} color="#8B0000" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.itemLabel}>Registered Mobile</Text>
                <Text style={styles.itemValue}>{user?.phone || '+91 9876543210'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemRow}>
              <MapPin size={18} color="#8B0000" style={{ marginRight: 12 }} />
              <View>
                <Text style={styles.itemLabel}>Service City</Text>
                <Text style={styles.itemValue}>{user?.city || 'Delhi NCR'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* General Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={handleShare} activeOpacity={0.8}>
            <Share2 size={18} color="#FF9933" style={{ marginRight: 12 }} />
            <Text style={styles.actionText}>Invite Other Priests</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRow, { marginTop: 12 }]} onPress={logout} activeOpacity={0.8}>
            <LogOut size={18} color="#EF4444" style={{ marginRight: 12 }} />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F5ECE0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE0',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FFE8D0',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  userRole: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 10,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#FFF8F0',
    borderWidth: 0.5,
    borderColor: '#FFE8D0',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 11,
    color: '#FF9933',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 16,
    padding: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
