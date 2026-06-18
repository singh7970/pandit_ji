import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, FlatList, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, ChevronRight, Bell, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { api, Puja } from '../../services/api';

const { width } = Dimensions.get('window');

const MOCK_POPULAR_PUJAS = [
  { id: '1', name_en: 'Satyanarayan Puja', name_hi: 'सत्यनारायण पूजा', base_price: 2100, duration_hrs: 2.5, deity: 'Vishnu', icon: '🔱' },
  { id: '2', name_en: 'Griha Pravesh Puja', name_hi: 'गृह प्रवेश पूजा', base_price: 5100, duration_hrs: 4, deity: 'Ganesh', icon: '🏡' },
  { id: '3', name_en: 'Ganesh Puja', name_hi: 'गणेश पूजा', base_price: 1500, duration_hrs: 1.5, deity: 'Ganesh', icon: '🐘' },
  { id: '4', name_en: 'Maha Mrityunjaya Jaap', name_hi: 'महा मृत्युंजय जाप', base_price: 11000, duration_hrs: 6, deity: 'Shiva', icon: '🕉️' },
];

const MOCK_FESTIVALS = [
  { id: '1', name_en: 'Ganesh Chaturthi', date: 'Sept 15, 2026', image: '🐘' },
  { id: '2', name_en: 'Navratri Durga Puja', date: 'Oct 12, 2026', image: '🔱' },
  { id: '3', name_en: 'Diwali Lakshmi Puja', date: 'Nov 08, 2026', image: '🪔' },
];

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { setSelectedPuja, setCurrentStep } = useBookingStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [filteredPujas, setFilteredPujas] = useState<Puja[]>([]);

  useEffect(() => {
    // Fetch pujas from API
    api.getPujas({ city: user?.city || '' })
      .then((res) => {
        const items = res.data.items || res.data;
        setPujas(items);
        setFilteredPujas(items);
      })
      .catch(() => {
        // Fallback to mock data for development
        setPujas(MOCK_POPULAR_PUJAS as any);
        setFilteredPujas(MOCK_POPULAR_PUJAS as any);
      });
  }, []);

  // Simple debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredPujas(pujas);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = pujas.filter(
          p => p.name_en.toLowerCase().includes(query) || (p.name_hi && p.name_hi.includes(query))
        );
        setFilteredPujas(filtered);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pujas]);

  const handlePujaSelect = (puja: any) => {
    setSelectedPuja(puja);
    navigation.navigate('PujaDetail', { pujaId: puja.id });
  };

  const handleQuickBook = () => {
    // Direct booking flow
    if (pujas.length > 0) {
      handlePujaSelect(pujas[0]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('greeting', { name: user?.name || 'Devotee' })}</Text>
          <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
            <MapPin size={16} color="#FF9933" style={{ marginRight: 4 }} />
            <Text style={styles.locationText}>{user?.city || 'Select City'}</Text>
            <ChevronRight size={14} color="#666666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Bell size={22} color="#1A1A1A" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerBadge}>
              <Sparkles size={12} color="#FFFDF7" style={{ marginRight: 4 }} />
              <Text style={styles.bannerBadgeText}>100% VERIFIED PANDITS</Text>
            </View>
            <Text style={styles.bannerTitle}>Experience Divine Puja at Your Home</Text>
            <Text style={styles.bannerSubtitle}>Hassle-free booking, samagri delivery, and rituals performed correctly.</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#888888" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Popular Pujas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('popularPujas')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PujaCatalogue')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {filteredPujas.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={styles.pujaCard}
                onPress={() => handlePujaSelect(item)}
                activeOpacity={0.9}
              >
                <View style={styles.pujaIconContainer}>
                  <Text style={styles.pujaIcon}>{item.icon || '🕉️'}</Text>
                </View>
                <Text style={styles.pujaName} numberOfLines={1}>{item.name_en}</Text>
                {item.name_hi && <Text style={styles.pujaNameHi}>{item.name_hi}</Text>}
                <Text style={styles.pujaPrice}>Starts from ₹{item.base_price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Festivals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('upcomingFestivals')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {MOCK_FESTIVALS.map((item) => (
              <View key={item.id} style={styles.festivalCard}>
                <Text style={styles.festivalIcon}>{item.image}</Text>
                <View style={styles.festivalInfo}>
                  <Text style={styles.festivalName}>{item.name_en}</Text>
                  <Text style={styles.festivalDate}>{item.date}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Rebook */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>{t('quickRebook')}</Text>
          <View style={styles.rebookCard}>
            <View style={styles.rebookLeft}>
              <Text style={styles.rebookEmoji}>🪔</Text>
              <View>
                <Text style={styles.rebookTitle}>Satyanarayan Puja</Text>
                <Text style={styles.rebookSub}>Last booked 3 months ago</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.rebookButton} onPress={handleQuickBook} activeOpacity={0.8}>
              <Text style={styles.rebookButtonText}>Book Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedPuja(null);
          setCurrentStep(1);
          navigation.navigate('BookingFlow');
        }}
        activeOpacity={0.9}
      >
        <Text style={styles.fabEmoji}>🕉️</Text>
        <Text style={styles.fabText}>{t('bookPandit')}</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE0',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    marginRight: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEBE4',
  },
  bellBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerContainer: {
    margin: 24,
    borderRadius: 20,
    backgroundColor: '#8B0000', // Deep Maroon
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bannerContent: {
    padding: 24,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 153, 51, 0.9)', // Saffron translucent
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFDF7',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFDF7',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#F4ECE1',
    lineHeight: 18,
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 16,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 28,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    height: '100%',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    color: '#FF9933',
    fontWeight: '700',
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  pujaCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F0E6D8',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  pujaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pujaIcon: {
    fontSize: 24,
  },
  pujaName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pujaNameHi: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  pujaPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9933',
    marginTop: 10,
  },
  festivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0E6D8',
  },
  festivalIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  festivalInfo: {
    justifyContent: 'center',
  },
  festivalName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  festivalDate: {
    fontSize: 11,
    color: '#FF9933',
    fontWeight: '600',
    marginTop: 2,
  },
  rebookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 24,
  },
  rebookLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rebookEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  rebookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  rebookSub: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  rebookButton: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: '#FF9933',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  rebookButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9933',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#FF9933',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fabEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  fabText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
