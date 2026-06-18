import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, IndianRupee, Clock, Star, ChevronRight } from 'lucide-react-native';
import { api } from '../../services/api';

interface Booking {
  id: string;
  puja: { name_en: string; name_hi: string };
  scheduled_at: string;
  status: string;
  amount: number;
  address: string;
  pandit?: { name: string; photo_url?: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FF9933',
  CONFIRMED: '#22C55E',
  PANDIT_ARRIVED: '#6366F1',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
};

export default function BookingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'b1',
      puja: { name_en: 'Satyanarayan Puja', name_hi: 'सत्यनारायण पूजा' },
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      status: 'CONFIRMED',
      amount: 2100,
      address: 'Flat 402, Shanti Heights, Sector 62, Noida',
      pandit: { name: 'Pandit Ramesh Shastri' }
    },
    {
      id: 'b2',
      puja: { name_en: 'Ganesh Puja', name_hi: 'गणेश पूजा' },
      scheduled_at: new Date(Date.now() - 172800000).toISOString(),
      status: 'COMPLETED',
      amount: 1500,
      address: 'Flat 402, Shanti Heights, Sector 62, Noida',
      pandit: { name: 'Pandit Ramesh Shastri' }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.getMyBookings();
      setBookings(res.data.items || res.data);
    } catch (e) {
      // Mock data for development
      setBookings([
        {
          id: 'b1',
          puja: { name_en: 'Satyanarayan Puja', name_hi: 'सत्यनारायण पूजा' },
          scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: 'CONFIRMED',
          amount: 2100,
          address: 'Flat 402, Shanti Heights, Sector 62, Noida',
          pandit: { name: 'Pandit Ramesh Shastri' }
        },
        {
          id: 'b2',
          puja: { name_en: 'Ganesh Puja', name_hi: 'गणेश पूजा' },
          scheduled_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          status: 'COMPLETED',
          amount: 1500,
          address: 'Flat 402, Shanti Heights, Sector 62, Noida',
          pandit: { name: 'Pandit Ramesh Shastri' }
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    const isPast = ['COMPLETED', 'CANCELLED'].includes(b.status);
    return activeTab === 'past' ? isPast : !isPast;
  });

  const renderBookingCard = ({ item }: { item: Booking }) => {
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
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id, booking: item })}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.pujaName}>{item.puja.name_en}</Text>
            <Text style={styles.pujaNameHi}>{item.puja.name_hi}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}15` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Calendar size={16} color="#666666" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>{formattedDate} · {formattedTime}</Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={16} color="#666666" style={{ marginRight: 8 }} />
          <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
        </View>

        {item.pandit && (
          <View style={styles.panditRow}>
            <View style={styles.panditAvatar}>
              <Text style={styles.avatarText}>🕉️</Text>
            </View>
            <View>
              <Text style={styles.panditName}>{item.pandit.name}</Text>
              <Text style={styles.panditSub}>Assigned Pandit</Text>
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountText}>₹{item.amount}</Text>
          </View>

          {item.status === 'COMPLETED' ? (
            <TouchableOpacity style={styles.reviewButton} activeOpacity={0.8}>
              <Star size={14} color="#FF9933" style={{ marginRight: 4 }} />
              <Text style={styles.reviewButtonText}>Rate Puja</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.detailsButton} 
              onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id, booking: item })}
              activeOpacity={0.8}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
              <ChevronRight size={14} color="#FF9933" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{t('bookingHistory')}</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            {t('upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            {t('past')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9933']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🕯️</Text>
              <Text style={styles.emptyText}>No bookings found</Text>
              <Text style={styles.emptySubText}>
                {activeTab === 'upcoming' 
                  ? 'Your upcoming bookings will appear here.'
                  : 'Your past bookings history will appear here.'}
              </Text>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#F3EDE4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#FF9933',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0E6D8',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pujaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pujaNameHi: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F5ECE0',
  },
  panditAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  panditName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  panditSub: {
    fontSize: 10,
    color: '#888888',
    marginTop: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5ECE0',
    paddingTop: 14,
    marginTop: 4,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  amountLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 1,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FF9933',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9933',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9933',
    marginRight: 2,
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
    paddingHorizontal: 40,
  },
});
