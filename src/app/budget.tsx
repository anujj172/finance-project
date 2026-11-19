import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinance } from '../hooks/useFinance'; 
import { PieChart } from 'react-native-chart-kit'; 
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function BudgetScreen() {
  const router = useRouter();
  
  // 🛠️ addExpenseCategory функцийг глобал стейтээс нэмж авав
  const { budgets, expenseCategories, expenses, addBudget, deleteBudget, addExpenseCategory, chartColors } = useFinance();

  // Модаль удирдах стейт
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Оруулах талбарын стейтүүд (Dropdown байхгүй болсон тул input стейт ашиглана)
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleGoBack = () => {
    router.replace('/dashboard');
  };

  // 📝 ШИНЭ ТӨСӨВ БОЛОН ЗАРДЛЫН АНГИЛАЛ ЗЭРЭГ ҮҮСГЭХ ФУНКЦ
  const handleAddBudget = () => {
    const categoryTrimmed = newBudgetCategory.trim();
    const amountNum = parseFloat(budgetAmount);

    // 1. Оролтуудыг шалгах
    if (!categoryTrimmed) {
      Alert.alert('Алдаа', 'Төсвийн ангиллын нэрийг оруулна уу!');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Алдаа', 'Төсвийн дүнг зөв оруулна уу!');
      return;
    }

    // 2. Ижил нэртэй ангилал төсөвт байгаа эсэхийг шалгах
    const isBudgetExist = budgets.some((b) => b.category.toLowerCase() === categoryTrimmed.toLowerCase());
    if (isBudgetExist) {
      Alert.alert('Сануулга', 'Энэ ангилалд аль хэдийн төсөв үүсгэсэн байна!');
      return;
    }

    // 3. Ижил нэртэй ангилал зардлын ангилалд байгаа эсэхийг шалгах
    const isCategoryExist = expenseCategories.some((cat) => cat.toLowerCase() === categoryTrimmed.toLowerCase());

    // Хэрэв зардлын ангилал дотор байхгүй бол шинээр нэмнэ
    if (!isCategoryExist) {
      addExpenseCategory(categoryTrimmed);
    } else {
      // Хэрэв зардалд байгаад төсөвт байхгүй байсан бол зүгээр үргэлжлүүлж болно, 
      // гэхдээ хэрэглэгчид мэдэгдэх үүднээс жижиг сануулга өгч болно.
      console.log("Энэ ангилал зардлын төрөлд аль хэдийн бүртгэгдсэн байна.");
    }

    // 4. Төсөв рүү нэмэх
    addBudget({
      id: Date.now().toString(),
      category: categoryTrimmed,
      allocatedAmount: amountNum, 
      limit: amountNum, 
    });

    // Стейт цэвэрлэх
    setBudgetAmount('');
    setNewBudgetCategory('');
    setIsModalOpen(false);
  };

  // Нийт статистик тооцоолох
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const spent = expenses.filter((e) => e.category === b.category).reduce((s, i) => s + i.amount, 0);
    return sum + spent;
  }, 0);
  const totalRemaining = totalAllocated - totalSpent;

  // Графикт зориулж өгөгдөл бэлдэх хэсэг
  const chartData = budgets.map((budget, idx) => {
    const spentAmount = expenses
      .filter((exp) => exp.category === budget.category)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      name: budget.category.length > 10 ? `${budget.category.substring(0, 10)}...` : budget.category,
      amount: spentAmount > 0 ? spentAmount : 0.1, // 0 байвал график зурагдахын тулд маш бага утга өгнө
      color: chartColors[idx % chartColors.length],
      legendFontColor: '#334155',
      legendFontSize: 12,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.menuTouch}>
          <Ionicons name="arrow-back-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Төсвийн удирдлага</Text>
        <View style={styles.avatar}><Text style={styles.avatarText}>АН</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ГАРЧИГ ХЭСЭГ */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Төсөв</Text>
            <Text style={styles.subtitle}>Зардалтай үлдсэн хяналт</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
            <Text style={styles.addBtnText}>+ Төсөв нэмэх</Text>
          </TouchableOpacity>
        </View>

        {/* ДЭЭД ТАЛЫН СТАТИСТИК КАРТУУД */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Төсөвлөсөн</Text>
            <Text style={[styles.statValue, { color: '#0F172A' }]}>{totalAllocated.toLocaleString()}₮</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Зарцуулсан</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{totalSpent.toLocaleString()}₮</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Үлдэгдэл</Text>
            <Text style={[styles.statValue, { color: '#00A88F' }]}>{totalRemaining.toLocaleString()}₮</Text>
          </View>
        </View>

        {/* ЗАРЦУУЛАЛТЫН БҮТЭЦ - ДУГУЙ ГРАФИК ХЭСЭГ */}
        <View style={styles.chartSectionContainer}>
          <Text style={styles.sectionTitle}>Зарцуулалтын бүтэц</Text>
          {budgets.length === 0 ? (
            <View style={styles.chartEmpty}>
              <Text style={styles.noDataText}>Төсвийн өгөгдөл одоогоор алга.</Text>
            </View>
          ) : (
            <View style={styles.chartWrapper}>
              <PieChart
                data={chartData}
                width={screenWidth - 40}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"amount"}
                backgroundColor={"transparent"}
                paddingLeft={"10"}
                absolute
              />
            </View>
          )}
        </View>

        {/* ТТӨСВИЙН ЖАГСААЛТ */}
        <Text style={styles.sectionTitle}>Төсвийн жагсаалт</Text>
        {budgets.length === 0 ? (
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyText}>Одоогоор төсөв үүсгээгүй байна.</Text>
          </View>
        ) : (
          budgets.map((budget, idx) => {
            const spentAmount = expenses
              .filter((exp) => exp.category === budget.category)
              .reduce((sum, item) => sum + item.amount, 0);

            const remaining = budget.allocatedAmount - spentAmount;
            const progress = budget.allocatedAmount > 0 ? spentAmount / budget.allocatedAmount : 0;
            const progressPercent = Math.min(100, Math.round(progress * 100));

            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.categoryName}>{budget.category}</Text>
                  <TouchableOpacity onPress={() => deleteBudget(budget.id)}>
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${progressPercent}%`, 
                        backgroundColor: progressPercent >= 100 ? '#EF4444' : chartColors[idx % chartColors.length] 
                      }
                    ]} 
                  />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.footerLabel}>Зарцуулсан: {spentAmount.toLocaleString()}₮</Text>
                  <Text style={[styles.footerLabel, { fontWeight: '600', color: remaining < 0 ? '#EF4444' : '#64748B' }]}>
                    Үлдсэн: {remaining.toLocaleString()}₮
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ТӨСӨВ НЭМЭХ МОДАЛЬ */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>Шинэ төсөв үүсгэх</Text>
              <TouchableOpacity onPress={() => { setIsModalOpen(false); }}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 🛠️ DROPDOWN-ИЙН ОРОНД ГАРААР БИЧИХ INPUT БОЛГОЖ ӨӨРЧЛӨВ */}
            <Text style={styles.inputLabel}>Ангиллын нэр</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Жишээ нь: Хоол унд, Бензин, Хувцас..."
              placeholderTextColor="#94A3B8"
              value={newBudgetCategory}
              onChangeText={setNewBudgetCategory}
            />

            <Text style={styles.inputLabel}>Хуваарилсан дүн (₮)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddBudget}>
              <Text style={styles.submitBtnText}>Төсөв үүсгэх</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuTouch: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addBtn: { backgroundColor: '#0F172A', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  addBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: 'bold' },
  chartSectionContainer: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 24, alignItems: 'center' },
  chartWrapper: { justifyContent: 'center', alignItems: 'center', width: '100%' },
  chartEmpty: { height: 100, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 14 },
  emptyCenter: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#94A3B8' },
  budgetCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  deleteText: { fontSize: 16 },
  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel: { fontSize: 13, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  closeX: { fontSize: 20, color: '#64748B', fontWeight: 'bold' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 8, marginTop: 14 },
  noDataText: { padding: 14, color: '#94A3B8', fontSize: 13, textAlign: 'center' },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0F172A', marginBottom: 12 },
  submitBtn: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});