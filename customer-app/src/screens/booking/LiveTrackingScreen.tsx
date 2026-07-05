import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated, Linking, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Phone, MapPin, Navigation, MessageSquare, ArrowLeft } from 'lucide-react-native';
import { api } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function LiveTrackingScreen({ route, navigation }: any) {
  const { bookingId } = route.params || {};
  const { t } = useTranslation();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(15);
  const [distance, setDistance] = useState(2.4);
  const [status, setStatus] = useState('Pandit is on the way');

  // Animation values for mapping dot movement
  const dotX = React.useRef(new Animated.Value(0)).current;
  const dotY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    api.getBookingDetail(bookingId)
      .then((res) => {
        setBooking(res.data);
        if (res.data.status === 'PANDIT_ARRIVED') {
          setStatus('Pandit has arrived at location');
          setEta(0);
          setDistance(0);
        } else if (res.data.status === 'IN_PROGRESS') {
          setStatus('Puja is in progress');
          setEta(0);
          setDistance(0);
        } else if (res.data.status === 'COMPLETED') {
          setStatus('Puja Completed');
          setEta(0);
          setDistance(0);
        } else {
          setStatus('Pandit is on the way');
        }
      })
      .catch((err) => {
        console.warn("Failed to load tracking details:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Animate dot on a loop simulating Pandit walking
    const runAnimation = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dotX, { toValue: 60, duration: 4000, useNativeDriver: true }),
          Animated.timing(dotY, { toValue: -40, duration: 4000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dotX, { toValue: 120, duration: 4500, useNativeDriver: true }),
          Animated.timing(dotY, { toValue: -80, duration: 4500, useNativeDriver: true }),
        ]),
      ]).start();
    };

    runAnimation();

    // Timer to decrement ETA & distance if not arrived
    const interval = setInterval(() => {
      if (booking?.status !== 'PANDIT_ARRIVED' && booking?.status !== 'IN_PROGRESS' && booking?.status !== 'COMPLETED') {
        setEta((prev) => (prev > 1 ? prev - 1 : 1));
        setDistance((prev) => (prev > 0.2 ? parseFloat((prev - 0.15).toFixed(2)) : 0.2));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const handleCall = () => {
    const phoneNum = booking?.pandit?.phone;
    if (phoneNum) {
      Linking.openURL(`tel:${phoneNum}`).catch(() => {
        Alert.alert('Calling not supported', `Please dial ${phoneNum} manually`);
      });
    } else {
      Alert.alert('Unavailable', 'Pandit phone number is not available yet.');
    }
  };

  if (loading && !booking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF7' }}>
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Simulated Map Background */}
      <View style={styles.mapContainer}>
        {/* Custom premium grid layout representing roads */}
        <View style={[styles.road, { top: '40%', left: 0, width: '100%', height: 24, transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.road, { top: '30%', left: '45%', width: 24, height: '70%', transform: [{ rotate: '10deg' }] }]} />
        
        {/* Destination Pin */}
        <View style={[styles.pinContainer, { top: '25%', left: '60%' }]}>
          <View style={styles.destinationPulse} />
          <View style={[styles.pinCircle, { backgroundColor: '#8B0000' }]}>
            <Text style={{ fontSize: 16 }}>🏡</Text>
          </View>
          <Text style={styles.pinLabel}>Your Home</Text>
        </View>

        {/* Pandit Pin (Animated) */}
        <Animated.View 
          style={[
            styles.pinContainer, 
            { 
              top: '55%', 
              left: '30%',
              transform: [{ translateX: dotX }, { translateY: dotY }] 
            }
          ]}
        >
          <View style={styles.panditPulse} />
          <View style={[styles.pinCircle, { backgroundColor: '#FF9933' }]}>
            <Text style={{ fontSize: 18 }}>🕉️</Text>
          </View>
          <Text style={[styles.pinLabel, { color: '#FF9933' }]}>Panditji</Text>
        </Animated.View>
      </View>

      {/* Floating Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <ArrowLeft size={20} color="#1A1A1A" />
      </TouchableOpacity>

      {/* Bottom Status Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        {/* ETA & Distance Row */}
        <View style={styles.etaRow}>
          <View>
            <Text style={styles.etaText}>{eta} mins</Text>
            <Text style={styles.distanceText}>{distance} km away · {status}</Text>
          </View>
          <View style={styles.navigationIconContainer}>
            <Navigation size={22} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Pandit Details */}
        <View style={styles.panditRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.panditDetails}>
            <Text style={styles.panditName}>{booking?.pandit?.name || 'Assigning Pandit...'}</Text>
            <Text style={styles.panditRating}>
              {booking?.pandit
                ? `★ ${booking.pandit.rating_avg || 4.9} · Verified Pandit`
                : 'Searching for nearest available priest'}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconActionBtn} onPress={handleCall} activeOpacity={0.8}>
              <Phone size={20} color="#FF9933" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconActionBtn} activeOpacity={0.8}>
              <MessageSquare size={20} color="#FF9933" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#EFEBE4', // Light sand base for map
    overflow: 'hidden',
  },
  road: {
    position: 'absolute',
    backgroundColor: '#DFD9CF',
    borderColor: '#D0C8BE',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  pinLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#EFEBE4',
  },
  destinationPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 0, 0, 0.15)',
    top: -6,
  },
  panditPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 153, 51, 0.2)',
    top: -6,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 10,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EFEBE4',
    alignSelf: 'center',
    marginBottom: 16,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  etaText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  distanceText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    marginTop: 4,
  },
  navigationIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF9933',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginBottom: 16,
  },
  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F5ECE0',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  panditDetails: {
    flex: 1,
  },
  panditName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  panditRating: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE8D0',
  },
});
