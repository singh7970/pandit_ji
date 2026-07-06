import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { IndianRupee, TrendingUp, Award, Clock } from 'lucide-react-native';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

export default function EarningsScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any>(null);

  useEffect(() => {
    api.getEarnings()
      .then((res) => {
        setEarnings(res.data);
      })
      .catch(() => {
        setEarnings({
          total_earned: 0,
          total_pujas: 0,
          pending_payout: 0,
          this_month: 0,
          last_month: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('earningsDashboard')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Analytical Grid */}
        <View style={styles.grid}>
          <View style={styles.statsCard}>
            <TrendingUp size={20} color="#FF9933" style={{ marginBottom: 8 }} />
            <Text style={styles.statsLabel}>{t('totalRevenue')}</Text>
            <Text style={styles.statsValue}>₹{earnings?.total_earned || 0}</Text>
          </View>

          <View style={styles.statsCard}>
            <Award size={20} color="#FF9933" style={{ marginBottom: 8 }} />
            <Text style={styles.statsLabel}>{t('completedPujasCount')}</Text>
            <Text style={styles.statsValue}>{earnings?.total_pujas || 0}</Text>
          </View>
        </View>

        {/* Payout Escrow Status Card */}
        <View style={styles.escrowCard}>
          <View>
            <Text style={styles.escrowLabel}>Pending Payout Balance</Text>
            <Text style={styles.escrowSub}>Auto-settles tonight at 11:59 PM</Text>
          </View>
          <Text style={styles.escrowAmount}>₹{earnings?.pending_payout || 0}</Text>
        </View>

        {/* Monthly Summary */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Earnings</Text>
          <Text style={styles.chartSub}>Comparison with previous month</Text>

          <View style={{ marginTop: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#666666', fontWeight: '600' }}>This Month</Text>
              <Text style={{ fontSize: 15, color: '#1A1A1A', fontWeight: '800' }}>₹{earnings?.this_month || 0}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#F5ECE0' }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#666666', fontWeight: '600' }}>Last Month</Text>
              <Text style={{ fontSize: 15, color: '#1A1A1A', fontWeight: '800' }}>₹{earnings?.last_month || 0}</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Payout Settlements</Text>
          <View style={styles.transList}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: '#888888', fontSize: 13, fontWeight: '600' }}>No recent payouts yet</Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 16,
  },
  statsLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  escrowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FCAE68',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
  },
  escrowLabel: {
    fontSize: 13,
    color: '#8B0000',
    fontWeight: '800',
  },
  escrowSub: {
    fontSize: 11,
    color: '#C27E58',
    marginTop: 2,
    fontWeight: '500',
  },
  escrowAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#8B0000',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chartSub: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    marginTop: 24,
  },
  chartBarWrapper: {
    alignItems: 'center',
    width: (width - 128) / 7,
  },
  barBackground: {
    height: 100,
    width: 10,
    backgroundColor: '#FFF8F0',
    borderRadius: 5,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#FF9933',
    borderRadius: 5,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
    marginTop: 8,
  },
  transactionsSection: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  transList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E6D8',
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  transItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transDotContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFDF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F5ECE0',
  },
  transDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  transDate: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
    marginTop: 2,
  },
  transAmt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#22C55E',
  },
});
