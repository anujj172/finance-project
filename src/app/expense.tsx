import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinance, Transaction } from '../hooks/useFinance'; 
import { PieChart } from 'react-native-chart-kit'; 
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function ExpenseScreen() {
  const router = useRouter();

  // Глобал стейтээс зарлагын дата болон функцуудыг авах
  const { expenses, expenseCategories, addExpense, addExpenseCategory, chartColors } = useFinance();

  // Модаль удирдах стейтүүд
  const [isCatModalOpen, setIsCatModalOpen] = useState(false); 
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  // Оруулах талбарын стейтүүд
  const [newCatName, setNewCatName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expenseTitle, setExpenseTitle] = useState(''); // Зарлагын утга/тайлбар оруулах талбар

  const handleGoBack = () => {
    router.replace('/dashboard');
  };

  // 1. ШИНЭ АНГИЛАЛ НЭМЭХ (Зөвхөн хэрэглэгч өөрөө нэмнэ)
  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Алдаа', 'Төрлийн нэрийг оруулна уу!');
      return;
    }

    // Өмнө нь ийм ангилал бүртгэгдсэн эсэхийг шалгах
    if (expenseCategories.includes(newCatName.trim())) {
      Alert.alert('Алдаа', 'Энэ ангилал аль хэдийн бүртгэгдсэн байна!');
      return;
    }

    addExpenseCategory(newCatName.trim());
    setNewCatName('');
    setIsCatModalOpen(false);
  };

  // 2. ЗАРЛАГА НЭМЭХ
  const handleAddExpense = () => {
    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Алдаа', 'Зарлагын дүнг зөв оруулна уу!');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Алдаа', 'Ангилал/Төрөл сонгоно уу!');
      return;
    }
    if (!expenseTitle.trim()) {
      Alert.alert('Алдаа', 'Зарлагын тайлбар эсвэл нэрийг оруулна уу!');
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    addExpense({
      id: Date.now().toString(),
      title: expenseTitle.trim(), // Жишээ нь: "Үдийн хоол", "Бензин" гэх мэт хэрэглэгчийн бичсэн тайлбар
      amount: amountNum,
      date: formattedDate,
      category: selectedCategory, // Чиний гараар нэмээд, Dropdown-оос сонгосон яг тэр ангилал хадгалагдана
    });

    setExpenseAmount('');
    setExpenseTitle('');
    setSelectedCategory('');
    setIsExpenseModalOpen(false);
  };

  // --- ГРАФИКИЙН ЗӨВ ЛОГИК ТОOЦООЛОЛ ---
  const totalExpenseAmount = expenses.reduce((sum: number, item: Transaction) => sum + item.amount, 0);

  // Зөвхөн чиний гараар нэмсэн бөгөөд бодитоор гүйлгээ хийгдсэн ангиллуудыг шүүж графикаар харуулна
  const activeCategories = expenseCategories.filter((cat: string) => {
    const catTotal = expenses
      .filter((item: Transaction) => item.category === cat) 
      .reduce((sum: number, item: Transaction) => sum + item.amount, 0);
    return catTotal > 0;
  });

  // 📊 Pie Chart өгөгдөл
  const pieChartData = activeCategories.map((cat: string, idx: number) => {
    const catTotal = expenses
      .filter((item: Transaction) => item.category === cat)
      .reduce((sum: number, item: Transaction) => sum + item.amount, 0);

    return {
      name: cat.length > 10 ? `${cat.substring(0, 10)}...` : cat,
      amount: catTotal,
      color: chartColors[idx % chartColors.length],
      legendFontColor: '#334155',
      legendFontSize: 12,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ХЭСЭГ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.menuTouch}>
          <Ionicons name="arrow-back-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Зарлагын удирдлага</Text>
        <View style={styles.avatar}><Text style={styles.avatarText}>АН</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ТИТЛЬ БОЛОН ТОВЧЛУУРУУД */}
        <View style={styles.orlogoHeaderRow}>
          <View>
            <Text style={styles.orlogoMainTitle}>Зарлага</Text>
            <Text style={styles.orlogoSubtitle}>2026 оны 3-р сар</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.orlogoTagBtn} onPress={() => setIsCatModalOpen(true)}>
              <Text style={styles.orlogoTagBtnText}>🏷️ Төрөл</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.orlogoAddBtn, { backgroundColor: '#EF4444' }]} onPress={() => setIsExpenseModalOpen(true)}>
              <Text style={styles.orlogoAddBtnText}>+ Нэмэх</Text>
            </TouchableOpacity>
          </View>
        </View>

        {expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Зарлагын жагсаалт</Text>
            <View style={styles.emptyCenter}>
              <Text style={styles.databaseIcon}>🛢️</Text>
              <Text style={styles.emptyText}>Зарлагын түүх хоосон байна</Text>
            </View>
          </View>
        ) : (
          <View>
            {/* 📊 ЗАРЛАГЫН БҮТЭЦ (PIE CHART) */}
            <View style={styles.orlogoCard}>
              <Text style={styles.cardTitle}>Зарлагын бүтэц</Text>
              <View style={styles.chartWrapper}>
                {pieChartData.length > 0 ? (
                  <PieChart
                    data={pieChartData}
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
                ) : (
                  <Text style={styles.noDataText}>График харуулах зарлагын түүх алга байна.</Text>
                )}
              </View>
            </View>

            {/* Зарлагын түүх */}
            <View style={styles.orlogoCard}>
              <Text style={styles.cardTitle}>Зарлагын түүх ({totalExpenseAmount.toLocaleString()}₮)</Text>
              {expenses.map((item: Transaction) => (
                <View key={item.id} style={styles.orlogoHistoryItem}>
                  <View>
                    <Text style={styles.historyName}>{item.title}</Text>
                    {/* Хэрэв ангилал нь тайлбараасаа өөр байвал жижиг хаяг шиг харуулна */}
                    <Text style={styles.historyCategory}>{item.category}</Text> 
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: '#EF4444' }]}>-{item.amount.toLocaleString()}₮</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* МОДАЛЬ 1: ШИНЭ ТӨРӨЛ (АНГИЛАЛ) НЭМЭХ */}
      <Modal visible={isCatModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Шинэ төрөл нэмэх</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Төрлийн нэр (хоол, бензин г.м)"
              placeholderTextColor="#94A3B8"
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} onPress={() => setIsCatModalOpen(false)}>
                <Text style={[styles.modalBtnText, { color: '#1E293B' }]}>Болих</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#1E293B' }]} onPress={handleAddCategory}>
                <Text style={styles.modalBtnText}>Нэмэх</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* МОДАЛЬ 2: ЗАРЛАГА НЭМЭХ */}
      <Modal visible={isExpenseModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlayShadow}>
          <View style={styles.bottomModalContent}>
            <View style={styles.modalTopRow}>
              <Text style={styles.bottomModalTitle}>Зарлага нэмэх</Text>
              <TouchableOpacity onPress={() => setIsExpenseModalOpen(false)}>
                <Text style={styles.closeModalX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Зарлагын утга (Тайлбар)</Text>
            <TextInput 
              style={styles.bottomModalInput} 
              placeholder="Жишээ нь: Үдийн хоол, АТМ татсан..." 
              placeholderTextColor="#94A3B8" 
              value={expenseTitle}
              onChangeText={setExpenseTitle}
            />

            <Text style={styles.inputLabel}>Дүн</Text>
            <TextInput
              style={styles.bottomModalInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />

            <Text style={styles.inputLabel}>Сонгох Төрөл (Зөвхөн чиний нэмсэн ангиллууд)</Text>
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
              <Text style={{ color: selectedCategory ? '#0F172A' : '#94A3B8' }}>
                {selectedCategory || 'Ангилал сонгох'}
              </Text>
              <Text style={{ color: '#64748B' }}>▼</Text>
            </TouchableOpacity>

            {/* ТӨРӨЛ СОНГОХ DROPDOWN */}
            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {expenseCategories.length === 0 ? (
                  <Text style={styles.noDataText}>Чи одоогоор ямар нэг төрөл нэмээгүй байна. Дээд талын "🏷️ Төрөл" товчоор нэмээрэй.</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled={true}>
                    {expenseCategories.map((cat: string, idx: number) => (
                      <TouchableOpacity key={idx} style={styles.dropdownItem} onPress={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}>
                        <Text style={styles.dropdownItemText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            <Text style={styles.inputLabel}>Данс</Text>
            <View style={[styles.dropdownTrigger, { opacity: 0.6 }]}>
              <Text style={{ color: '#94A3B8' }}>Үндсэн данс</Text>
              <Text style={{ color: '#64748B' }}>▼</Text>
            </View>

            <TouchableOpacity style={[styles.mainSubmitBtn, { backgroundColor: '#EF4444' }]} onPress={handleAddExpense}>
              <Text style={styles.mainSubmitBtnText}>Нэмэх</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuTouch: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  orlogoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, marginBottom: 24 },
  orlogoMainTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  orlogoSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  orlogoTagBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  orlogoTagBtnText: { color: '#0F172A', fontWeight: '600', fontSize: 14 },
  orlogoAddBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  orlogoAddBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, minHeight: 320, justifyContent: 'flex-start' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 60 },
  emptyCenter: { alignItems: 'center', justifyContent: 'center', opacity: 0.2 },
  databaseIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  orlogoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12, alignSelf: 'flex-start' },
  chartWrapper: { justifyContent: 'center', alignItems: 'center', width: '100%' },
  orlogoHistoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', width: '100%' },
  historyName: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  historyCategory: { fontSize: 11, color: '#64748B', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 2, overflow: 'hidden' },
  historyDate: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  historyAmount: { fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 20, textAlign: 'center' },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 20, color: '#0F172A' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 0.48, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  modalOverlayShadow: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  bottomModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  bottomModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  closeModalX: { fontSize: 20, color: '#64748B', fontWeight: 'bold' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 6, marginTop: 12 },
  bottomModalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0F172A', marginBottom: 4 },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14 },
  dropdownMenu: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginTop: 6, maxHeight: 160, overflow: 'hidden', zIndex: 1000 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: '#334155' },
  noDataText: { padding: 14, color: '#94A3B8', fontSize: 13, textAlign: 'center' },
  mainSubmitBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  mainSubmitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});