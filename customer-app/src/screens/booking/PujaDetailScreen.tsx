import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, IndianRupee, ShieldAlert, Award, Star, ArrowLeft } from 'lucide-react-native';
import { api, Puja } from '../../services/api';
import { useBookingStore } from '../../store/bookingStore';

const { width } = Dimensions.get('window');

const MOCK_SAMAGRI = [
  'Kumkum & Haldi (Turmeric)',
  'Incense Sticks (Agarbatti)',
  'Coconuts & Betel leaves',
  'Gangajal (Holy Water)',
  'Cotton Wicks & Ghee',
  'Rice (Akshata)',
  'Sandalwood Paste',
];

export default function PujaDetailScreen({ route, navigation }: any) {
  const { pujaId } = route.params;
  const { t } = useTranslation();
  const { setSelectedPuja, resetBooking } = useBookingStore();
  const [puja, setPuja] = useState<Puja | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPujaDetail(pujaId)
      .then((res) => {
        setPuja(res.data);
      })
      .catch(() => {
        // Fallback for development/testing
        setPuja({
          id: pujaId,
          name_en: 'Satyanarayan Puja',
          name_hi: 'सत्यनारायण पूजा',
          description: 'The Satyanarayan Puja is a ritual performed to offer gratitude to Lord Vishnu. It brings peace, prosperity, and happiness to the household and is usually performed on auspicious occasions, housewarmings, or full moon days.',
          duration_hrs: 2.5,
          base_price: 2100,
          tier_required: 'GOLD',
          samagri_list: MOCK_SAMAGRI,
          deity: 'Lord Vishnu',
        });
      })
      .finally(() => setLoading(false));
  }, [pujaId]);

  const handleBookNow = () => {
    if (puja) {
      setSelectedPuja(puja);
      navigation.navigate('BookingFlow');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  if (!puja) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Puja details not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Puja Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Visual Hero Card */}
        <View style={styles.heroContainer}>
          <View style={styles.heroOverlay}>
            <Text style={styles.deityTag}>🕉️ {puja.deity || 'Deity'}</Text>
            <Text style={styles.heroTitle}>{puja.name_en}</Text>
            {puja.name_hi && <Text style={styles.heroTitleHi}>{puja.name_hi}</Text>}
          </View>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Clock size={20} color="#FF9933" style={{ marginBottom: 6 }} />
            <Text style={styles.specVal}>{puja.duration_hrs} Hrs</Text>
            <Text style={styles.specLbl}>{t('duration')}</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specItem}>
            <IndianRupee size={20} color="#FF9933" style={{ marginBottom: 6 }} />
            <Text style={styles.specVal}>₹{puja.base_price}</Text>
            <Text style={styles.specLbl}>{t('basePrice')}</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specItem}>
            <Award size={20} color="#FF9933" style={{ marginBottom: 6 }} />
            <Text style={styles.specVal}>{puja.tier_required || 'Verified'}</Text>
            <Text style={styles.specLbl}>Pandit Tier</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>{puja.description}</Text>
        </View>

        {/* Samagri Section */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.samagriHeader}>
            <Text style={styles.sectionTitle}>Required Samagri (Ingredients)</Text>
            <View style={styles.kitBadge}>
              <Text style={styles.kitBadgeText}>Kit Available</Text>
            </View>
          </View>
          <Text style={styles.samagriSub}>These are the key items needed. You can choose to have us deliver a complete kit during checkout.</Text>
          
          <View style={styles.samagriGrid}>
            {(puja.samagri_list || MOCK_SAMAGRI).map((item, index) => (
              <View key={index} style={styles.samagriItem}>
                <View style={styles.bullet} />
                <Text style={styles.samagriText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Booking CTA Bar */}
      <View style={styles.ctaBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.ctaPriceLabel}>{t('basePrice')}</Text>
          <Text style={styles.ctaPriceText}>₹{puja.base_price}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow} activeOpacity={0.9}>
          <Text style={styles.bookButtonText}>{t('bookNow')}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE0',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF9933',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroContainer: {
    height: 220,
    backgroundColor: '#8B0000', // Deep Maroon fallback
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroOverlay: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    height: '100%',
    justifyContent: 'flex-end',
  },
  deityTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9933',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroTitleHi: {
    fontSize: 16,
    color: '#FFF8F0',
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.9,
  },
  specsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: -28,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  specLbl: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
    marginTop: 2,
  },
  specDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F0E6D8',
    alignSelf: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '500',
  },
  samagriHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kitBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  kitBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  samagriSub: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 16,
    marginBottom: 16,
    fontWeight: '500',
  },
  samagriGrid: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 16,
  },
  samagriItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9933',
    marginRight: 12,
  },
  samagriText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#F5ECE0',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  ctaPriceLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
  },
  ctaPriceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  bookButton: {
    backgroundColor: '#FF9933',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
