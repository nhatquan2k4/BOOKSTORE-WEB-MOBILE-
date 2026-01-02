import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Keyboard, ActivityIndicator, Alert, Animated, ScrollView } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation values for floating labels
  const fullNameLabelPosition = useRef(new Animated.Value(formData.fullName ? 1 : 0)).current;
  const emailLabelPosition = useRef(new Animated.Value(formData.email ? 1 : 0)).current;
  const passwordLabelPosition = useRef(new Animated.Value(formData.password ? 1 : 0)).current;
  const confirmPasswordLabelPosition = useRef(new Animated.Value(formData.confirmPassword ? 1 : 0)).current;
  const phoneLabelPosition = useRef(new Animated.Value(formData.phoneNumber ? 1 : 0)).current;

  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Animate label up/down
  const animateLabel = (animation: Animated.Value, toValue: number) => {
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

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
      <ScrollView 
        style={{ flex: 1, backgroundColor: '#F0EDE4' }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
      > 
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

          <View style={styles.errorContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Full Name Input with Floating Label */}
          <View style={styles.inputContainer}>
            <Animated.Text 
              style={[
                styles.floatingLabel,
                {
                  top: fullNameLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -8],
                  }),
                  fontSize: fullNameLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 12],
                  }),
                  color: fullNameFocused ? '#6C7AE0' : '#bdbdbd',
                },
              ]}
            >
              Họ tên
            </Animated.Text>
            <TextInput 
              style={[styles.input, fullNameFocused && styles.inputFocused]} 
              value={formData.fullName}
              onChangeText={(text) => {
                setFormData({ ...formData, fullName: text });
                setError('');
              }}
              onFocus={() => {
                setFullNameFocused(true);
                animateLabel(fullNameLabelPosition, 1);
              }}
              onBlur={() => {
                setFullNameFocused(false);
                if (!formData.fullName) animateLabel(fullNameLabelPosition, 0);
              }}
              editable={!isLoading}
            />
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
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                setError('');
              }}
              onFocus={() => {
                setEmailFocused(true);
                animateLabel(emailLabelPosition, 1);
              }}
              onBlur={() => {
                setEmailFocused(false);
                if (!formData.email) animateLabel(emailLabelPosition, 0);
              }}
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
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  setError('');
                }}
                onFocus={() => {
                  setPasswordFocused(true);
                  animateLabel(passwordLabelPosition, 1);
                }}
                onBlur={() => {
                  setPasswordFocused(false);
                  if (!formData.password) animateLabel(passwordLabelPosition, 0);
                }}
                editable={!isLoading}
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

          {/* Confirm Password Input with Floating Label */}
          <View style={styles.inputContainer}>
            <Animated.Text 
              style={[
                styles.floatingLabel,
                {
                  top: confirmPasswordLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -8],
                  }),
                  fontSize: confirmPasswordLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 12],
                  }),
                  color: confirmPasswordFocused ? '#6C7AE0' : '#bdbdbd',
                },
              ]}
            >
              Xác nhận mật khẩu
            </Animated.Text>
            <View style={styles.passwordWrapper}>
              <TextInput 
                style={[styles.input, styles.passwordInput, confirmPasswordFocused && styles.inputFocused]} 
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  setError('');
                }}
                onFocus={() => {
                  setConfirmPasswordFocused(true);
                  animateLabel(confirmPasswordLabelPosition, 1);
                }}
                onBlur={() => {
                  setConfirmPasswordFocused(false);
                  if (!formData.confirmPassword) animateLabel(confirmPasswordLabelPosition, 0);
                }}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Input with Floating Label */}
          <View style={styles.inputContainer}>
            <Animated.Text 
              style={[
                styles.floatingLabel,
                {
                  top: phoneLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -8],
                  }),
                  fontSize: phoneLabelPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 12],
                  }),
                  color: phoneFocused ? '#6C7AE0' : '#bdbdbd',
                },
              ]}
            >
              Số điện thoại (tuỳ chọn)
            </Animated.Text>
            <TextInput 
              style={[styles.input, phoneFocused && styles.inputFocused]} 
              value={formData.phoneNumber}
              onChangeText={(text) => {
                setFormData({ ...formData, phoneNumber: text });
                setError('');
              }}
              onFocus={() => {
                setPhoneFocused(true);
                animateLabel(phoneLabelPosition, 1);
              }}
              onBlur={() => {
                setPhoneFocused(false);
                if (!formData.phoneNumber) animateLabel(phoneLabelPosition, 0);
              }}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tạo tài khoản</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.footerText, styles.loginLink]}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 40,
  },
  card: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 24, 
    marginTop: 80, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 6,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#1E1E2D',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7C7C9A',
    marginBottom: 16,
  },
  errorContainer: { 
    width: '100%', 
    minHeight: 28, 
    marginBottom: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  errorText: { 
    color: '#E74C3C', 
    fontSize: 13, 
    textAlign: 'center',
  },
  inputContainer: { 
    width: '100%', 
    marginBottom: 20, 
    position: 'relative',
  },
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
  inputFocused: { 
    borderBottomColor: '#6C7AE0',
  },
  passwordWrapper: { 
    width: '100%', 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  passwordInput: { 
    flex: 1,
  },
  eyeButton: { 
    position: 'absolute', 
    right: 8, 
    padding: 8,
  },
  button: { 
    marginTop: 8, 
    width: '100%', 
    height: 48, 
    backgroundColor: '#6C7AE0', 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: { 
    opacity: 0.6,
  },
  backBtn: { 
    position: 'absolute', 
    left: 16, 
    zIndex: 20, 
    padding: 8, 
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  footerRow: { 
    flexDirection: 'row', 
    marginTop: 20, 
    alignItems: 'center',
  },
  footerText: { 
    color: '#9A9AB0',
    fontSize: 14,
  },
  loginLink: { 
    color: '#6C7AE0', 
    fontWeight: '600',
  },
});
