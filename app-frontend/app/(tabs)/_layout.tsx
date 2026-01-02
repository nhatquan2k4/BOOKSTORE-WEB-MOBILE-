import { Tabs } from 'expo-router';
import React from 'react';

import { BottomTabBar } from '@/components/BottomTabBar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm Kiếm',
          href: null, // Ẩn tab này
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ Hàng',
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Thông Báo',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài Đặt',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          href: null, // Ẩn tab này
        }}
      />
    </Tabs>
  );
}