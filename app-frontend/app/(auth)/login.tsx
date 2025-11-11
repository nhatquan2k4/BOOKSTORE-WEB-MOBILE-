import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { AuthForm } from '../../src/components/AuthForm';
import { LoginCredentials } from '../../src/api/auth';

/**
 * Login Screen
 * Uses AuthForm component for email/password input and validation
 * Navigates to home on successful login (handled by AuthProvider)
 */
export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (data: LoginCredentials) => {
    await login(data);
    // Navigation is handled automatically by AuthProvider
  };

  return (
    <View style={styles.container}>
      <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="../register" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Demo hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>� Try: error@test.com to see error handling</Text>
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
