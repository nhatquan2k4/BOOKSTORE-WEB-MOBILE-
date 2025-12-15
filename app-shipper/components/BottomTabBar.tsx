import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          // =================================================================
          // Giới hạn chỉ hiển thị 3 tab đầu tiên
          if (index > 2) return null;
          // =================================================================

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // --- CẤU HÌNH ICON VÀ MÀU SẮC THEO THỨ TỰ MỚI ---
          let iconName: keyof typeof Ionicons.glyphMap = "help-circle";
          let tabColor = "#7FB85E";

          if (index === 0) {
            // Tab 1: Trang chủ (Màu Đỏ)
            iconName = isFocused ? "home" : "home-outline";
            tabColor = "#E24A4A"; 
          } else if (index === 1) {
            // Tab 2: Đơn hàng (Màu Cam) -> Icon Hóa đơn
            iconName = isFocused ? "time" : "time-outline";
            tabColor = "#F59E0B"; 
          } else if (index === 2) {
            // Tab 3: Tài khoản (Màu Xanh/Xám) -> Icon Người
            iconName = isFocused ? "person" : "person-outline";
            tabColor = "#607D8B"; 
          }

          // Hiệu ứng cho tab đang active (được chọn)
          if (isFocused) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={{ selected: true }}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.activeTab}
              >
                <View
                  style={[
                    styles.activeIconContainer,
                    { backgroundColor: tabColor },
                  ]}
                >
                  <Ionicons name={iconName} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.activeLabel}>
                  {typeof label === "string" ? label : ""}
                </Text>
              </TouchableOpacity>
            );
          }

          // Tab bình thường (chưa chọn)
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
              <Ionicons name={iconName} size={24} color="#9CA3AF" />
              <Text style={styles.label}>
                {typeof label === "string" ? label : ""}
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 0,
    marginBottom: 0,
    height: 70,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  activeTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#1F2937",
    fontWeight: "600",
    textAlign: "center",
  },
});