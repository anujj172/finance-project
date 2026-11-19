import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 👈 Алдааг засахын тулд MaterialCommunityIcons-ийг нэмж импортлов
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

// Төрлүүдийн тодорхойлолт
interface SavingsAccount {
  id: string;
  name: string;
  type: string;
  interestType: string;
  balance: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  frequency: string;
  linkedAccount?: string;
}

export default function SavingsScreen() {
  const navigation = useNavigation();

  // Стейтүүд (Өгөгдөл хадгалах)
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  // Модаль удирдах стейтүүд
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Шинэ данс үүсгэх формны стейтүүд
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('Энгийн');
  const [interestType, setInterestType] = useState('Энгийн хүү');

  // Шинэ зорилго үүсгэх формны стейтүүд
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [frequency, setFrequency] = useState('Сар бүр');
  const [linkedAccount, setLinkedAccount] = useState('');

  // Тооцооллууд
  const totalSavings = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalGoalsCount = goals.length;

  // 1. Данс нэмэх функц
  const handleAddAccount = () => {
    if (!accName.trim()) return;
    
    const newAccount: SavingsAccount = {
      id: Date.now().toString(),
      name: accName,
      type: accType,
      interestType: interestType,
      balance: 0, // Анх үүсэхэд 0₮
    };

    setAccounts([...accounts, newAccount]);
    setAccName('');
    setIsAccModalOpen(false);
  };

  // 2. Зорилго нэмэх функц
  const handleAddGoal = () => {
    if (!goalName.trim() || !targetAmount) return;

    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: goalName,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: 0, // Анх үүсэхэд хуримтлал 0-ээс эхэлнэ
      targetDate: targetDate || 'Тодорхойгүй',
      frequency: frequency,
      linkedAccount: linkedAccount || undefined,
    };

    setGoals([...goals, newGoal]);
    setGoalName('');
    setTargetAmount('');
    setTargetDate('');
    setIsGoalModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ХЭСЭГ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuTouch}>
          <Ionicons name="menu-outline" size={26} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Хадгаламж</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>АН</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ДЭЭД ХЭСЭГ: Гарчиг болон Товчлуурууд */}
        <View style={topStyles.topRow}>
          <View>
            <Text style={styles.mainTitle}>Хадгаламж</Text>
            <Text style={styles.subTitle}>Хадгаламж болон зорилго удирдах</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setIsAccModalOpen(true)}>
              <Ionicons name="add-outline" size={16} color="#0F172A" />
              <Text style={styles.btnSecondaryText}>Данс нэмэх</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsGoalModalOpen(true)}>
              <Ionicons name="add-outline" size={16} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>Зорилго нэмэх</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ТОЙМ КАРТУУД (SUMMARY) */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Нийт хадгаламж</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={styles.summaryValue}>{totalSavings.toLocaleString()}₮</Text>
              {/* ✅ Энд MaterialCommunityIcons-ийг зөв ашигласнаар TypeScript алдаа арилсан */}
              <MaterialCommunityIcons name="piggy-bank-outline" size={24} color="#0F172A" style={styles.summaryIcon} />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Зорилгууд</Text>
            <View style={styles.summaryValueContainer}>
              <Text style={styles.summaryValue}>{totalGoalsCount}</Text>
              <Ionicons name="disc-outline" size={24} color="#94A3B8" style={styles.summaryIcon} />
            </View>
          </View>
        </View>

        {/* ДАНСУУД ЖАГСААЛТ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Дансууд</Text>
          {accounts.length === 0 ? (
            <Text style={styles.emptyText}>Мэдээлэл байхгүй</Text>
          ) : (
            accounts.map((acc) => (
              <View key={acc.id} style={styles.itemCard}>
                <View>
                  <Text style={styles.itemName}>{acc.name}</Text>
                  <Text style={styles.itemMeta}>{acc.type} • {acc.interestType}</Text>
                </View>
                <Text style={styles.itemAmount}>{acc.balance.toLocaleString()}₮</Text>
              </View>
            ))
          )}
        </View>

        {/* ЗОРИЛГУУД ЖАГСААЛТ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Зорилгууд</Text>
          {goals.length === 0 ? (
            <Text style={styles.emptyText}>Мэдээлэл байхгүй</Text>
          ) : (
            goals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) : 0;
              return (
                <View key={goal.id} style={styles.itemCardColumn}>
                  <View style={styles.goalTop}>
                    <Text style={styles.itemName}>{goal.name}</Text>
                    <Text style={styles.itemMeta}>Хугацаа: {goal.targetDate}</Text>
                  </View>
                  {/* Прогресс бар */}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
                  </View>
                  <View style={styles.goalBottom}>
                    <Text style={styles.itemMeta}>Хуримтлуулсан: {goal.currentAmount.toLocaleString()}₮</Text>
                    <Text style={styles.goalTarget}>Зорилт: {goal.targetAmount.toLocaleString()}₮</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* 1. ДАНС НЭМЭХ МОДАЛЬ ЦОНХ */}
      <Modal visible={isAccModalOpen} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Данс нэмэх</Text>
              <TouchableOpacity onPress={() => setIsAccModalOpen(false)}>
                <Ionicons name="close-outline" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Нэр</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Хадгаламжийн дансны нэр оруулна уу" 
              placeholderTextColor="#94A3B8"
              value={accName}
              onChangeText={setAccName}
            />

            <Text style={styles.inputLabel}>Хадгаламжийн төрөл</Text>
            <View style={styles.selectorFake}>
              <Text style={styles.selectorFakeText}>{accType}</Text>
              <Ionicons name="chevron-down-outline" size={18} color="#64748B" />
            </View>

            <Text style={styles.inputLabel}>Хүүгийн төрөл</Text>
            <View style={styles.selectorFake}>
              <Text style={styles.selectorFakeText}>{interestType}</Text>
              <Ionicons name="chevron-down-outline" size={18} color="#64748B" />
            </View>

            <TouchableOpacity style={styles.btnSubmit} onPress={handleAddAccount}>
              <Text style={styles.btnSubmitText}>Нэмэх</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. ЗОРИЛГО НЭМЭХ МОДАЛЬ ЦОНХ */}
      <Modal visible={isGoalModalOpen} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Зорилго нэмэх</Text>
              <TouchableOpacity onPress={() => setIsGoalModalOpen(false)}>
                <Ionicons name="close-outline" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Нэр</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Зорилгын нэр оруулна уу" 
              placeholderTextColor="#94A3B8"
              value={goalName}
              onChangeText={setGoalName}
            />

            <Text style={styles.inputLabel}>Зорилтот дүн</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0" 
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />

            <Text style={styles.inputLabel}>Зорилтот огноо</Text>
            <View style={styles.inputWithIconRow}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]} 
                placeholder="mm/dd/yyyy" 
                placeholderTextColor="#94A3B8"
                value={targetDate}
                onChangeText={setTargetDate}
              />
              <Ionicons name="calendar-outline" size={18} color="#64748B" style={styles.inputInsideIcon} />
            </View>

            <Text style={styles.inputLabel}>Давтамж</Text>
            <View style={styles.selectorFake}>
              <Text style={styles.selectorFakeText}>{frequency}</Text>
              <Ionicons name="chevron-down-outline" size={18} color="#64748B" />
            </View>

            <Text style={styles.inputLabel}>Дансууд</Text>
            <View style={styles.selectorFake}>
              <Text style={styles.selectorFakeText}>Сонгох (заавал биш)</Text>
              <Ionicons name="chevron-down-outline" size={18} color="#64748B" />
            </View>

            <TouchableOpacity style={styles.btnSubmit} onPress={handleAddGoal}>
              <Text style={styles.btnSubmitText}>Нэмэх</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// Дээд талын гарчиг, товчлуур хэсгийг уян хатан байлгах загвар
const topStyles = StyleSheet.create({
  topRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 20, 
    flexWrap: 'wrap',
    gap: 12 
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuTouch: { padding: 6, marginLeft: -6 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  subTitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  
  btnPrimary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  btnSecondary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
  btnSecondaryText: { color: '#0F172A', fontSize: 12, fontWeight: '600' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 16 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  summaryLabel: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  summaryValueContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  summaryIcon: { marginLeft: 8 },

  sectionContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 20 },

  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemCardColumn: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  goalBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  itemMeta: { fontSize: 12, color: '#94A3B8' },
  itemAmount: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  goalTarget: { fontSize: 12, fontWeight: '600', color: '#0F172A' },

  progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#00A88F', borderRadius: 3 }, // Ногоон цэнхэр өнгөөр солив

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: screenWidth - 48, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A', marginBottom: 4 },
  inputWithIconRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingRight: 12, marginBottom: 4 },
  inputInsideIcon: { marginLeft: 8 },
  selectorFake: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFFFFF', marginBottom: 4 },
  selectorFakeText: { fontSize: 14, color: '#0F172A' },
  btnSubmit: { backgroundColor: '#1E293B', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 24 },
  btnSubmitText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }
});