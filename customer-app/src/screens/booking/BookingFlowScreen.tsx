import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Switch, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, CheckCircle2, ChevronRight, User } from 'lucide-react-native';
import { useBookingStore, Pandit, Puja } from '../../store/bookingStore';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

const MOCK_POPULAR_PUJAS: Puja[] = [
  { id: '1', name_en: 'Satyanarayan Puja', name_hi: 'सत्यनारायण पूजा', base_price: 2100, duration_hrs: 2.5, deity: 'Vishnu' },
  { id: '2', name_en: 'Griha Pravesh Puja', name_hi: 'गृह प्रवेश पूजा', base_price: 5100, duration_hrs: 4, deity: 'Ganesh' },
  { id: '3', name_en: 'Ganesh Puja', name_hi: 'गणेश पूजा', base_price: 1500, duration_hrs: 1.5, deity: 'Ganesh' },
  { id: '4', name_en: 'Maha Mrityunjaya Jaap', name_hi: 'महा मृत्युंजय जाप', base_price: 11000, duration_hrs: 6, deity: 'Shiva' },
];

const MOCK_PANDITS: Pandit[] = [
  { id: 'p1', name: 'Pandit Ramesh Shastri', rating_avg: 4.9, experience_years: 15, languages: ['Hindi', 'Sanskrit'], sampraday: 'Vedic', photo_url: '' },
  { id: 'p2', name: 'Pandit Sunil Dwivedi', rating_avg: 4.8, experience_years: 12, languages: ['Hindi', 'English'], sampraday: 'Vaishnav', photo_url: '' },
  { id: 'p3', name: 'Pandit Alok Tiwary', rating_avg: 4.7, experience_years: 8, languages: ['Hindi', 'Bhojpuri'], sampraday: 'Vedic', photo_url: '' },
];

export default function BookingFlowScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { 
    selectedPuja, setSelectedPuja, scheduledAt, setScheduledAt, address, lat, lng, setAddress,
    kitOrdered, setKitOrdered, selectedPandit, setSelectedPandit, currentStep, setCurrentStep, resetBooking
  } = useBookingStore();

  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loadingPujas, setLoadingPujas] = useState(false);
  const [localDate, setLocalDate] = useState('2026-06-12');
  const [localTime, setLocalTime] = useState('10:00 AM');
  const [localAddress, setLocalAddress] = useState('Flat 402, Shanti Heights, Sector 62, Noida');
  const [availablePandits, setAvailablePandits] = useState<Pandit[]>([]);
  const [loadingPandits, setLoadingPandits] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Success screen scale animation
  const successScale = useRef(new Animated.Value(0.3)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Step names
  const stepTitles = [
    'Choose Puja',
    'Date & Time',
    'Puja Address',
    'Samagri Kit',
    'Select Pandit',
    'Order Summary',
    'Confirmation'
  ];

  useEffect(() => {
    setLoadingPujas(true);
    api.getPujas()
      .then((res) => {
        setPujas(res.data.items || res.data);
      })
      .catch(() => {
        setPujas(MOCK_POPULAR_PUJAS);
      })
      .finally(() => setLoadingPujas(false));
  }, []);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedPuja) {
        alert("Please select a Puja to continue.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Parse local date/time to date object
      const combined = new Date(`${localDate}T${localTime.includes('AM') ? '10:00:00' : '18:00:00'}`);
      setScheduledAt(combined);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setAddress(localAddress, 28.6289, 77.3798); // Noida coordinates
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Fetch available pandits
      fetchPandits();
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setCurrentStep(6);
    } else if (currentStep === 6) {
      handlePayment();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else if (currentStep < 7) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fetchPandits = () => {
    setLoadingPandits(true);
    // Fetch from API
    api.getAvailablePandits({
      city: 'Delhi NCR',
      date: localDate,
      puja_id: selectedPuja?.id || '',
    })
      .then((res) => {
        setAvailablePandits(res.data || MOCK_PANDITS);
      })
      .catch(() => {
        setAvailablePandits(MOCK_PANDITS);
      })
      .finally(() => setLoadingPandits(false));
  };

  const handlePayment = async () => {
    setSubmitting(true);
    try {
      // 1. Create Booking
      const bookingRes = await api.createBooking({
        puja_id: selectedPuja!.id,
        scheduled_at: scheduledAt!.toISOString(),
        address: address!,
        lat: lat!,
        lng: lng!,
        pandit_id: selectedPandit?.id,
        kit_ordered: kitOrdered,
      });
      const newBooking = bookingRes.data;
      setBookingId(newBooking.id);

      // 2. Create payment order & simulate payment success
      await api.createPaymentOrder(newBooking.id);
      
      // Simulate API callback / webhook process delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitting(false);
      setCurrentStep(7);

      // Trigger success animation
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (e) {
      // In development fallback, create a mock booking ID and succeed
      setBookingId('BK-' + Math.floor(Math.random() * 900000 + 100000));
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitting(false);
      setCurrentStep(7);

      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const calculateTotal = () => {
    let base = selectedPuja?.base_price || 0;
    if (kitOrdered) base += 500; // Samagri kit cost
    return base;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (Only if not success screen) */}
      {currentStep < 7 && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{selectedPuja?.name_en || 'Book a Pandit'}</Text>
            <Text style={styles.headerSub}>{stepTitles[currentStep - 1]}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
      )}

      {/* Progress Bar */}
      {currentStep < 7 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(currentStep / 6) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 6</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Step 1: Choose Puja */}
        {currentStep === 1 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.stepInstruction}>Select a Puja to begin booking:</Text>
            
            {loadingPujas ? (
              <ActivityIndicator size="large" color="#FF9933" style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.pujaSelectionList}>
                {pujas.map((item) => {
                  const isSelected = selectedPuja?.id === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.pujaSelectionCard, isSelected && styles.pujaSelectionCardSelected]}
                      onPress={() => setSelectedPuja(item)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.pujaSelectionIconContainer}>
                        <Text style={styles.pujaSelectionIcon}>
                          {item.deity === 'Ganesh' ? '🐘' : item.deity === 'Vishnu' ? '🔱' : item.deity === 'Shiva' ? '🕉️' : '🪔'}
                        </Text>
                      </View>
                      <View style={styles.pujaSelectionInfo}>
                        <Text style={styles.pujaSelectionName}>{item.name_en}</Text>
                        {item.name_hi && <Text style={styles.pujaSelectionNameHi}>{item.name_hi}</Text>}
                        <Text style={styles.pujaSelectionDetails}>
                          ⏱ {item.duration_hrs} hrs · {item.deity && `🕉️ ${item.deity}`}
                        </Text>
                      </View>
                      <View style={styles.pujaSelectionPriceContainer}>
                        <Text style={styles.pujaSelectionPrice}>₹{item.base_price}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Step 2: Date & Time Picker */}
        {currentStep === 2 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.stepInstruction}>Select the date and time for the puja:</Text>
            
            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Calendar size={20} color="#FF9933" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Select Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={localDate}
                    onChangeText={setLocalDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Clock size={20} color="#FF9933" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Select Time Slot</Text>
                  <TextInput
                    style={styles.textInput}
                    value={localTime}
                    onChangeText={setLocalTime}
                    placeholder="HH:MM AM/PM"
                  />
                </View>
              </View>
            </View>

            <View style={styles.infoNote}>
              <Sparkles size={16} color="#8B0000" style={{ marginRight: 8 }} />
              <Text style={styles.infoNoteText}>Panditji recommends morning slots (before 12 PM) for Satyanarayan Pujas.</Text>
            </View>
          </View>
        )}

        {/* Step 3: Address Entry */}
        {currentStep === 3 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.stepInstruction}>Where should the Pandit perform the puja?</Text>
            <View style={styles.inputCard}>
              <View style={[styles.inputRow, { alignItems: 'flex-start' }]}>
                <MapPin size={20} color="#FF9933" style={{ marginRight: 12, marginTop: 4 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Full Address</Text>
                  <TextInput
                    style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                    value={localAddress}
                    onChangeText={setLocalAddress}
                    multiline
                    numberOfLines={3}
                    placeholder="House No, Building, Road name, Area"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Step 4: Samagri Kit Toggle */}
        {currentStep === 4 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.stepInstruction}>Do you need us to provide the Puja Samagri?</Text>
            <View style={styles.samagriToggleCard}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Order Complete Samagri Kit</Text>
                <Text style={styles.toggleSub}>All ingredients + copper kalash & deity photos delivered to you. (+₹500)</Text>
              </View>
              <Switch
                value={kitOrdered}
                onValueChange={setKitOrdered}
                trackColor={{ false: '#EFEBE4', true: '#FFEADB' }}
                thumbColor={kitOrdered ? '#FF9933' : '#F4F3F0'}
              />
            </View>
          </View>
        )}

        {/* Step 5: Pandit Selection */}
        {currentStep === 5 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.stepInstruction}>Choose a verified Pandit for your puja:</Text>
            
            {loadingPandits ? (
              <ActivityIndicator size="large" color="#FF9933" style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.panditList}>
                {availablePandits.map((pandit) => {
                  const isSelected = selectedPandit?.id === pandit.id;
                  return (
                    <TouchableOpacity
                      key={pandit.id}
                      style={[styles.panditCard, isSelected && styles.panditCardSelected]}
                      onPress={() => setSelectedPandit(pandit)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.panditAvatar}>
                        <User size={24} color="#FF9933" />
                      </View>
                      <View style={styles.panditInfo}>
                        <Text style={styles.panditName}>{pandit.name}</Text>
                        <Text style={styles.panditSub}>
                          {pandit.experience_years} years exp · {pandit.sampraday}
                        </Text>
                        <View style={styles.ratingRow}>
                          <Text style={styles.ratingText}>★ {pandit.rating_avg.toFixed(1)}</Text>
                        </View>
                      </View>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <View style={styles.checkboxDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Step 6: Order Summary */}
        {currentStep === 6 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.stepInstruction}>Verify details before proceeding to payment:</Text>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summarySectionTitle}>Puja Details</Text>
              <Text style={styles.summaryValue}>{selectedPuja?.name_en}</Text>
              <Text style={styles.summarySubValue}>Scheduled on: {scheduledAt?.toLocaleDateString('en-IN')} at {localTime}</Text>

              <View style={styles.summaryDivider} />

              <Text style={styles.summarySectionTitle}>Location</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>{address}</Text>

              {selectedPandit && (
                <>
                  <View style={styles.summaryDivider} />
                  <Text style={styles.summarySectionTitle}>Selected Pandit</Text>
                  <Text style={styles.summaryValue}>{selectedPandit.name}</Text>
                </>
              )}
            </View>

            {/* Price Card */}
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base Price</Text>
                <Text style={styles.priceValue}>₹{selectedPuja?.base_price}</Text>
              </View>
              {kitOrdered && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Samagri Kit</Text>
                  <Text style={styles.priceValue}>₹500</Text>
                </View>
              )}
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Step 7: Confirmation Screen */}
        {currentStep === 7 && (
          <Animated.View style={[styles.successContainer, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
            <CheckCircle2 size={80} color="#22C55E" style={{ marginBottom: 20 }} />
            <Text style={styles.successTitle}>{t('successTitle')}</Text>
            <Text style={styles.successSub}>{t('successSub')}</Text>
            
            <View style={styles.bookingDetailsCard}>
              <Text style={styles.detailsText}>Booking ID: {bookingId}</Text>
              <Text style={styles.detailsSubText}>You will receive details about your assigned Pandit soon via SMS and notification.</Text>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                resetBooking();
                navigation.navigate('Home');
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.doneButtonText}>Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => {
                navigation.replace('LiveTracking', { bookingId });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.trackButtonText}>{t('liveTracking')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Navigation Buttons (Only if not success screen) */}
      {currentStep < 7 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextButton, submitting && styles.nextButtonDisabled]} 
            onPress={handleNext}
            disabled={submitting}
            activeOpacity={0.9}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === 6 ? 'Pay Now' : 'Next'}
                </Text>
                {currentStep < 6 && <ChevronRight size={16} color="#FFFFFF" />}
              </>
            )}
          </TouchableOpacity>
        </View>
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSub: {
    fontSize: 11,
    color: '#FF9933',
    fontWeight: '700',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#EFEBE4',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9933',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '700',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  stepWrapper: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  stepInstruction: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  pujaSelectionList: {
    gap: 12,
  },
  pujaSelectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 16,
  },
  pujaSelectionCardSelected: {
    borderColor: '#FF9933',
    backgroundColor: '#FFF8F0',
  },
  pujaSelectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFDF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F5ECE0',
  },
  pujaSelectionIcon: {
    fontSize: 20,
  },
  pujaSelectionInfo: {
    flex: 1,
  },
  pujaSelectionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pujaSelectionNameHi: {
    fontSize: 11,
    color: '#888888',
    marginTop: 1,
  },
  pujaSelectionDetails: {
    fontSize: 11,
    color: '#A0988E',
    marginTop: 4,
    fontWeight: '500',
  },
  pujaSelectionPriceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  pujaSelectionPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF9933',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    padding: 0,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FCAE68',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#8B0000',
    fontWeight: '600',
    lineHeight: 16,
  },
  samagriToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 18,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  toggleSub: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  panditList: {
    gap: 12,
  },
  panditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    padding: 16,
  },
  panditCardSelected: {
    borderColor: '#FF9933',
    backgroundColor: '#FFF8F0',
  },
  panditAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFDF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F5ECE0',
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9933',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C8C2B7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#FF9933',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9933',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  summarySectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0988E',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  summarySubValue: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 14,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 20,
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
  priceDivider: {
    height: 1,
    backgroundColor: '#F5ECE0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF9933',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  bookingDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  detailsText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF9933',
    marginBottom: 8,
  },
  detailsSubText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 16,
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#FF9933',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  doneButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trackButton: {
    width: '100%',
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: '#FF9933',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 15,
    color: '#FF9933',
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5ECE0',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9933',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#FCAE68',
  },
  nextButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    marginRight: 6,
  },
});
