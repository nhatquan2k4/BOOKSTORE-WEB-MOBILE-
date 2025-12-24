import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryItemProps {
  id: number;
  name: string;
  icon?: string;
  imageSource?: any;
  color: string;
  bgColor: string;
  useImage?: boolean;
  isSelected: boolean;
  onPress: () => void;
}

export function CategoryItem({
  name,
  icon,
  imageSource,
  color,
  bgColor,
  useImage,
  isSelected,
  onPress,
}: CategoryItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isSelected ? color : bgColor },
        ]}
      >
        {useImage ? (
          <Image source={imageSource} style={styles.imageIcon} resizeMode="contain" />
        ) : (
          <Ionicons
            name={icon as any}
            size={24}
            color={isSelected ? '#fff' : color}
          />
        )}
      </View>
      <Text style={[styles.text, isSelected && styles.textSelected]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageIcon: {
    width: 35,
    height: 35,
  },
  text: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  textSelected: {
    color: '#333',
    fontWeight: '600',
  },
});
