import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>Nhập email của bạn để nhận mã đặt lại mật khẩu</Text>
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#bbb" keyboardType="email-address" />

        <TouchableOpacity style={styles.button} onPress={() => router.push('/verify')}>
          <Text style={styles.buttonText}>Gửi mã</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#F6F5FF' },
  title: { fontSize: 24, fontWeight: '700', marginTop: 40 },
  subtitle: { color: '#7A7A8F', marginTop: 8, textAlign: 'center' },
  input: { width: '100%', height: 48, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, marginTop: 12 },
  backBtn: { position: 'absolute', left: 12, zIndex: 20, padding: 6, borderRadius: 18 },
  button: { marginTop: 20, width: '100%', height: 48, backgroundColor: '#6C7AE0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
