import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Power, IndianRupee, Calendar, Clock, MapPin, Sparkles, Star } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { api } from '../../services/api';

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, isActiveDuty, setIsActiveDuty } = useAuthStore();
  const { setActiveBooking, setIncomingRequest } = useBookingStore();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    api.getMyBookings()
      .then((res) => {
        setBookings(res.data.items || res.data);
      })
      .catch(() => {
        // Fallback for development/testing
        setBookings([
          {
            id: 'b10',
            puja: { name_en: 'Satyanarayan Puja', name_hi: 'सत्यनारायण पूजा' },
            scheduled_at: new Date(Date.now() + 7200000).toISOString(), // in 2 hours
            status: 'CONFIRMED',
            amount: 2100,
            address: 'Flat 101, Om Vihar, Phase 1, Gurgaon',
          },
          {
            id: 'b11',
            puja: { name_en: 'Ganesh Puja', name_hi: 'गणेश पूजा' },
            scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            status: 'CONFIRMED',
            amount: 1500,
            address: 'Villa 52, Lotus Boulevard, Sector 150, Noida',
          }
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleToggleDuty = (val: boolean) => {
    setIsActiveDuty(val);
    api.updatePanditProfile({ is_active: val }).catch(() => {});
  };

  // Simulate an incoming booking request popup
  const handleSimulateAlert = () => {
    setIncomingRequest({
      id: 'bk_simulated',
      puja_name: 'Satyanarayan Puja',
      customer_locality: 'Gurgaon Sector 45',
      scheduled_at: new Date(Date.now() + 3600000 * 3).toISOString(), // in 3 hours
      estimated_earnings: 1722, // 82% of base price
    });
    navigation.navigate('IncomingBookingAlert');
  };

  const handleBookingPress = (booking: any) => {
    setActiveBooking(booking);
    navigation.navigate('ActiveBooking', { bookingId: booking.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Jai Shri Ram, Panditji!</Text>
          <Text style={styles.subGreeting}>{user?.name}</Text>
        </View>
        
        {/* Active/Offline Duty Status Toggle */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: isActiveDuty ? '#22C55E' : '#888888' }]}>
            {isActiveDuty ? t('activeStatusOn') : t('activeStatusOff')}
          </Text>
          <Switch
            value={isActiveDuty}
            onValueChange={handleToggleDuty}
            trackColor={{ false: '#EFEBE4', true: '#22C55E' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev Tools Simulation Banner */}
        <View style={styles.simulationBanner}>
          <Text style={styles.simulationText}>Simulate booking match request for testing:</Text>
          <TouchableOpacity style={styles.simulationButton} onPress={handleSimulateAlert} activeOpacity={0.8}>
            <Text style={styles.simulationBtnText}>Trigger Incoming Request Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>{t('todayEarnings')}</Text>
          <View style={styles.earningsRow}>
            <IndianRupee size={32} color="#FFFFFF" />
            <Text style={styles.earningsAmount}>3,450</Text>
          </View>
          <Text style={styles.earningsSub}>2 Pujas completed today</Text>
        </View>

        {/* Upcoming Bookings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('upcomingBookings')}</Text>

          {loading ? (
            <ActivityIndicator size="small" color="#8B0000" style={{ marginTop: 20 }} />
          ) : bookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('noUpcoming')}</Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {bookings.slice(0, 2).map((booking) => {
                const formattedTime = new Date(booking.scheduled_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <TouchableOpacity
                    key={booking.id}
                    style={styles.bookingCard}
                    onPress={() => handleBookingPress(booking)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.bookingCardHeader}>
                      <View>
                        <Text style={styles.pujaName}>{booking.puja.name_en}</Text>
                        <Text style={styles.localityText}>{booking.address.split(',')[1] || booking.address}</Text>
                      </View>
                      <Text style={styles.payoutText}>+₹{Math.round(booking.amount * 0.82)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.bookingCardFooter}>
                      <View style={styles.timeRow}>
                        <Clock size={14} color="#888888" style={{ marginRight: 6 }} />
                        <Text style={styles.timeText}>{formattedTime}</Text>
                      </View>
                      <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>Tap to start</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Rating Card */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.ratingCard}>
            <Star size={36} color="#FF9933" style={{ marginBottom: 8 }} />
            <Text style={styles.ratingValue}>★ 4.9</Text>
            <Text style={styles.ratingTitle}>Verified Gold Partner Status</Text>
            <Text style={styles.ratingSub}>You are currently in the top tier. Maintain a 4.8+ rating to keep receiving extra incentives.</Text>
          </View>
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
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subGreeting: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: '700',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  simulationBanner: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginHorizontal: 24,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
  },
  simulationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 10,
  },
  simulationButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  simulationBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  earningsCard: {
    backgroundColor: '#8B0000', // Maroon card for earnings
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 20,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#FFF5F5',
    fontWeight: '700',
    letterSpacing: 1,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  earningsAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  earningsSub: {
    fontSize: 12,
    color: '#FFCA99',
    fontWeight: '600',
    marginTop: 8,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  emptyText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
  bookingsList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pujaName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  localityText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginTop: 4,
  },
  payoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22C55E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 12,
  },
  bookingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  actionBadge: {
    backgroundColor: '#FFF8F0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9933',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ratingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9933',
    marginBottom: 6,
  },
  ratingSub: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
});
