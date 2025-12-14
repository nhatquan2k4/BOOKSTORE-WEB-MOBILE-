/**
 * Test cases cho Vietnamese text search utility
 * Chạy: npm test -- text.test.ts
 */

import { 
  removeVietnameseAccents, 
  matchVietnameseText,
  equalVietnameseText 
} from './text';

describe('Vietnamese Text Search Utils', () => {
  
  describe('removeVietnameseAccents', () => {
    it('should remove Vietnamese accents from book titles', () => {
      expect(removeVietnameseAccents('Đắc Nhân Tâm')).toBe('dac nhan tam');
      expect(removeVietnameseAccents('Tuổi Trẻ Đáng Giá Bao Nhiêu')).toBe('tuoi tre dang gia bao nhieu');
      expect(removeVietnameseAccents('Nhà Giả Kim')).toBe('nha gia kim');
    });

    it('should handle author names', () => {
      expect(removeVietnameseAccents('Nguyễn Nhật Ánh')).toBe('nguyen nhat anh');
      expect(removeVietnameseAccents('Tô Hoài')).toBe('to hoai');
      expect(removeVietnameseAccents('Ngô Tất Tố')).toBe('ngo tat to');
    });

    it('should handle categories', () => {
      expect(removeVietnameseAccents('Văn Học Việt Nam')).toBe('van hoc viet nam');
      expect(removeVietnameseAccents('Kinh Tế - Quản Lý')).toBe('kinh te - quan ly');
      expect(removeVietnameseAccents('Tâm Lý - Kỹ Năng Sống')).toBe('tam ly - ky nang song');
    });

    it('should handle empty and special cases', () => {
      expect(removeVietnameseAccents('')).toBe('');
      expect(removeVietnameseAccents('   ')).toBe('');
      expect(removeVietnameseAccents('123 ABC')).toBe('123 abc');
    });
  });

  describe('matchVietnameseText', () => {
    it('should match book titles with and without accents', () => {
      // User gõ không dấu
      expect(matchVietnameseText('Đắc Nhân Tâm', 'dac nhan')).toBe(true);
      expect(matchVietnameseText('Tuổi Trẻ Đáng Giá', 'tuoi tre')).toBe(true);
      
      // User gõ có dấu
      expect(matchVietnameseText('Đắc Nhân Tâm', 'Đắc Nhân')).toBe(true);
      
      // Mixed
      expect(matchVietnameseText('Đắc Nhân Tâm', 'dac Nhân')).toBe(true);
    });

    it('should match author names', () => {
      expect(matchVietnameseText('Nguyễn Nhật Ánh', 'nguyen nhat anh')).toBe(true);
      expect(matchVietnameseText('Nguyễn Nhật Ánh', 'nguyen')).toBe(true);
      expect(matchVietnameseText('Nguyễn Nhật Ánh', 'nhat anh')).toBe(true);
    });

    it('should match categories', () => {
      expect(matchVietnameseText('Văn Học Việt Nam', 'van hoc')).toBe(true);
      expect(matchVietnameseText('Kinh Tế - Quản Lý', 'kinh te')).toBe(true);
      expect(matchVietnameseText('Tâm Lý - Kỹ Năng Sống', 'tam ly')).toBe(true);
    });

    it('should return false for non-matches', () => {
      expect(matchVietnameseText('Đắc Nhân Tâm', 'xyz')).toBe(false);
      expect(matchVietnameseText('Nguyễn Nhật Ánh', 'tran')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(matchVietnameseText('', 'test')).toBe(false);
      expect(matchVietnameseText('test', '')).toBe(false);
      expect(matchVietnameseText('', '')).toBe(false);
    });
  });

  describe('equalVietnameseText', () => {
    it('should compare Vietnamese strings ignoring accents and case', () => {
      expect(equalVietnameseText('Đắc Nhân Tâm', 'dac nhan tam')).toBe(true);
      expect(equalVietnameseText('NGUYỄN NHẬT ÁNH', 'nguyen nhat anh')).toBe(true);
      expect(equalVietnameseText('Văn Học', 'van hoc')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(equalVietnameseText('Đắc Nhân Tâm', 'Nhà Giả Kim')).toBe(false);
      expect(equalVietnameseText('Nguyễn', 'Trần')).toBe(false);
    });
  });

  describe('Real-world search scenarios', () => {
    const books = [
      { id: '1', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie' },
      { id: '2', title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn' },
      { id: '3', title: 'Nhà Giả Kim', author: 'Paulo Coelho' },
      { id: '4', title: 'Cà Phê Cùng Tony', author: 'Tony Buổi Sáng' },
    ];

    const authors = [
      { id: '1', name: 'Nguyễn Nhật Ánh' },
      { id: '2', name: 'Tô Hoài' },
      { id: '3', name: 'Ngô Tất Tố' },
    ];

    const categories = [
      { id: '1', name: 'Văn Học Việt Nam' },
      { id: '2', name: 'Kinh Tế - Quản Lý' },
      { id: '3', name: 'Tâm Lý - Kỹ Năng Sống' },
    ];

    it('should filter books by search term without accents', () => {
      const searchTerm = 'dac nhan';
      const results = books.filter(book => 
        matchVietnameseText(book.title, searchTerm)
      );
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Đắc Nhân Tâm');
    });

    it('should filter authors by search term without accents', () => {
      const searchTerm = 'nguyen';
      const results = authors.filter(author => 
        matchVietnameseText(author.name, searchTerm)
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Nguyễn Nhật Ánh');
    });

    it('should filter categories by search term without accents', () => {
      const searchTerm = 'tam ly';
      const results = categories.filter(cat => 
        matchVietnameseText(cat.name, searchTerm)
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Tâm Lý - Kỹ Năng Sống');
    });

    it('should handle partial matches', () => {
      const searchTerm = 'ca phe';
      const results = books.filter(book => 
        matchVietnameseText(book.title, searchTerm)
      );
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Cà Phê Cùng Tony');
    });
  });
});
