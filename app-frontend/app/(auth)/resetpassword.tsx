import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/src/services/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Token và email nên được truyền từ email link hoặc forgot password screen
  const resetToken = (params.token as string) || '';
  const email = (params.email as string) || '';

  const handleReset = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!resetToken || !email) {
      setError('Thiếu thông tin xác thực. Vui lòng thử lại từ email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.resetPassword({
        email,
        token: resetToken,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      if (result.ok) {
        Alert.alert('Thành công', 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        setError(result.error || 'Không thể đặt lại mật khẩu');
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
        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput 
          style={styles.input} 
          placeholder="Mật khẩu mới" 
          placeholderTextColor="#bbb" 
          secureTextEntry
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setError('');
          }}
          editable={!isLoading}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Xác nhận mật khẩu" 
          placeholderTextColor="#bbb" 
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError('');
          }}
          editable={!isLoading}
          onSubmitEditing={handleReset}
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && { opacity: 0.6 }]} 
          onPress={handleReset}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#F6F5FF' },
  title: { fontSize: 24, fontWeight: '700', marginTop: 40 },
  input: { width: '100%', height: 48, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, marginTop: 12 },
  button: { marginTop: 20, width: '100%', height: 48, backgroundColor: '#6C7AE0', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  backBtn: { position: 'absolute', left: 12, zIndex: 20, padding: 6, borderRadius: 18 },
  errorText: { color: '#E74C3C', fontSize: 13, marginTop: 12, textAlign: 'center', width: '100%' },
});
