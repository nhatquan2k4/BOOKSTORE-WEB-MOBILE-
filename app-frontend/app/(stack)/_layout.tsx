import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Stack.Screen
        name="book-detail"
        options={{
          headerShown: false,
          presentation: 'card', // Hiển thị như card thay vì modal
        }}
      />
    </Stack>
  );
}
