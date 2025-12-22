import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Keyboard, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/src/services/authService';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Show/hide password states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu cũ');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      console.log('🔐 Change password result:', result);

      if (result.ok) {
        Alert.alert(
          'Thành công', 
          result.message || 'Đổi mật khẩu thành công!', 
          [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            }
          ]
        );
      } else {
        // Display error message from backend
        const errorMsg = result.error || result.message || 'Không thể đổi mật khẩu';
        console.log('❌ Change password failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ Change password exception:', err);
      const errorMsg = err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Old Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordInput}>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập mật khẩu hiện tại" 
                placeholderTextColor="#bbb" 
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={(text) => {
                  setOldPassword(text);
                  setError('');
                }}
                editable={!isLoading}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <Ionicons 
                  name={showOldPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordInput}>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập mật khẩu mới" 
                placeholderTextColor="#bbb" 
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError('');
                }}
                editable={!isLoading}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Ít nhất 6 ký tự</Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordInput}>
              <TextInput 
                style={styles.input} 
                placeholder="Nhập lại mật khẩu mới" 
                placeholderTextColor="#bbb" 
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                editable={!isLoading}
                autoCapitalize="none"
                onSubmitEditing={handleChangePassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Đổi mật khẩu</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Gợi ý bảo mật:</Text>
            <Text style={styles.tipItem}>• Sử dụng mật khẩu mạnh với chữ, số và ký tự đặc biệt</Text>
            <Text style={styles.tipItem}>• Không sử dụng mật khẩu giống với các tài khoản khác</Text>
            <Text style={styles.tipItem}>• Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</Text>
          </View>
        </View>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0ede4' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f0ede4',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordInput: {
    position: 'relative',
  },
  input: { 
    width: '100%', 
    height: 50, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  button: { 
    marginTop: 12, 
    width: '100%', 
    height: 52, 
    backgroundColor: '#d2b48c', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: { 
    color: '#E74C3C', 
    fontSize: 14, 
    marginBottom: 16, 
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
  },
  tipsContainer: {
    marginTop: 32,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
