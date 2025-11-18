import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dữ liệu mẫu
const recentSearches = ['Harry Potter', 'The Hobbit', 'Fiction', 'Romance Novels'];
const trendingSearches = [
  { id: 1, text: '1984 George Orwell', trend: 'up', count: '2.5K' },
  { id: 2, text: 'Best Fantasy Books 2024', trend: 'up', count: '1.8K' },
  { id: 3, text: 'Science Fiction Classics', trend: 'down', count: '1.2K' },
  { id: 4, text: 'Self-Help Books', trend: 'up', count: '980' },
];
const popularGenres = [
  { id: 1, name: 'Fiction', icon: '📚', color: '#4A90E2' },
  { id: 2, name: 'Mystery', icon: '🔍', color: '#E24A4A' },
  { id: 3, name: 'Romance', icon: '💕', color: '#E24AA5' },
  { id: 4, name: 'Sci-Fi', icon: '🚀', color: '#7FB85E' },
  { id: 5, name: 'History', icon: '📜', color: '#FFB800' },
  { id: 6, name: 'Biography', icon: '👤', color: '#A54AE2' },
];
const suggestedAuthors = [
  { id: 1, name: 'J.K. Rowling', books: '7 books' },
  { id: 2, name: 'Stephen King', books: '64 books' },
  { id: 3, name: 'Agatha Christie', books: '66 books' },
  { id: 4, name: 'Dan Brown', books: '8 books' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Books', 'Authors', 'Publishers', 'Series'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover Books</Text>
          <Text style={styles.headerSubtitle}>Search your favorite books, authors & more</Text>
        </View>

        {/* Search Bar with Advanced Features */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search books, authors, ISBN..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Advanced Filters */}
          <View style={styles.advancedFilters}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={18} color="#E24A4A" />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="camera-outline" size={18} color="#E24A4A" />
              <Text style={styles.filterButtonText}>Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="mic-outline" size={18} color="#E24A4A" />
              <Text style={styles.filterButtonText}>Voice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterChipsContainer}
          contentContainerStyle={styles.filterChipsContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentSearches}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity key={index} style={styles.recentSearchItem}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                  <TouchableOpacity style={styles.removeSearch}>
                    <Ionicons name="close" size={16} color="#999" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Trending Searches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {trendingSearches.map((item) => (
            <TouchableOpacity key={item.id} style={styles.trendingItem}>
              <View style={styles.trendingLeft}>
                <Ionicons
                  name={item.trend === 'up' ? 'trending-up' : 'trending-down'}
                  size={20}
                  color={item.trend === 'up' ? '#E24A4A' : '#999'}
                />
                <Text style={styles.trendingText}>{item.text}</Text>
              </View>
              <Text style={styles.trendingCount}>{item.count} searches</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Genres</Text>
          <View style={styles.genresGrid}>
            {popularGenres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[styles.genreCard, { borderColor: genre.color }]}
              >
                <Text style={styles.genreIcon}>{genre.icon}</Text>
                <Text style={styles.genreName}>{genre.name}</Text>
                <View style={[styles.genreDot, { backgroundColor: genre.color }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Suggested Authors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Authors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {suggestedAuthors.map((author) => (
            <TouchableOpacity key={author.id} style={styles.authorItem}>
              <View style={styles.authorAvatar}>
                <Ionicons name="person" size={24} color="#E24A4A" />
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{author.name}</Text>
                <Text style={styles.authorBooks}>{author.books}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="barcode-outline" size={32} color="#E24A4A" />
              <Text style={styles.quickActionText}>Scan ISBN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="bookmarks-outline" size={32} color="#E24A4A" />
              <Text style={styles.quickActionText}>Browse All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Padding bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E24A4A',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  advancedFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  filterChipsContainer: {
    marginBottom: 20,
  },
  filterChipsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#E24A4A',
    borderColor: '#E24A4A',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  recentSearches: {
    gap: 10,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  removeSearch: {
    padding: 4,
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  trendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trendingText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  trendingCount: {
    fontSize: 12,
    color: '#999',
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genreCard: {
    width: '31%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  genreIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  genreName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  genreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  authorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  authorBooks: {
    fontSize: 13,
    color: '#999',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
});
