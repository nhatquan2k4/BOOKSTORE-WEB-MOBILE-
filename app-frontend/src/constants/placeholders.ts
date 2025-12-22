/**
 * Placeholder images for various content types
 * Using Unsplash free images for better quality
 */

export const PLACEHOLDER_IMAGES = {
  // Book covers
  BOOK_COVER_1: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  BOOK_COVER_2: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  BOOK_COVER_3: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
  BOOK_COVER_4: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
  
  // Default book cover
  DEFAULT_BOOK: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  
  // User avatar
  DEFAULT_AVATAR: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop',
  
  // Category images
  CATEGORY_DEFAULT: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
};

/**
 * Get a random book cover placeholder
 */
export const getRandomBookCover = (): string => {
  const covers = [
    PLACEHOLDER_IMAGES.BOOK_COVER_1,
    PLACEHOLDER_IMAGES.BOOK_COVER_2,
    PLACEHOLDER_IMAGES.BOOK_COVER_3,
    PLACEHOLDER_IMAGES.BOOK_COVER_4,
  ];
  return covers[Math.floor(Math.random() * covers.length)];
};

/**
 * Get multiple random book covers for carousel
 */
export const getRandomBookCovers = (count: number = 2): string[] => {
  const covers = [
    PLACEHOLDER_IMAGES.BOOK_COVER_1,
    PLACEHOLDER_IMAGES.BOOK_COVER_2,
    PLACEHOLDER_IMAGES.BOOK_COVER_3,
    PLACEHOLDER_IMAGES.BOOK_COVER_4,
  ];
  
  // Shuffle and take first 'count' items
  const shuffled = [...covers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
