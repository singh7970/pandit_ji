import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Linking, Alert, Clipboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, Phone, CheckCircle, Copy, Play } from 'lucide-react-native';
import { useBookingStore } from '../../store/bookingStore';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

export default function ActiveBooking({ route, navigation }: any) {
  const { bookingId } = route.params;
  const { t } = useTranslation();
  const { activeBooking, setActiveBooking } = useBookingStore();

  const [status, setStatus] = useState<'CONFIRMED' | 'PANDIT_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'>('CONFIRMED');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Start background GPS logging simulation
    const gpsInterval = setInterval(() => {
      console.log(`[GPS LOG] Sending coordinates to Firebase Realtime DB for Booking ${bookingId}: 28.6289, 77.3798`);
    }, 10000);

    return () => clearInterval(gpsInterval);
  }, [bookingId]);

  const handleCopyAddress = () => {
    Clipboard.setString(activeBooking?.address || '');
    Alert.alert('Address Copied', 'Customer address has been copied to your clipboard.');
  };

  const handleStartNavigation = () => {
    const daddr = encodeURIComponent(activeBooking?.address || '');
    const url = `https://www.google.com/maps/dir/?api=1&destination=${daddr}`;
    Linking.openURL(url).catch(() => {
      alert('Unable to open map navigator.');
    });
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      if (status === 'CONFIRMED') {
        await api.markArrived(bookingId);
        setStatus('PANDIT_ARRIVED');
      } else if (status === 'PANDIT_ARRIVED') {
        await api.startPuja(bookingId);
        setStatus('IN_PROGRESS');
      } else if (status === 'IN_PROGRESS') {
        await api.completePuja(bookingId);
        setStatus('COMPLETED');
        Alert.alert('Success', 'Puja completed successfully. Payout has been transferred to your escrow account.', [
          {
            text: 'OK',
            onPress: () => {
              setActiveBooking(null);
              navigation.navigate('Home');
            }
          }
        ]);
      }
    } catch (e) {
      // Fallback
      if (status === 'CONFIRMED') {
        setStatus('PANDIT_ARRIVED');
      } else if (status === 'PANDIT_ARRIVED') {
        setStatus('IN_PROGRESS');
      } else if (status === 'IN_PROGRESS') {
        setStatus('COMPLETED');
        Alert.alert('Success', 'Puja completed successfully.', [
          {
            text: 'OK',
            onPress: () => {
              setActiveBooking(null);
              navigation.navigate('Home');
            }
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Puja Assignment</Text>
        <Text style={styles.bookingId}>ID: {bookingId}</Text>
      </View>

      <View style={styles.content}>
        {/* Visual Map Mock Card */}
        <View style={styles.mapCard}>
          <Text style={styles.mapLabel}>🗺️ Live Location Broadcast Enabled</Text>
        </View>

        {/* Customer Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSection}>Customer Locality</Text>
          <Text style={styles.customerName}>Mrs. Shruti Sharma</Text>
          
          <View style={styles.addressRow}>
            <MapPin size={18} color="#8B0000" style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.addressText}>{activeBooking?.address || ' Gurgaon Sector 45, Gurgaon'}</Text>
          </View>

          <View style={styles.addressActions}>
            <TouchableOpacity style={styles.actionLink} onPress={handleCopyAddress} activeOpacity={0.8}>
              <Copy size={14} color="#8B0000" style={{ marginRight: 6 }} />
              <Text style={styles.actionLinkText}>Copy Address</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionLink} onPress={handleStartNavigation} activeOpacity={0.8}>
              <Navigation size={14} color="#8B0000" style={{ marginRight: 6 }} />
              <Text style={styles.actionLinkText}>Navigate (Google Maps)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Assignment Phase</Text>
          <Text style={styles.statusValue}>
            {status === 'CONFIRMED' && 'Heading to Customer Address'}
            {status === 'PANDIT_ARRIVED' && 'Arrived at Location'}
            {status === 'IN_PROGRESS' && 'Puja Ritual Underway'}
            {status === 'COMPLETED' && 'Ritual Completed'}
          </Text>

          <TouchableOpacity 
            style={[styles.statusButton, loading && styles.buttonDisabled]} 
            onPress={handleStatusUpdate}
            disabled={loading}
            activeOpacity={0.9}
          >
            {status === 'CONFIRMED' && (
              <>
                <CheckCircle size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>{t('arrived')}</Text>
              </>
            )}
            {status === 'PANDIT_ARRIVED' && (
              <>
                <Play size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>{t('startPuja')}</Text>
              </>
            )}
            {status === 'IN_PROGRESS' && (
              <>
                <CheckCircle size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>{t('completePuja')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Contact Customer */}
        <TouchableOpacity 
          style={styles.callButton} 
          onPress={() => Linking.openURL('tel:+919876543210')}
          activeOpacity={0.8}
        >
          <Phone size={18} color="#FF9933" style={{ marginRight: 8 }} />
          <Text style={styles.callButtonText}>Call Customer</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F5ECE0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  bookingId: {
    fontSize: 11,
    color: '#8B0000',
    fontWeight: '700',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mapCard: {
    height: 140,
    backgroundColor: '#EFEBE4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DFD9CF',
  },
  mapLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardSection: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A0988E',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 6,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5ECE0',
    paddingTop: 14,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B0000',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '700',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8B0000',
    marginTop: 6,
    marginBottom: 18,
  },
  statusButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#8B0000',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#C87F7F',
  },
  buttonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF9933',
    height: 52,
    borderRadius: 12,
    width: '100%',
  },
  callButtonText: {
    fontSize: 14,
    color: '#FF9933',
    fontWeight: '700',
  },
});
