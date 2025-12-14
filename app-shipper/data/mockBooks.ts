// Mock data cho books - sẽ được thay thế bằng API calls sau này

export interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  coverImages?: string[]; // Multiple cover images for carousel
  color?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  description?: string;
  pages?: number;
  language?: string;
  publisher?: string;
  publishDate?: string;
}

export const popularBooks: Book[] = [
  {
    id: 1,
    title: 'Her Radiant Curse',
    author: 'Elizabeth Lim',
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1668784361i/62047984.jpg',
    color: '#9B8FC5',
    rating: 4.5,
    reviewCount: 1234,
    price: 15.99,
    description: 'A dazzling fairy tale about sisterhood, sacrifice, and a dangerous quest to save a cursed kingdom. Channi was not born a monster. But when her own father offers her in sacrifice to the Demon Witch, she is forever changed. Abandoned by her family, Channi must navigate the treacherous world of gods and demons to break her curse and save her sister.',
    pages: 368,
    language: 'English',
    publisher: 'Knopf Books',
    publishDate: '2023-03-07',
  },
  {
    id: 2,
    title: 'Principessa',
    author: 'Garth Nix',
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1644520883i/60391447.jpg',
    color: '#7FB89E',
    rating: 4.3,
    reviewCount: 892,
    price: 18.50,
    description: 'A captivating fantasy adventure that will transport you to magical realms. Follow the journey of a young princess who discovers her true destiny.',
    pages: 432,
    language: 'English',
    publisher: 'HarperCollins',
    publishDate: '2023-01-15',
  },
  {
    id: 3,
    title: 'The Atlas Six',
    author: 'Olivie Blake',
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654638941i/50520939.jpg',
    color: '#6B9AC4',
    rating: 4.6,
    reviewCount: 2156,
    price: 17.99,
    description: 'Dark academia meets fantasy in this thrilling tale of six magicians competing for a place in the prestigious Alexandrian Society.',
    pages: 384,
    language: 'English',
    publisher: 'Tor Books',
    publishDate: '2022-03-01',
  },
];

export const ebooks: Book[] = [
  {
    id: 4,
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603206535i/54120408.jpg',
    color: '#C5B8A5',
    rating: 4.2,
    reviewCount: 1543,
    price: 12.99,
    description: 'A luminous, unforgettable story about the nature of love and what it means to be human.',
    pages: 320,
    language: 'English',
    publisher: 'Knopf',
    publishDate: '2021-03-02',
  },
  {
    id: 5,
    title: 'A Court of Mist and Fury',
    author: 'Sarah J. Maas',
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1430140829i/17927395.jpg',
    color: '#A8968D',
    rating: 4.7,
    reviewCount: 3421,
    price: 14.99,
    description: 'Feyre has undergone more trials than one human woman can carry in her heart. Though she has now been granted the powers and lifespan of the High Fae.',
    pages: 640,
    language: 'English',
    publisher: 'Bloomsbury',
    publishDate: '2016-05-03',
  },
  {
    id: 6,
    title: 'The Invisible Life of Addie LaRue',
    author: 'V.E. Schwab',
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1531077935i/35068705.jpg',
    color: '#8B9CAA',
    rating: 4.4,
    reviewCount: 2789,
    price: 16.99,
    description: 'A Life No One Will Remember. A Story You Will Never Forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain to live forever.',
    pages: 448,
    language: 'English',
    publisher: 'Tor Books',
    publishDate: '2020-10-06',
  },
];

// Helper function to get book by ID
export const getBookById = (id: number): Book | undefined => {
  const allBooks = [...popularBooks, ...ebooks];
  return allBooks.find(book => book.id === id);
};

// Helper function to get all books
export const getAllBooks = (): Book[] => {
  return [...popularBooks, ...ebooks];
};
