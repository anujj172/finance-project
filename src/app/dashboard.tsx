import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useNavigation } from 'expo-router'; 
import { useFinance, Transaction } from '../hooks/useFinance'; 
import { DrawerActions } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { BarChart } from 'react-native-chart-kit'; // 👈 PieChart-ийг BarChart-аар солив

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation(); 
  
  // Глобал стейтээс өгөгдөл унших
  const { incomes, expenses } = useFinance();

  // Нийт орлого болон зарлагыг бодох
  const totalIncome = incomes.reduce((sum: number, item: Transaction) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum: number, item: Transaction) => sum + item.amount, 0);
  
  // Нийт үлдэгдэл
  const totalBalance = totalIncome - totalExpense;

  // Орлогын өгөгдөл бэлдэх
  const formattedIncomes = incomes.map((item: Transaction) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    amount: `+${item.amount.toLocaleString()}₮`,
    rawAmount: item.amount,
    type: 'income' as const,
  }));

  // Зарлагын өгөгдөл бэлдэх
  const formattedExpenses = expenses.map((item: Transaction) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    amount: `-${item.amount.toLocaleString()}₮`,
    rawAmount: item.amount,
    type: 'expense' as const,
  }));

  // Нийт гүйлгээний жагсаалт (id-аар уруудах дарааллаар эрэмбэлэв)
  const allTransactions = [...formattedIncomes, ...formattedExpenses].sort((a, b) => b.id.localeCompare(a.id));

  // Зүүн талын Sidebar-ийг нээх функц
  const handleOpenSidebar = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // 📊 Баганан диаграммд зориулсан дата бүтэц
  const barChartData = {
    labels: ['Орлого', 'Зарлага'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        // Багануудын өнгийг тусад нь удирдах функц
        colors: [
          (opacity = 1) => `#10B981`, // Орлого - Ногоон
          (opacity = 1) => `#EF4444`, // Зарлага - Улаан
        ]
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ХЭСЭГ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleOpenSidebar} style={styles.menuTouch}>
          <Ionicons name="menu-outline" size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Санхүүгийн тойм</Text>
        <View style={styles.avatar}><Text style={styles.avatarText}>АН</Text></View>
      </View>

      {/* ҮНДСЭН ХЯНАХ САМБАРЫН КОНТЕНТ */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionMainTitle}>Хянах самбар</Text>

        {/* Нийт үлдэгдэл карт */}
        <View style={[styles.balanceCard, { backgroundColor: totalBalance < 0 ? '#EF4444' : '#00A88F' }]}>
          <Text style={styles.balanceLabel}>Нийт үлдэгдэл</Text>
          <Text style={styles.balanceAmount}>{totalBalance.toLocaleString()}₮</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.miniCard, { borderColor: '#10B981' }]}>
            <Text style={styles.miniCardLabel}>Энэ сарын орлого</Text>
            <Text style={[styles.miniCardAmount, { color: '#10B981' }]}>+{totalIncome.toLocaleString()}₮</Text>
          </View>
          <View style={[styles.miniCard, { borderColor: '#EF4444' }]}>
            <Text style={styles.miniCardLabel}>Энэ сарын зарлага</Text>
            <Text style={[styles.miniCardAmount, { color: '#EF4444' }]}>-{totalExpense.toLocaleString()}₮</Text>
          </View>
        </View>

        {/* 📊 ОРЛОГО ЗАРЛАГЫН БҮТЭЦ (БАГАНАН ДИАГРАМ) */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Орлого, зарлагын харьцаа</Text>
          {totalIncome === 0 && totalExpense === 0 ? (
            <Text style={styles.noTransactionText}>График харуулах өгөгдөл алга.</Text>
          ) : (
            <View style={styles.chartCenter}>
              <BarChart
                data={barChartData}
                width={screenWidth - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix="₮"
                withCustomBarColorFromData={true} // Өгөгдсөн өнгөнүүдийг багана бүрт онооно
                flatColor={true}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `#64748B`,
                  labelColor: (opacity = 1) => `#1E293B`,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.6,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                  marginLeft: -10
                }}
              />
            </View>
          )}
        </View>

        {/* Сүүлийн гүйлгээ жагсаалт */}
        <View style={styles.transactionHeader}>
          <Text style={styles.sectionTitle}>Сүүлийн гүйлгээ</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>Бүгдийг харах</Text></TouchableOpacity>
        </View>

        {allTransactions.length === 0 ? (
          <Text style={styles.noTransactionText}>Одоогоор гүйлгээ бүртгэгдээгүй байна.</Text>
        ) : (
          allTransactions.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[styles.iconContainer, { backgroundColor: item.type === 'income' ? '#E6F4EA' : '#FCE8E6' }]}>
                <Ionicons 
                  name={item.type === 'income' ? "trending-up-outline" : "trending-down-outline"} 
                  size={18} 
                  color={item.type === 'income' ? '#137333' : '#C5221F'} 
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{item.title}</Text>
                <Text style={styles.transactionDate}>{item.date}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: item.type === 'income' ? '#10B981' : '#EF4444' }]}>
                {item.amount}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuTouch: { padding: 6, marginLeft: -6 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  sectionMainTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginTop: 18, marginBottom: 16 },
  balanceCard: { borderRadius: 16, padding: 24, marginBottom: 16 },
  balanceLabel: { color: '#E0F2FE', fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  miniCard: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 1, borderRadius: 12, padding: 12 },
  miniCardLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  miniCardAmount: { fontSize: 15, fontWeight: 'bold' },

  chartContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 16, marginBottom: 24, alignItems: 'center' },
  chartTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 8, alignSelf: 'flex-start' },
  chartCenter: { alignItems: 'center', justifyContent: 'center', width: '100%' },

  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  seeAllText: { fontSize: 12, color: '#00A88F', fontWeight: '600' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionDetails: { flex: 1 },
  transactionName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  transactionDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  transactionAmount: { fontSize: 14, fontWeight: 'bold' },
  noTransactionText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginVertical: 12 },
});