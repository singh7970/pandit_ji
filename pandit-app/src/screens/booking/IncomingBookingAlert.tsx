import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Alert, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, Navigation, CheckCircle2, XCircle, BellRing } from 'lucide-react-native';
import { useBookingStore } from '../../store/bookingStore';
import { api } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function IncomingBookingAlert({ navigation }: any) {
  const { t } = useTranslation();
  const { incomingRequest, setIncomingRequest, setActiveBooking } = useBookingStore();

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    // Vibrate to catch attention
    Vibration.vibrate([500, 500, 500, 500], false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAccept = async () => {
    if (!incomingRequest) return;
    try {
      await api.acceptBooking(incomingRequest.id);
      
      const detailedBooking = {
        id: incomingRequest.id,
        puja: { name_en: incomingRequest.puja_name, name_hi: incomingRequest.puja_name === 'Satyanarayan Puja' ? 'सत्यनारायण पूजा' : 'गणेश पूजा' },
        scheduled_at: incomingRequest.scheduled_at,
        amount: incomingRequest.estimated_earnings / 0.82,
        address: 'Flat 101, Om Vihar, Phase 1, Gurgaon Sector 45',
        status: 'CONFIRMED',
      };
      
      setActiveBooking(detailedBooking);
      setIncomingRequest(null);
      
      navigation.replace('ActiveBooking', { bookingId: incomingRequest.id });
    } catch (e) {
      // fallback
      const detailedBooking = {
        id: incomingRequest.id,
        puja: { name_en: incomingRequest.puja_name, name_hi: incomingRequest.puja_name === 'Satyanarayan Puja' ? 'सत्यनारायण पूजा' : 'गणेश पूजा' },
        scheduled_at: incomingRequest.scheduled_at,
        amount: incomingRequest.estimated_earnings / 0.82,
        address: 'Flat 101, Om Vihar, Phase 1, Gurgaon Sector 45',
        status: 'CONFIRMED',
      };
      setActiveBooking(detailedBooking);
      setIncomingRequest(null);
      navigation.replace('ActiveBooking', { bookingId: incomingRequest.id });
    }
  };

  const handleDecline = async () => {
    if (incomingRequest) {
      try {
        await api.declineBooking(incomingRequest.id);
      } catch (e) {}
    }
    setIncomingRequest(null);
    navigation.goBack();
  };

  if (!incomingRequest) {
    return null;
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Ringing Bell Visual */}
        <View style={styles.pulseContainer}>
          <View style={styles.pulseRing} />
          <View style={styles.bellWrapper}>
            <BellRing size={44} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.alertTitle}>{t('newBookingAlert')}</Text>
        <Text style={styles.timerText}>Responding Time: {formatTimer(timeLeft)}</Text>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.payoutLabel}>ESTIMATED PAYOUT</Text>
          <Text style={styles.payoutAmount}>₹{incomingRequest.estimated_earnings}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Clock size={18} color="#FF9933" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.infoTitle}>Puja Ritual</Text>
              <Text style={styles.infoValue}>{incomingRequest.puja_name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Navigation size={18} color="#FF9933" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.infoTitle}>Customer Locality</Text>
              <Text style={styles.infoValue}>{incomingRequest.customer_locality}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.declineButton} onPress={handleDecline} activeOpacity={0.8}>
            <XCircle size={20} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.declineText}>{t('decline')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.9}>
            <CheckCircle2 size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.acceptText}>{t('accept')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000', // Crimson alert screen
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bellWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  timerText: {
    fontSize: 14,
    color: '#FFCA99',
    fontWeight: '700',
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  payoutLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '800',
    letterSpacing: 1,
  },
  payoutAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#22C55E',
    marginTop: 6,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#22C55E',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
