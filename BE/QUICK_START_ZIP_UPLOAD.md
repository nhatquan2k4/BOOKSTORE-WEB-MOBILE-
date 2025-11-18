# 🚀 Quick Start: Upload Ebook ZIP

## Tóm tắt nhanh
**Thay vì upload PDF trực tiếp (chậm), nén PDF vào ZIP rồi upload (nhanh hơn 30-70%)**

---

## 📦 Cách nén file

### Windows:
```
Click chuột phải PDF → Send to → Compressed (zipped) folder
```

### Mac:
```
Click chuột phải PDF → Compress
```

### Linux/Terminal:
```bash
zip ebook.zip truyen_tranh.pdf
```

---

## 🔧 API Endpoints

### 1. Admin Upload ZIP (chứa PDF/EPUB)
```http
POST /api/rental/books/{bookId}/upload-zip
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
Body: file = ebook.zip
```

**Response:**
```json
{
  "success": true,
  "message": "Upload thành công. Đã giảm 35% dung lượng khi upload",
  "originalFileName": "truyen_tranh.pdf",
  "originalSize": 52428800,
  "compressedSize": 34078720,
  "compressionRatio": 35.00
}
```

### 2. User Lấy Link Đọc (PDF/EPUB đầy đủ)
```http
GET /api/rental/books/{bookId}/access-link
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "bookId": "...",
  "bookTitle": "Truyện tranh hay",
  "ebookUrl": "http://localhost:9000/ebook-files/...pdf?X-Amz-...",
  "fileType": "PDF",
  "expiresAt": "2024-11-18T10:30:00Z",
  "message": "Link đọc ebook có hiệu lực trong 10 phút"
}
```

---

## 📱 Đọc trong App

### React Native:
```javascript
import Pdf from 'react-native-pdf';

<Pdf source={{ uri: ebookUrl }} style={{ flex: 1 }} />
```

### Web:
```html
<iframe src="<ebookUrl>" width="100%" height="600px"></iframe>
```

---

## ⚡ Lợi ích

| Phương thức | Tốc độ | Băng thông | Khi nào dùng |
|------------|--------|------------|--------------|
| Upload trực tiếp | ❌ Chậm | ❌ Cao | Upload 1-2 file, mạng nhanh |
| **Upload ZIP** | ✅ **Nhanh hơn 30-70%** | ✅ **Tiết kiệm** | **Upload nhiều file, file lớn** |

**Kết quả:** Cả 2 phương thức đều cho ra file PDF/EPUB đầy đủ để đọc

---

## ✅ Lưu ý

1. **ZIP chỉ chứa 1 file PDF hoặc EPUB** (không phải nhiều file ảnh)
2. File được extract tự động và lưu vào MinIO
3. User đọc **full truyện tranh** trong PDF (không phải từng trang)
4. Pre-signed URL hết hạn sau 10 phút → Refresh bằng cách gọi lại API

---

## 📖 Chi tiết đầy đủ

Xem file `ZIP_EBOOK_API_GUIDE.md` để biết thêm chi tiết và ví dụ code đầy đủ.
