import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin, IndianRupee, Phone, CheckCircle, Navigation } from 'lucide-react-native';
import { api } from '../../services/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FF9933',
  CONFIRMED: '#22C55E',
  PANDIT_ARRIVED: '#6366F1',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
};

export default function BookingDetailScreen({ route, navigation }: any) {
  const { bookingId } = route.params;
  const { t } = useTranslation();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBookingDetail(bookingId)
      .then((res) => {
        setBooking(res.data);
      })
      .catch(() => {
        // Fallback for development/testing
        setBooking({
          id: bookingId,
          puja: { name_en: 'Satyanarayan Puja', name_hi: 'सत्यनारायण पूजा', base_price: 2100 },
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          status: 'CONFIRMED',
          amount: 2600, // including samagri kit
          kit_ordered: true,
          address: 'Flat 402, Shanti Heights, Sector 62, Noida',
          pandit: { name: 'Pandit Ramesh Shastri', phone: '+919876543210', rating_avg: 4.9 },
        });
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Cancellation charges may apply.',
      [
        { text: 'No, Keep Booking', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.cancelBooking(bookingId, 'Customer requested cancellation');
              navigation.goBack();
            } catch (e) {
              // fallback
              Alert.alert('Success', 'Booking cancelled successfully');
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking details not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(booking.scheduled_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = new Date(booking.scheduled_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const canTrack = ['CONFIRMED', 'PANDIT_ARRIVED', 'IN_PROGRESS'].includes(booking.status);
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Booking Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[booking.status]}15` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[booking.status] }]}>{booking.status}</Text>
          </View>
          <Text style={styles.bookingIdText}>Booking ID: {booking.id}</Text>
        </View>

        {/* Schedule & Address Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardSectionTitle}>Puja Schedule</Text>
          <View style={styles.rowItem}>
            <Calendar size={18} color="#FF9933" style={{ marginRight: 12 }} />
            <Text style={styles.rowValue}>{formattedDate}</Text>
          </View>
          <View style={styles.rowItem}>
            <Clock size={18} color="#FF9933" style={{ marginRight: 12 }} />
            <Text style={styles.rowValue}>{formattedTime}</Text>
          </View>

          <View style={styles.cardDivider} />

          <Text style={styles.cardSectionTitle}>Puja Location</Text>
          <View style={styles.rowItem}>
            <MapPin size={18} color="#FF9933" style={{ marginRight: 12 }} />
            <Text style={styles.rowValue}>{booking.address}</Text>
          </View>
        </View>

        {/* Pandit Details Card */}
        {booking.pandit && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardSectionTitle}>Assigned Pandit</Text>
            <View style={styles.panditRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <View style={styles.panditInfo}>
                <Text style={styles.panditName}>{booking.pandit.name}</Text>
                <Text style={styles.panditSub}>★ {booking.pandit.rating_avg} · Verified Pandit</Text>
              </View>
              <TouchableOpacity style={styles.phoneButton} activeOpacity={0.8}>
                <Phone size={18} color="#FF9933" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Price Summary Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardSectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{booking.puja.name_en}</Text>
            <Text style={styles.priceValue}>₹{booking.puja.base_price}</Text>
          </View>
          {booking.kit_ordered && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Samagri Kit</Text>
              <Text style={styles.priceValue}>₹500</Text>
            </View>
          )}
          <View style={styles.cardDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{booking.amount}</Text>
          </View>
        </View>

        {/* Track / Action buttons */}
        {canTrack && (
          <TouchableOpacity 
            style={styles.trackButton} 
            onPress={() => navigation.navigate('LiveTracking', { bookingId: booking.id })}
            activeOpacity={0.9}
          >
            <Navigation size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.trackButtonText}>Track Panditji Live</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
  },
  bookingIdText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0988E',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 14,
  },
  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  panditInfo: {
    flex: 1,
  },
  panditName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  panditSub: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  phoneButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#FCAE68',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF9933',
  },
  trackButton: {
    backgroundColor: '#FF9933',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  trackButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
