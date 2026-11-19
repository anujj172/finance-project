import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinance } from '../hooks/useFinance'; // Бэлдсэн глобал хуукаа импортлох

export default function IncomeScreen() {
  const router = useRouter();

  // Глобал стейтээс дата болон функцуудыг авах
  const { incomes, incomeCategories, addIncome, addCategory, chartColors } = useFinance();

  // Модаль удирдах стейтүүд
  const [isCatModalOpen, setIsCatModalOpen] = useState(false); // Төрөл нэмэх
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false); // Орлого нэмэх
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Төрөл сонгох

  // Оруулах талбарын стейтүүд
  const [newCatName, setNewCatName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Навигацийн дээд хэсэгт ☰ дарахад dashboard руу очих
  const handleGoBack = () => {
    router.replace('/dashboard');
  };

  // 1. Шинэ төрөл/ангилал нэмэх функц (Глобал руу хадгална)
  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Алдаа', 'Төрлийн нэрийг оруулна уу!');
      return;
    }
    addCategory(newCatName.trim());
    setNewCatName('');
    setIsCatModalOpen(false);
  };

  // 2. Шинэ орлого нэмэх функц (Глобал руу хадгална)
  const handleAddIncome = () => {
    const amountNum = parseFloat(incomeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Алдаа', 'Орлогын дүнг зөв оруулна уу!');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Алдаа', 'Төрөл сонгоно уу!');
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    // Глобал бааз руу орлого нэмэх
    addIncome({
      id: Date.now().toString(),
      title: selectedCategory,
      amount: amountNum,
      date: formattedDate,
    });

    setIncomeAmount('');
    setSelectedCategory('');
    setIsIncomeModalOpen(false);
  };

  // --- ГРАФИКИЙН ЗӨВ ЛОГИК ТОOЦООЛОЛ ---
  const totalIncomeAmount = incomes.reduce((sum, item) => sum + item.amount, 0);

  // Зөвхөн орлого нь 0-ээс их, бодитоор гүйлгээ хийгдсэн төрлүүдийг шүүж авах
  const activeCategories = incomeCategories.filter(cat => {
    const catTotal = incomes.filter(item => item.title === cat).reduce((sum, item) => sum + item.amount, 0);
    return catTotal > 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ХЭСЭГ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.menuTouch}>
          <Text style={styles.headerMenu}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Орлогын удирдлага</Text>
        <View style={styles.avatar}><Text style={styles.avatarText}>АН</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ТИТЛЬ БОЛОН ТОВЧЛУУРУУД */}
        <View style={styles.orlogoHeaderRow}>
          <View>
            <Text style={styles.orlogoMainTitle}>Орлого</Text>
            <Text style={styles.orlogoSubtitle}>2026 оны 3-р сар</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.orlogoTagBtn} onPress={() => setIsCatModalOpen(true)}>
              <Text style={styles.orlogoTagBtnText}>🏷️ Төрөл</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orlogoAddBtn} onPress={() => setIsIncomeModalOpen(true)}>
              <Text style={styles.orlogoAddBtnText}>+ Нэмэх</Text>
            </TouchableOpacity>
          </View>
        </View>

        {incomes.length === 0 ? (
          /* ХООСОН ҮЕД ХАРАГДАХ ДИЗАЙН */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Орлогын жагсаалт</Text>
            <View style={styles.emptyCenter}>
              <Text style={styles.databaseIcon}>🛢️</Text>
              <Text style={styles.emptyText}>Орлогын түүх хоосон байна</Text>
            </View>
          </View>
        ) : (
          /* ДАТА ОРСОН ҮЕД ХАРАГДАХ ДИЗАЙН */
          <View>
            {/* Орлогын бүтэц (Pie Chart) */}
            <View style={styles.orlogoCard}>
              <Text style={styles.cardTitle}>Орлогын бүтэц</Text>
              <View style={styles.chartWrapper}>
                <View style={styles.mockPieChart}>
                  {activeCategories.map((cat, idx) => {
                    const catTotal = incomes.filter(item => item.title === cat).reduce((sum, item) => sum + item.amount, 0);
                    const percentage = totalIncomeAmount > 0 ? (catTotal / totalIncomeAmount) * 100 : 0;
                    return (
                      <View 
                        key={idx} 
                        style={{ 
                          flex: percentage, 
                          backgroundColor: chartColors[idx % chartColors.length] // Төрөл бүрт өөр өнгө
                        }} 
                      />
                    );
                  })}
                </View>
                <View style={styles.chartLegend}>
                  {activeCategories.map((cat, idx) => {
                    const catTotal = incomes.filter(item => item.title === cat).reduce((sum, item) => sum + item.amount, 0);
                    return (
                      <View key={idx} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: chartColors[idx % chartColors.length] }]} />
                        <Text style={styles.legendText}>{cat} ({catTotal.toLocaleString()}₮)</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Орлогын түүх */}
            <View style={styles.orlogoCard}>
              <Text style={styles.cardTitle}>Орлогын түүх</Text>
              {incomes.map((item) => (
                <View key={item.id} style={styles.orlogoHistoryItem}>
                  <View>
                    <Text style={styles.historyName}>{item.title}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyAmount}>+{item.amount.toLocaleString()}₮</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* МОДАЛЬ 1: ШИНЭ ТӨРӨЛ НЭМЭХ */}
      <Modal visible={isCatModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Шинэ төрөл нэмэх</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Төрлийн нэр"
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

      {/* МОДАЛЬ 2: ОРЛОГО НЭМЭХ */}
      <Modal visible={isIncomeModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlayShadow}>
          <View style={styles.bottomModalContent}>
            <View style={styles.modalTopRow}>
              <Text style={styles.bottomModalTitle}>Орлого нэмэх</Text>
              <TouchableOpacity onPress={() => setIsIncomeModalOpen(false)}>
                <Text style={styles.closeModalX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Дүн</Text>
            <TextInput
              style={styles.bottomModalInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
              value={incomeAmount}
              onChangeText={setIncomeAmount}
            />

            <Text style={styles.inputLabel}>Төрөл</Text>
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
              <Text style={{ color: selectedCategory ? '#0F172A' : '#94A3B8' }}>
                {selectedCategory || 'Сонгох'}
              </Text>
              <Text style={{ color: '#64748B' }}>▼</Text>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {incomeCategories.length === 0 ? (
                  <Text style={styles.noDataText}>Төрөл бүртгэгдээгүй байна. Эхлээд "Төрөл" товчоор нэмнэ үү.</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 160 }}>
                    {incomeCategories.map((cat, idx) => (
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
              <Text style={{ color: '#94A3B8' }}>Үндсэн данс (Сонгох)</Text>
              <Text style={{ color: '#64748B' }}>▼</Text>
            </View>

            <Text style={styles.inputLabel}>Тайлбар</Text>
            <TextInput style={styles.bottomModalInput} placeholder="Тайлбар бичих..." placeholderTextColor="#94A3B8" />

            <TouchableOpacity style={styles.mainSubmitBtn} onPress={handleAddIncome}>
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
  headerMenu: { fontSize: 24, color: '#0F172A', fontWeight: 'bold' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },

  orlogoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, marginBottom: 24 },
  orlogoMainTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  orlogoSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  orlogoTagBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  orlogoTagBtnText: { color: '#0F172A', fontWeight: '600', fontSize: 14 },
  orlogoAddBtn: { backgroundColor: '#00A88F', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  orlogoAddBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  emptyContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, minHeight: 320, justifyContent: 'flex-start' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 60 },
  emptyCenter: { alignItems: 'center', justifyContent: 'center', opacity: 0.2 },
  databaseIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#0F172A', fontWeight: '600' },

  orlogoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  chartWrapper: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  mockPieChart: { width: 110, height: 110, borderRadius: 55, overflow: 'hidden', flexDirection: 'row', backgroundColor: '#F1F5F9' },
  chartLegend: { flex: 1, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: '#334155', fontWeight: '500' },

  orlogoHistoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  historyName: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  historyDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  historyAmount: { fontSize: 15, fontWeight: 'bold', color: '#00A88F' },

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
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 8, marginTop: 14 },
  bottomModalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0F172A' },
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14 },
  dropdownMenu: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginTop: 6, maxHeight: 160, overflow: 'hidden' },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: '#334155' },
  noDataText: { padding: 14, color: '#94A3B8', fontSize: 13, textAlign: 'center' },
  mainSubmitBtn: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 28 },
  mainSubmitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});