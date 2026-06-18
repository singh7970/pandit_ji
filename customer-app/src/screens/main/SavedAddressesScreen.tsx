import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Plus, MapPin, Trash2, Home, Briefcase, Map } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBookingStore } from '../../store/bookingStore';

interface SavedAddress {
  id: string;
  title: string;
  address_line: string;
}

export default function SavedAddressesScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: '1', title: 'Home', address_line: 'Flat 402, Shanti Heights, Sector 62, Noida' },
    { id: '2', title: 'Office', address_line: '8th Floor, Cyber Towers, Sector 45, Gurgaon' }
  ]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { setAddress } = useBookingStore();

  const loadAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem('saved_addresses');
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        // Seed default mock addresses for new users
        const defaultSeeds = [
          { id: '1', title: 'Home', address_line: 'Flat 402, Shanti Heights, Sector 62, Noida' },
          { id: '2', title: 'Office', address_line: '8th Floor, Cyber Towers, Sector 45, Gurgaon' }
        ];
        await AsyncStorage.setItem('saved_addresses', JSON.stringify(defaultSeeds));
        setAddresses(defaultSeeds);
      }
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = async () => {
    if (!title.trim() || !addressLine.trim()) {
      Alert.alert('Required Fields', 'Please fill in both the title and the address.');
      return;
    }

    setSubmitting(true);
    try {
      const newAddress: SavedAddress = {
        id: Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        address_line: addressLine.trim(),
      };

      const updated = [newAddress, ...addresses];
      await AsyncStorage.setItem('saved_addresses', JSON.stringify(updated));
      setAddresses(updated);
      
      // Reset form & close modal
      setTitle('');
      setAddressLine('');
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = addresses.filter(item => item.id !== id);
              await AsyncStorage.setItem('saved_addresses', JSON.stringify(updated));
              setAddresses(updated);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete address.');
            }
          }
        }
      ]
    );
  };

  const handleSelectAddress = (item: SavedAddress) => {
    setAddress(item.address_line, 28.6289, 77.3798); // Noida/NCR coord fallback
    Alert.alert(
      'Address Selected',
      `"${item.title}" address has been selected for your next booking!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const getIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('home')) return <Home size={20} color="#FF9933" />;
    if (lower.includes('office') || lower.includes('work')) return <Briefcase size={20} color="#FF9933" />;
    return <Map size={20} color="#FF9933" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
          <Plus size={22} color="#FF9933" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MapPin size={48} color="#C8C2B7" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No saved addresses found</Text>
              <Text style={styles.emptySubText}>Add your home or office address to book pujas faster.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.primaryButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <Text style={styles.sectionTitle}>Tap to select for your next booking</Text>
              {addresses.map((item) => (
                <View key={item.id} style={styles.addressCardOuter}>
                  <TouchableOpacity 
                    style={styles.addressCard} 
                    onPress={() => handleSelectAddress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconWrapper}>
                      {getIcon(item.title)}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.addressTitle}>{item.title}</Text>
                      <Text style={styles.addressLine} numberOfLines={2}>{item.address_line}</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDeleteAddress(item.id)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            
            <Text style={styles.inputLabel}>Address Label / Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Home, Office, Parents"
                placeholderTextColor="#A0988E"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Full Address</Text>
            <View style={[styles.inputContainer, { height: 90, alignItems: 'flex-start', paddingTop: 10 }]}>
              <TextInput
                style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                placeholder="Flat/House No, Building, Area, Street Name"
                placeholderTextColor="#A0988E"
                value={addressLine}
                onChangeText={setAddressLine}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleAddAddress}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FFFFFF',
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
    fontWeight: '800',
    color: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A0988E',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  addressCardOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  addressCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addressLine: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    lineHeight: 16,
  },
  deleteButton: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F5ECE0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    width: '100%',
    borderWidth: 0,
    outlineStyle: 'none',
  } as any,
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3EFE9',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '700',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#FF9933',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
