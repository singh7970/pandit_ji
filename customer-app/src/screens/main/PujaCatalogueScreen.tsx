import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import { api, Puja } from '../../services/api';

const { width } = Dimensions.get('window');

const MOCK_PUJAS = [
  { id: '1', name_en: 'Satyanarayan Puja', name_hi: 'सत्यनारायण पूजा', base_price: 2100, duration_hrs: 2.5, deity: 'Vishnu', icon: '🔱', occasion: 'Festivals' },
  { id: '2', name_en: 'Griha Pravesh Puja', name_hi: 'गृह प्रवेश पूजा', base_price: 5100, duration_hrs: 4, deity: 'Ganesh', icon: '🏡', occasion: 'Housewarming' },
  { id: '3', name_en: 'Ganesh Puja', name_hi: 'गणेश पूजा', base_price: 1500, duration_hrs: 1.5, deity: 'Ganesh', icon: '🐘', occasion: 'Festivals' },
  { id: '4', name_en: 'Maha Mrityunjaya Jaap', name_hi: 'महा मृत्युंजय जाप', base_price: 11000, duration_hrs: 6, deity: 'Shiva', icon: '🕉️', occasion: 'Health' },
  { id: '5', name_en: 'Rudrabhishek Puja', name_hi: 'रुद्राभिषेक पूजा', base_price: 3500, duration_hrs: 3, deity: 'Shiva', icon: '🌊', occasion: 'Solace' },
  { id: '6', name_en: 'Saraswati Puja', name_hi: 'सरस्वती पूजा', base_price: 1800, duration_hrs: 2, deity: 'Saraswati', icon: '📖', occasion: 'Education' },
];

const OCCASIONS = ['All', 'Festivals', 'Housewarming', 'Health', 'Education', 'Solace'];

export default function PujaCatalogueScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [pujas, setPujas] = useState<any[]>(MOCK_PUJAS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('All');

  useEffect(() => {
    api.getPujas()
      .then((res) => {
        setPujas(res.data.items || res.data);
      })
      .catch(() => {
        // Fallback already loaded
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPujas = pujas.filter((item) => {
    const matchesSearch = item.name_en.toLowerCase().includes(search.toLowerCase()) || 
                          (item.name_hi && item.name_hi.includes(search));
    const matchesOccasion = selectedOccasion === 'All' || item.occasion === selectedOccasion;
    return matchesSearch && matchesOccasion;
  });

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PujaDetail', { pujaId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon || '🕉️'}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name_en}</Text>
      <Text style={styles.nameHi} numberOfLines={1}>{item.name_hi || ''}</Text>
      <Text style={styles.price}>Starts from ₹{item.base_price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Puja Catalogue</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#888888" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a puja or deity..."
          placeholderTextColor="#888888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Occasion Filter Row */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {OCCASIONS.map((occasion) => {
            const isActive = selectedOccasion === occasion;
            return (
              <TouchableOpacity
                key={occasion}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedOccasion(occasion)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {occasion}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
        </View>
      ) : (
        <FlatList
          data={filteredPujas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌸</Text>
              <Text style={styles.emptyText}>No pujas found</Text>
              <Text style={styles.emptySubText}>Try searching for a different ritual or category.</Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    height: '100%',
  },
  filterWrapper: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterScroll: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  filterChipActive: {
    borderColor: '#FF9933',
    backgroundColor: '#FFF8F0',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FF9933',
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  gridContent: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 16,
    width: (width - 64) / 2, // 2 Column Grid
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 22,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nameHi: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  price: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9933',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptySubText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    marginTop: 6,
  },
});
