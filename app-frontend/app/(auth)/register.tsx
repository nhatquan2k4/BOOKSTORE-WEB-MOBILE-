import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/app/providers/AuthProvider';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
      });

      if (result.ok) {
        // Chuyển sang màn hình verify và truyền email
        router.push({
          pathname: '/verify',
          params: { email: formData.email.trim() }
        });
      } else {
        setError(result.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Đăng ký</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput 
          style={styles.input} 
          placeholder="Họ tên" 
          placeholderTextColor="#bbb"
          value={formData.fullName}
          onChangeText={(text) => {
            setFormData({ ...formData, fullName: text });
            setError('');
          }}
          editable={!isLoading}
        />

        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#bbb" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => {
            setFormData({ ...formData, email: text });
            setError('');
          }}
          editable={!isLoading}
        />

        <TextInput 
          style={styles.input} 
          placeholder="Mật khẩu" 
          placeholderTextColor="#bbb" 
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => {
            setFormData({ ...formData, password: text });
            setError('');
          }}
          editable={!isLoading}
        />

        <TextInput 
          style={styles.input} 
          placeholder="Xác nhận mật khẩu" 
          placeholderTextColor="#bbb" 
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => {
            setFormData({ ...formData, confirmPassword: text });
            setError('');
          }}
          editable={!isLoading}
        />

        <TextInput 
          style={styles.input} 
          placeholder="Số điện thoại (tuỳ chọn)" 
          placeholderTextColor="#bbb" 
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(text) => {
            setFormData({ ...formData, phoneNumber: text });
            setError('');
          }}
          editable={!isLoading}
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && { opacity: 0.6 }]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Tạo tài khoản</Text>
          )}
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#F6F5FF' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 40 },
  input: { width: '100%', height: 48, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, marginTop: 12 },
  button: { marginTop: 20, width: '100%', height: 48, backgroundColor: '#6C7AE0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  backBtn: { position: 'absolute', left: 12, zIndex: 20, padding: 6, borderRadius: 18 },
  errorText: { color: '#E74C3C', fontSize: 13, marginTop: 12, textAlign: 'center', width: '100%' },
});
