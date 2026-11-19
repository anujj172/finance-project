import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinance, Loan, LoanSchedule } from '../hooks/useFinance';

export default function LoanScreen() {
  const router = useRouter();
  const { loans, addLoan, markPaymentAsPaid } = useFinance();

  // Модаль стейтүүд
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Формын стейтүүд
  const [title, setTitle] = useState('Хэрэглээний зээл');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('12');
  const [startDate, setStartDate] = useState('2026-05-17');
  const [desc, setDesc] = useState('');

  // 1. Сар бүрийн төлбөр болон хуваарь тооцоолох функц
  const calculateLoan = () => {
    const P = parseFloat(amount); // Үндсэн зээл
    const annualRate = parseFloat(rate) / 100;
    const r = annualRate / 12; // Сарын хүү
    const n = parseInt(duration); // Хугацаа

    if (!P || !r || !n) {
      Alert.alert("Алдаа", "Мэдээллээ бүрэн оруулна уу");
      return;
    }

    // Сар бүр төлөх дүн (PMT formula)
    const monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    // Хуваарь үүсгэх
    const schedule: LoanSchedule[] = [];
    for (let i = 1; i <= n; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      schedule.push({
        month: i,
        date: date.toISOString().split('T')[0],
        amount: monthlyPayment,
        isPaid: false,
      });
    }

    const newLoan: Loan = {
      id: Date.now().toString(),
      title,
      totalAmount: P,
      interestRate: parseFloat(rate),
      duration: n,
      startDate,
      description: desc,
      remainingAmount: P,
      monthlyPayment: monthlyPayment,
      schedule,
    };

    addLoan(newLoan);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount(''); setRate(''); setDesc('');
  };

  // Нийт тооцооллууд
  const totalLoanBalance = loans.reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalMonthlyPayment = loans.reduce((sum, l) => sum + l.monthlyPayment, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/dashboard')}><Text style={styles.headerMenu}>☰</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Зээлийн удирдлага</Text>
        <View style={styles.avatar}><Text style={styles.avatarText}>АН</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.mainTitle}>Зээл</Text>
            <Text style={styles.subtitle}>Нийт {loans.length} идэвхтэй зээл</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalOpen(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Нийт үлдэгдэл</Text>
            <Text style={styles.summaryValue}>{totalLoanBalance.toLocaleString()}₮</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#F8FAFC' }]}>
            <Text style={[styles.summaryLabel, { color: '#64748B' }]}>Сарын төлбөр</Text>
            <Text style={[styles.summaryValue, { color: '#0F172A' }]}>{totalMonthlyPayment.toLocaleString()}₮</Text>
          </View>
        </View>

        {/* LOAN CARDS */}
        {loans.map((loan) => (
          <View key={loan.id} style={styles.loanCard}>
            <View style={styles.loanCardHeader}>
              <View>
                <Text style={styles.loanCardTitle}>{loan.title}</Text>
                <Text style={styles.loanCardDate}>Эхэлсэн: {loan.startDate}</Text>
              </View>
              <Text style={styles.moreBtn}>•••</Text>
            </View>

            <View style={styles.loanDetailRow}>
              <View>
                <Text style={styles.detailLabel}>Үлдэгдэл дүн</Text>
                <Text style={styles.detailValue}>{loan.remainingAmount.toLocaleString()}₮</Text>
              </View>
              <View style={styles.rateBadge}>
                <Text style={styles.rateText}>{loan.interestRate}% хүү</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Төлөлтийн явц</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100}%` }]} />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.scheduleBtn} 
              onPress={() => { setSelectedLoan(loan); setIsScheduleModalOpen(true); }}
            >
              <Text style={styles.scheduleBtnText}>📅 Хуваарь</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* MODAL: ADD LOAN */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Зээл нэмэх</Text>
                <TouchableOpacity onPress={() => setIsAddModalOpen(false)}><Text style={{fontSize: 20}}>✕</Text></TouchableOpacity>
             </View>
             
             <Text style={styles.inputLabel}>Нийт зээл</Text>
             <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0₮" />

             <Text style={styles.inputLabel}>Хүүгийн хувь (%)</Text>
             <TextInput style={styles.input} keyboardType="numeric" value={rate} onChangeText={setRate} placeholder="0" />

             <Text style={styles.inputLabel}>Хугацаа (сар)</Text>
             <TextInput style={styles.input} keyboardType="numeric" value={duration} onChangeText={setDuration} />

             <Text style={styles.inputLabel}>Эхлэх огноо</Text>
             <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />

             <Text style={styles.inputLabel}>Тайлбар</Text>
             <TextInput style={styles.input} value={desc} onChangeText={setDesc} placeholder="Зээлийн зориулалт..." />

             <TouchableOpacity style={styles.submitBtn} onPress={calculateLoan}>
                <Text style={styles.submitBtnText}>Нэмэх</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: SCHEDULE */}
      <Modal visible={isScheduleModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.scheduleModalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Төлбөрийн хуваарь</Text>
                <TouchableOpacity onPress={() => setIsScheduleModalOpen(false)}><Text style={{fontSize: 20}}>✕</Text></TouchableOpacity>
             </View>

             <ScrollView>
               {selectedLoan?.schedule.map((item, index) => (
                 <View key={index} style={styles.scheduleItem}>
                    <Text style={styles.scheduleMonth}>{index + 1}</Text>
                    <View style={{flex: 1, marginLeft: 15}}>
                       <Text style={styles.scheduleDate}>{item.date}</Text>
                       <Text style={styles.scheduleAmount}>{item.amount.toLocaleString()}₮</Text>
                    </View>
                    {item.isPaid ? (
                      <Text style={{color: '#00A88F', fontWeight: 'bold'}}>✓ Төлөгдсөн</Text>
                    ) : (
                      <TouchableOpacity 
                        style={styles.payBtn} 
                        onPress={() => markPaymentAsPaid(selectedLoan.id, index)}
                      >
                        <Text style={styles.payBtnText}>Төлсөн гэж тэмдэглэх</Text>
                      </TouchableOpacity>
                    )}
                 </View>
               ))}
             </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  headerMenu: { fontSize: 24, color: '#3B82F6' },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  scrollContent: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainTitle: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#64748B', fontSize: 14 },
  addButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#34D399', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFF', fontSize: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  summaryCard: { flex: 0.48, backgroundColor: '#1E293B', padding: 16, borderRadius: 16 },
  summaryLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 8 },
  summaryValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  loanCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  loanCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  loanCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  loanCardDate: { fontSize: 12, color: '#94A3B8' },
  moreBtn: { color: '#CBD5E1', fontSize: 18 },
  loanDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  detailLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  detailValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  rateBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  rateText: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  progressSection: { marginBottom: 20 },
  progressLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#34D399' },
  scheduleBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  scheduleBtnText: { fontWeight: '600', color: '#1E293B' },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  addModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12 },
  submitBtn: { backgroundColor: '#0F172A', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold' },
  
  scheduleModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: '90%' },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  scheduleMonth: { fontSize: 16, color: '#94A3B8', width: 25 },
  scheduleDate: { fontSize: 14, fontWeight: '600' },
  scheduleAmount: { fontSize: 13, color: '#64748B' },
  payBtn: { backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  payBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' }
});