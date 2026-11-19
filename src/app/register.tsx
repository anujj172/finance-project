import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Алдаа', 'Бүх талбарыг бөглөнө үү!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Алдаа', 'Нууц үг зөрж байна!');
      return;
    }

    // Амжилттай бүртгэгдсэн мэдэгдэл гаргаад Login (index) рүү буцна
    Alert.alert('Амжилттай', 'Амжилттай бүртгэгдлээ!', [
      { text: 'ОК', onPress: () => router.replace('/') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Бүртгүүлэх</Text>
        <Text style={styles.subtitle}>Шинэ бүртгэл үүсгэж эхэлцгээе</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Хэрэглэгчийн нэр</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#A0AEC0"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Нууц үг</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Нууц үг давтах</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Бүртгүүлэх</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Аль хэдийн бүртгэлтэй юу? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Нэвтрэх</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', maxWidth: 450, width: '100%', alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0F172A' },
  button: { backgroundColor: '#111827', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748B', fontSize: 14 },
  linkText: { color: '#0F172A', fontSize: 14, fontWeight: 'bold' },
});