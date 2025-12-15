import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Pressable, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/app/providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await login({ email: email.trim(), password, rememberMe: true });
      
      if (result.ok) {
        // AuthProvider sẽ tự động redirect về trang chủ
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>      
        <View style={styles.headerTop}>
          <Image source={require('@/assets/images/login.png')} style={styles.headerGraphic} resizeMode="cover" />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#bdbdbd"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Mật khẩu" 
            placeholderTextColor="#bdbdbd" 
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            editable={!isLoading}
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/forgotpassword')} disabled={isLoading}>
            <Text style={styles.linkText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <FontAwesome name="google" size={18} color="#DB4437" style={{ marginRight: 8 }} />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <FontAwesome name="facebook" size={18} color="#1877F2" style={{ marginRight: 8 }} />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.footerText, styles.signUpLink]}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EDE4', alignItems: 'center' },
  headerTop: { width: '100%', height: 260, alignItems: 'center', justifyContent: 'center' },
  headerGraphic: { width: '100%', height: 360, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  card: { width: '88%', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: -60, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 6 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12, color: '#1E1E2D' },
  input: { width: '100%', height: 44, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 12, paddingHorizontal: 8, color: '#222' },
  primaryButton: { width: '100%', height: 48, backgroundColor: '#6C7AE0', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  linkText: { marginTop: 8, color: '#7C7C9A' },
  errorText: { color: '#E74C3C', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  socialText: { color: '#444' },
  footerRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  footerText: { color: '#9A9AB0' },
  signUpLink: { color: '#6C7AE0', fontWeight: '600' },
});
