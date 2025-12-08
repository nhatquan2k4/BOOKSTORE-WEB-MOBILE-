import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/src/services/authService';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    const trimmedToken = token.trim();
    
    if (!trimmedToken) {
      setError('Vui lòng nhập mã xác thực');
      return;
    }

    // Validate token format (ít nhất 20 ký tự, thường 32-50 ký tự)
    if (trimmedToken.length < 20) {
      setError('Mã xác thực quá ngắn. Vui lòng copy toàn bộ mã từ email.');
      return;
    }

    if (trimmedToken.length > 200) {
      setError('Mã xác thực quá dài. Vui lòng kiểm tra lại.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.verifyEmail({ token: trimmedToken });
      
      if (result.ok) {
        Alert.alert('Thành công', 'Xác thực tài khoản thành công! Vui lòng đăng nhập.', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        // Hiển thị lỗi chi tiết từ backend
        const errorMsg = result.error || 'Mã xác thực không hợp lệ hoặc đã hết hạn';
        setError(errorMsg);
        
        // Nếu token hết hạn, gợi ý gửi lại
        if (errorMsg.toLowerCase().includes('hết hạn') || errorMsg.toLowerCase().includes('expired')) {
          Alert.alert(
            'Mã đã hết hạn',
            'Mã xác thực có thể đã hết hạn. Bạn có muốn gửi lại mã mới không?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Gửi lại', onPress: handleResend }
            ]
          );
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Không tìm thấy email. Vui lòng quay lại và đăng ký lại.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.resendVerificationEmail({ email });
      
      if (result.ok) {
        Alert.alert('Thành công', 'Mã xác thực mới đã được gửi tới email của bạn');
      } else {
        setError(result.error || 'Không thể gửi lại mã xác thực');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi gửi lại mã');
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
        <Text style={styles.title}>Xác thực tài khoản</Text>
        <Text style={styles.subtitle}>Dán mã xác thực từ email (khoảng 40-50 ký tự)</Text>
        {email ? <Text style={styles.emailText}>{email}</Text> : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.tokenInput}
          value={token}
          onChangeText={(text) => {
            // Loại bỏ khoảng trắng thừa ở đầu/cuối khi người dùng paste
            setToken(text.trim());
            setError('');
          }}
          placeholder="Nhập hoặc dán mã xác thực từ email"
          placeholderTextColor="#ccc"
          editable={!isLoading}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        {token.length > 0 && (
          <Text style={styles.tokenLength}>
            Độ dài: {token.length} ký tự
          </Text>
        )}

        <TouchableOpacity 
          style={[styles.verifyBtn, (!token.trim() || isLoading) && { opacity: 0.6 }]} 
          onPress={handleVerify} 
          disabled={!token.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={isLoading}>
          <Text style={styles.resend}>Gửi lại mã</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#F6F5FF', paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 40, color: '#1E1E2D' },
  subtitle: { fontSize: 14, color: '#7A7A8F', textAlign: 'center', marginTop: 10, marginBottom: 8 },
  emailText: { fontSize: 13, color: '#6C7AE0', fontWeight: '600', marginBottom: 16 },
  tokenInput: { 
    width: '100%', 
    minHeight: 90, 
    maxHeight: 140,
    borderRadius: 12, 
    backgroundColor: '#fff', 
    paddingHorizontal: 14, 
    paddingVertical: 14,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'monospace',
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 6, 
    elevation: 3 
  },
  tokenLength: { 
    fontSize: 12, 
    color: '#7A7A8F', 
    marginTop: 6, 
    alignSelf: 'flex-end' 
  },
  verifyBtn: { marginTop: 20, width: '80%', height: 48, backgroundColor: '#6C7AE0', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  verifyText: { color: '#fff', fontWeight: '600' },
  resend: { marginTop: 16, color: '#6C7AE0' },
  backBtn: { position: 'absolute', left: 12, zIndex: 20, padding: 6, borderRadius: 18 },
  errorText: { color: '#E74C3C', fontSize: 13, marginTop: 12, textAlign: 'center' },
});
