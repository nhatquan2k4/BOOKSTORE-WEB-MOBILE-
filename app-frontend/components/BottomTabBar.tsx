import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Filter out routes we want to hide from the tab bar (e.g. "explore")
  const visibleRoutes = state.routes.filter((r) => r.name !== 'explore');

  // Animation values for each visible tab
  const animatedValues = useRef(
    visibleRoutes.map(() => ({
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Animated value for bottom glow position (index among visible tabs)
  const glowPosition = useRef(new Animated.Value(0)).current;

  // Track previous visible index
  const initialVisibleIndex = visibleRoutes.findIndex((r) => r.key === state.routes[state.index].key);
  const prevIndex = useRef(initialVisibleIndex >= 0 ? initialVisibleIndex : 0);

  // Hàm chạy animation cho tab cụ thể
  const animateTab = useCallback((index: number, isActive: boolean) => {
    const { translateY, scale, opacity } = animatedValues[index];

    // Reset animation về 0 trước khi chạy lại (để lần nhấn sau vẫn có hiệu ứng)
    translateY.setValue(0);
    scale.setValue(1);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isActive ? -20 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 120,
      }),
      Animated.spring(scale, {
        toValue: isActive ? 1.1 : 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isActive ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [animatedValues]);


// Theo dõi tab thay đổi
  useEffect(() => {
    // Find the index of the currently focused route among visible routes
    const currentVisibleIndex = visibleRoutes.findIndex((r) => r.key === state.routes[state.index].key);
    const previousVisibleIndex = prevIndex.current;

    // If the focused route is hidden (e.g. explore), skip animation
    if (currentVisibleIndex === -1) return;

    if (previousVisibleIndex !== currentVisibleIndex) {
      // Tắt animation tab cũ
      if (previousVisibleIndex >= 0 && animatedValues[previousVisibleIndex]) {
        animateTab(previousVisibleIndex, false);
      }

      // Bật animation tab mới
      animateTab(currentVisibleIndex, true);

      // Hiệu ứng di chuyển glow
      Animated.spring(glowPosition, {
        toValue: currentVisibleIndex,
        useNativeDriver: false,
        friction: 8,
        tension: 100,
      }).start();

      prevIndex.current = currentVisibleIndex;
    }
  }, [state.index, animateTab, glowPosition, visibleRoutes]);


  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {/* Background glow at the bottom of tab bar */}
        {
          // Prepare dynamic ranges for only visible tabs
        }
        {(() => {
          const colors = ['#4A90E2', '#E24A4A', '#E24AA5', '#7FB85E', '#A54AE2'].slice(0, visibleRoutes.length);
          const inputRange = visibleRoutes.map((_, i) => i);
          const leftOutput = visibleRoutes.map((_, i) => `${7 + i * 20}%`);

          return (
            <Animated.View
              style={[
                styles.bottomGlow,
                {
                  backgroundColor: glowPosition.interpolate({
                    inputRange,
                    outputRange: colors,
                  }) as any,
                  left: glowPosition.interpolate({
                    inputRange,
                    outputRange: leftOutput,
                  }) as any,
                  opacity: 0.4,
                },
              ]}
            />
          );
        })()}

        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          // Determine focus by matching route keys
          const isFocused = state.routes[state.index]?.key === route.key;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              if (!isFocused) {
                navigation.navigate(route.name);
              } else {
                // 🔥 Nếu đang ở tab hiện tại → vẫn chạy animation lại
                animateTab(index, true);
              }
            }
          };


          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Icon mapping và màu sắc cho từng visible tab (index-based)
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';
          let tabColor = '#7FB85E';
          
          if (index === 0) {
            iconName = isFocused ? 'home' : 'home-outline';
            tabColor = '#4A90E2';
          }
          if (index === 1) {
            iconName = isFocused ? 'search' : 'search-outline';
            tabColor = '#E24A4A';
          }
          if (index === 2) {
            iconName = isFocused ? 'cart' : 'cart-outline';
            tabColor = '#E24AA5';
          }
          if (index === 3) {
            iconName = isFocused ? 'notifications' : 'notifications-outline';
            tabColor = '#7FB85E';
          }
          if (index === 4) {
            iconName = isFocused ? 'person' : 'person-outline';
            tabColor = '#A54AE2';
          }

          // Hiệu ứng nổi lên khi được chọn
          if (isFocused) {
            return (
              <Animated.View
                key={route.key}
                style={[
                  styles.activeButtonContainer,
                  {
                    transform: [
                      { translateY: animatedValues[index].translateY },
                      { scale: animatedValues[index].scale },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.activeButtonWrapper}
                >
                  <View style={styles.activeButton}>
                    <View style={[styles.activeGlow, { backgroundColor: tabColor, shadowColor: tabColor }]}>
                      <Ionicons
                        name={iconName}
                        size={32}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>
                  <Text style={styles.activeLabel}>
                    {typeof label === 'string' ? label.toUpperCase() : ''}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <Ionicons
                name={iconName}
                size={28}
                color="#6B7280"
              />
              <Text style={styles.label}>
                {typeof label === 'string' ? label.toUpperCase() : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1D23',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 30,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-evenly', // Thay đổi từ space-around thành space-evenly
    paddingHorizontal: 15, // Tăng padding
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 8,
    marginTop: 4,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    height: 4,
    width: 50,
    borderRadius: 2,
  },
  activeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2D3138',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  activeGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7FB85E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7FB85E',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  activeLabel: {
    fontSize: 8,
    marginTop: 8,
    color: '#B8C5D0',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
