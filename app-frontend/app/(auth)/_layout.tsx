import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#F6F5FF',
        },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
      <Stack.Screen name="resetpassword" options={{ headerShown: false }} />
    </Stack>
  );
}
