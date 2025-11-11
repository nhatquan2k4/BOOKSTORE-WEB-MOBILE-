import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { AuthForm } from '../../src/components/AuthForm';
import { RegisterCredentials } from '../../src/api/auth';

/**
 * Register Screen
 * Uses AuthForm component for name/email/password input and validation
 * Navigates to home on successful registration (handled by AuthProvider)
 */
export default function RegisterScreen() {
  const { register, isLoading } = useAuth();

  const handleRegister = async (data: RegisterCredentials) => {
    await register(data);
    // Navigation is handled automatically by AuthProvider
  };

  return (
    <View style={styles.container}>
      <AuthForm mode="register" onSubmit={handleRegister} isLoading={isLoading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="../login" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Demo hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>💡 Try: taken@test.com to see error handling</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    padding: 16,
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  hintText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
});
