# Vietnamese Text Search Utility

## 📝 Mô tả

Utility functions để hỗ trợ tìm kiếm tiếng Việt không dấu, giải quyết vấn đề người dùng gõ không dấu nhưng vẫn tìm được kết quả có dấu.

## 🎯 Use Case

**Vấn đề**: User gõ `"dac nhan tam"` (không dấu) nhưng muốn tìm sách `"Đắc Nhân Tâm"` (có dấu)

**Giải pháp**: Normalize cả search term và data về dạng không dấu để so sánh

## 🚀 Cách sử dụng

### 1. Import

```typescript
import { matchVietnameseText, removeVietnameseAccents } from '@/lib/utils/text';
```

### 2. Filter/Search trong component

```typescript
// Trong React component
const searchBooks = (books: Book[], searchTerm: string) => {
  return books.filter(book => 
    matchVietnameseText(book.title, searchTerm) ||
    matchVietnameseText(book.author, searchTerm)
  );
};

// Ví dụ
const books = [
  { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie' },
  { id: 2, title: 'Tuổi Trẻ Đáng Giá', author: 'Rosie Nguyễn' },
];

const results = searchBooks(books, 'dac nhan'); 
// Kết quả: [{ id: 1, title: 'Đắc Nhân Tâm', ... }]
```

### 3. Sử dụng trong Header.tsx (ví dụ thực tế)

```typescript
// Filter authors với Vietnamese matching
const filteredAuthors = authorsResult.items.filter((author) =>
  matchVietnameseText(author.name, searchTerm)
);

// Filter categories
const filteredCategories = categoriesResult.items.filter((cat) =>
  matchVietnameseText(cat.name, searchTerm) ||
  matchVietnameseText(cat.description, searchTerm)
);
```

## 📦 Available Functions

### `removeVietnameseAccents(str: string): string`

Chuyển chuỗi tiếng Việt có dấu sang không dấu.

```typescript
removeVietnameseAccents('Đắc Nhân Tâm') // "dac nhan tam"
removeVietnameseAccents('Nguyễn Nhật Ánh') // "nguyen nhat anh"
removeVietnameseAccents('Văn Học Việt Nam') // "van hoc viet nam"
```

### `matchVietnameseText(text: string, search: string): boolean`

Kiểm tra xem text có chứa search hay không (không phân biệt dấu).

```typescript
matchVietnameseText('Đắc Nhân Tâm', 'dac nhan') // true
matchVietnameseText('Nguyễn Nhật Ánh', 'nguyen') // true
matchVietnameseText('Văn Học', 'van hoc') // true
matchVietnameseText('Đắc Nhân Tâm', 'xyz') // false
```

### `equalVietnameseText(str1: string, str2: string): boolean`

So sánh 2 chuỗi (không phân biệt dấu, hoa/thường).

```typescript
equalVietnameseText('Đắc Nhân Tâm', 'dac nhan tam') // true
equalVietnameseText('NGUYỄN', 'nguyen') // true
```

### `highlightVietnameseText(text: string, search: string)`

Highlight phần text khớp với search (để render UI).

```typescript
const parts = highlightVietnameseText('Đắc Nhân Tâm', 'Nhân');
// [
//   { text: 'Đắc ', highlight: false },
//   { text: 'Nhân', highlight: true },
//   { text: ' Tâm', highlight: false }
// ]

// Render in React
{parts.map((part, i) => (
  <span key={i} className={part.highlight ? 'bg-yellow-200' : ''}>
    {part.text}
  </span>
))}
```

## 🔧 Technical Details

### Cách hoạt động

1. **Unicode Normalization (NFD)**
   - Tách ký tự gốc và dấu riêng biệt
   - VD: `ắ` → `a` + `̆` + `́`

2. **Remove Combining Marks**
   - Xóa các dấu thanh (U+0300 - U+036F)

3. **Replace Special Characters**
   - `đ` → `d`, `Đ` → `D`

4. **Lowercase & Trim**

### Performance

- ✅ Fast: O(n) complexity
- ✅ Memory efficient
- ✅ No external dependencies (chỉ dùng native JavaScript)

## 🧪 Testing

Chạy tests:

```bash
npm test -- text.test.ts
```

Test coverage bao gồm:
- Book titles
- Author names  
- Category names
- Edge cases (empty, special chars)
- Real-world scenarios

## 📌 Notes

### Backend vs Frontend

**Best Practice**: Backend nên hỗ trợ accent-insensitive search

**Frontend filter**: Dùng cho:
- Data nhỏ đã load về client (categories)
- Bổ sung khi backend chưa hỗ trợ
- Real-time filtering trong dropdown

### Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ IE11+ (với polyfill cho String.normalize)

## 🎨 UI Examples

### Search Dropdown với matching

```typescript
const SearchResult = ({ text, searchTerm }: Props) => {
  const parts = highlightVietnameseText(text, searchTerm);
  
  return (
    <div>
      {parts.map((part, i) => (
        <span 
          key={i} 
          className={part.highlight ? 'font-bold bg-yellow-100' : ''}
        >
          {part.text}
        </span>
      ))}
    </div>
  );
};
```

## 🚦 Examples from Real Project

### Ví dụ 1: Search bar

User gõ: `"tuoi tre"`  
Kết quả tìm được:
- ✅ "Tuổi Trẻ Đáng Giá Bao Nhiêu"
- ✅ "Tuổi Trẻ Của Chúng Ta"

### Ví dụ 2: Author search

User gõ: `"nguyen nhat anh"`  
Kết quả:
- ✅ Nguyễn Nhật Ánh
- ✅ Các sách của tác giả

### Ví dụ 3: Category filter

User gõ: `"van hoc"`  
Kết quả:
- ✅ Văn Học Việt Nam
- ✅ Văn Học Nước Ngoài
- ✅ Văn Học Thiếu Nhi

## 🔗 Related Files

- Implementation: `/src/lib/utils/text.ts`
- Tests: `/src/lib/utils/text.test.ts`
- Usage: `/src/components/layout/Header.tsx`
- Export: `/src/lib/utils/index.ts`
