import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  cover: string;
  color?: string;
  onPress?: () => void;
}

export function BookCard({ title, author, cover, color = '#9B8FC5', onPress }: BookCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.cover, { backgroundColor: color }]}>
        <Image 
          source={{ uri: cover }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {author}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: -5,
  },
  cover: {
    width: 160,
    height: 240,
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  author: {
    fontSize: 13,
    color: '#E25A5A',
    fontWeight: '500',
  },
});
