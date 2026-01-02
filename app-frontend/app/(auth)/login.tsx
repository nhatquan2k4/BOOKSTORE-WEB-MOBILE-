import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Pressable, Keyboard, Animated } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Animation values for floating labels
  const emailLabelPosition = useRef(new Animated.Value(email ? 1 : 0)).current;
  const passwordLabelPosition = useRef(new Animated.Value(password ? 1 : 0)).current;
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animate label up/down
  const animateLabel = (animation: Animated.Value, toValue: number) => {
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleEmailFocus = () => {
    setEmailFocused(true);
    animateLabel(emailLabelPosition, 1);
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
    if (!email) {
      animateLabel(emailLabelPosition, 0);
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    animateLabel(passwordLabelPosition, 1);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    if (!password) {
      animateLabel(passwordLabelPosition, 0);
    }
  };

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
      const result = await login({ email: email.trim(), password, rememberMe });
      
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

          <View style={styles.errorContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Email Input with Floating Label */}
          <View style={styles.inputContainer}>
            <Animated.Text 
              style={[
                styles.floatingLabel,
                {
                  top: emailLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -8],
                  }),
                  fontSize: emailLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 12],
                  }),
                  color: emailFocused ? '#6C7AE0' : '#bdbdbd',
                },
              ]}
            >
              Email
            </Animated.Text>
            <TextInput 
              style={[styles.input, emailFocused && styles.inputFocused]} 
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              onFocus={handleEmailFocus}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {/* Password Input with Floating Label */}
          <View style={styles.inputContainer}>
            <Animated.Text 
              style={[
                styles.floatingLabel,
                {
                  top: passwordLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -8],
                  }),
                  fontSize: passwordLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 12],
                  }),
                  color: passwordFocused ? '#6C7AE0' : '#bdbdbd',
                },
              ]}
            >
              Mật khẩu
            </Animated.Text>
            <View style={styles.passwordWrapper}>
              <TextInput 
                style={[styles.input, styles.passwordInput, passwordFocused && styles.inputFocused]} 
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                editable={!isLoading}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rememberForgotRow}>
            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={isLoading}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.rememberMeText}>Nhớ mật khẩu</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/forgotpassword')} disabled={isLoading}>
              <Text style={styles.linkText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

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
  title: { fontSize: 30, fontWeight: '700', marginBottom: 12, color: '#1E1E2D' },
  errorContainer: { width: '100%', minHeight: 28, marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#E74C3C', fontSize: 13, textAlign: 'center' },
  inputContainer: { width: '100%', marginBottom: 20, position: 'relative' },
  floatingLabel: { 
    position: 'absolute', 
    left: 8, 
    backgroundColor: '#fff', 
    paddingHorizontal: 4, 
    fontWeight: '500',
    zIndex: 10,
    pointerEvents: 'none',
  },
  input: { 
    width: '100%', 
    height: 44, 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#eee', 
    paddingHorizontal: 8, 
    paddingTop: 18,
    paddingBottom: 4,
    color: '#222',
    fontSize: 15,
  },
  inputFocused: { borderBottomColor: '#6C7AE0' },
  passwordWrapper: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeButton: { position: 'absolute', right: 8, padding: 8 },
  passwordContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 12 },
  rememberForgotRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  rememberMeContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkboxChecked: { backgroundColor: '#6C7AE0', borderColor: '#6C7AE0' },
  rememberMeText: { fontSize: 14, color: '#7C7C9A' },
  primaryButton: { width: '100%', height: 48, backgroundColor: '#6C7AE0', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  linkText: { marginTop: 8, color: '#7C7C9A' },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  socialText: { color: '#444' },
  footerRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  footerText: { color: '#9A9AB0' },
  signUpLink: { color: '#6C7AE0', fontWeight: '600' },
});
