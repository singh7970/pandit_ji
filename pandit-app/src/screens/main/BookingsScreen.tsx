import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, IndianRupee } from 'lucide-react-native';
import { api } from '../../services/api';
import { useBookingStore } from '../../store/bookingStore';

export default function BookingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { setActiveBooking } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api.getMyBookings()
      .then((res) => {
        const list = res.data.items || res.data || [];
        const filtered = list.filter((b: any) => 
          activeTab === 'UPCOMING' ? b.status !== 'COMPLETED' && b.status !== 'CANCELLED' : b.status === 'COMPLETED'
        );
        setBookings(filtered);
      })
      .catch(() => {
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleBookingPress = (booking: any) => {
    if (activeTab === 'UPCOMING') {
      setActiveBooking(booking);
      navigation.navigate('ActiveBooking', { bookingId: booking.id });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const formattedDate = new Date(item.scheduled_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = new Date(item.scheduled_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleBookingPress(item)}
        activeOpacity={activeTab === 'UPCOMING' ? 0.9 : 1}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.pujaName}>{item.puja.name_en}</Text>
          <Text style={styles.payout}>+₹{Math.round(item.amount * 0.82)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Calendar size={14} color="#8B0000" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>{formattedDate} at {formattedTime}</Text>
        </View>

        <View style={[styles.infoRow, { marginTop: 6 }]}>
          <MapPin size={14} color="#8B0000" style={{ marginRight: 8 }} />
          <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('history')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'UPCOMING' && styles.tabActive]}
          onPress={() => setActiveTab('UPCOMING')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'UPCOMING' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'HISTORY' && styles.tabActive]}
          onPress={() => setActiveTab('HISTORY')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.tabTextActive]}>Completed History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No bookings in this tab</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#8B0000',
  },
  tabText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#8B0000',
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pujaName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  payout: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22C55E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
});
