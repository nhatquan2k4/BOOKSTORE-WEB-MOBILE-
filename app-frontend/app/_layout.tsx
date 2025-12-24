import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, LogBox } from 'react-native';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '@/app/providers/CartProvider';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { NotificationProvider } from '@/app/providers/NotificationProvider';

// Ignore network and API error logs in LogBox
LogBox.ignoreLogs([
  'Request failed with status code',
  'Network request failed',
  'AxiosError',
  'API Error',
  '[API Response Error]',
]);

// Global error handler to prevent red screen
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Log to console but don't show red screen for API errors
    if (error?.message?.includes('Request failed') || 
        error?.message?.includes('Network request failed') ||
        error?.message?.includes('AxiosError')) {
      console.log('[Global Error Handler] API Error caught and suppressed:', error.message);
      return;
    }
    // For other errors, use original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
};

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuth();

  // Setup global error handlers on mount
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  console.log('[Layout] isLoading:', isLoading);

  // Show loading screen while checking auth
  if (isLoading) {
    console.log('[Layout] Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#E24A4A'} />
      </View>
    );
  }

  console.log('[Layout] Rendering navigation');
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(stack)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </CartProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}