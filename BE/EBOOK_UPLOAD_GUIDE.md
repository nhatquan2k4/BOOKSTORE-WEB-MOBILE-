# 📚 Hướng dẫn Upload Ebook với ZIP

## 🎯 Tổng quan

Hệ thống hỗ trợ 2 cách upload ebook:

### 1. Upload trực tiếp (dành cho file nhỏ)
```
POST /api/rental/books/{bookId}/upload
- File: PDF hoặc EPUB
- Dùng cho: Truyện chữ (< 10MB)
```

### 2. Upload ZIP (dành cho file lớn) - ⚡ Nhanh hơn 30-50%
```
POST /api/rental/books/{bookId}/upload-zip
- File: ZIP chứa 1 file PDF hoặc EPUB
- Dùng cho: Truyện tranh, file lớn (> 10MB)
- Server tự động extract và lưu file gốc
```

## 📦 Cách tạo file ZIP

### Windows:
1. Đặt file PDF vào thư mục
2. Click chuột phải vào file PDF
3. Chọn **Send to** → **Compressed (zipped) folder**
4. File `truyen.zip` được tạo

### Mac:
1. Click chuột phải vào file PDF
2. Chọn **Compress "truyen.pdf"**
3. File `truyen.zip` được tạo

### Linux/Terminal:
```bash
zip truyen.zip truyen.pdf
```

### Python script:
```python
import zipfile

with zipfile.ZipFile('truyen.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('truyen.pdf', 'truyen.pdf')
```

## 🚀 Cách sử dụng API

### Bước 1: Login Admin
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@bookstore.com",
  "password": "Admin@123"
}
```

**Response:** Copy `accessToken`

### Bước 2: Authorize trong Swagger
1. Click nút **Authorize** (biểu tượng ổ khóa)
2. Nhập: `Bearer <accessToken>`
3. Click **Authorize**

### Bước 3: Upload ZIP

#### Option A: Swagger UI
1. Tìm endpoint: `POST /api/rental/books/{bookId}/upload-zip`
2. Click **Try it out**
3. Nhập `bookId` (GUID của sách)
4. Click **Choose File** → Chọn file ZIP
5. Click **Execute**

#### Option B: Postman
```http
POST http://localhost:5276/api/rental/books/{bookId}/upload-zip
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: truyen.zip
```

#### Option C: cURL
```bash
curl -X POST "http://localhost:5276/api/rental/books/{bookId}/upload-zip" \
  -H "Authorization: Bearer <token>" \
  -F "file=@truyen.zip"
```

### Response:
```json
{
  "success": true,
  "message": "Upload thành công! Tiết kiệm 35% dung lượng khi upload",
  "originalFileName": "truyen_tranh.pdf",
  "originalSize": 52428800,      // 50 MB (sau khi extract)
  "compressedSize": 34078720,    // 32.5 MB (file ZIP)
  "compressionRatio": 35.00      // Tiết kiệm 35%
}
```

## 📖 User đọc ebook

### Lấy link đọc:
```http
GET /api/rental/books/{bookId}/access-link
Authorization: Bearer <user_token>
```

### Response:
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

**Lưu ý:**
- User phải có **subscription còn hạn**
- Pre-signed URL hết hạn sau **10 phút**
- Gọi lại API để lấy URL mới

## 💡 So sánh 2 phương thức

| Đặc điểm | Upload trực tiếp | Upload ZIP |
|----------|------------------|------------|
| **File size** | Nhỏ (< 10MB) | Lớn (> 10MB) |
| **Loại** | EPUB, PDF nhỏ | PDF lớn, truyện tranh |
| **Tốc độ** | Bình thường | ⚡ Nhanh hơn 30-50% |
| **Băng thông** | Cao | 💾 Tiết kiệm 30-50% |
| **Kết quả** | PDF/EPUB | PDF/EPUB (extract từ ZIP) |

## 📊 Ví dụ thực tế

### Truyện chữ (EPUB):
```
- File gốc: novel.epub (5 MB)
- Cách upload: Trực tiếp
- API: POST /api/rental/books/{bookId}/upload
- Lý do: File đã nhỏ, không cần ZIP
```

### Truyện tranh (PDF):
```
- File gốc: manga.pdf (50 MB)
- Nén ZIP: manga.zip (35 MB) - Giảm 30%
- Cách upload: Upload ZIP
- API: POST /api/rental/books/{bookId}/upload-zip
- Lý do: Upload nhanh hơn, tiết kiệm băng thông
```

## 🔍 Troubleshooting

### Lỗi: "Không tìm thấy file PDF hoặc EPUB trong ZIP"
**Nguyên nhân:** ZIP không chứa file PDF/EPUB hoặc chứa nhiều file

**Giải pháp:**
- Đảm bảo ZIP chỉ chứa **1 file PDF** hoặc **1 file EPUB**
- Không để file khác trong ZIP

### Lỗi: "File phải có định dạng .zip"
**Nguyên nhân:** File upload không phải ZIP

**Giải pháp:**
- Kiểm tra extension file: phải là `.zip`
- Không dùng `.rar`, `.7z` hoặc format khác

### Lỗi: Upload chậm
**Nguyên nhân:** Mạng chậm hoặc file quá lớn

**Giải pháp:**
- Kiểm tra kết nối mạng
- Nếu file > 100MB, xem xét tối ưu thêm
- Có thể dùng compression cao hơn khi tạo ZIP

## ✅ Checklist

Trước khi upload:
- [ ] File PDF/EPUB đã chuẩn bị
- [ ] Đã tạo file ZIP (chứa 1 file PDF hoặc EPUB)
- [ ] Đã login Admin và có JWT token
- [ ] Biết `bookId` (GUID) của sách
- [ ] Docker container đang chạy
- [ ] Swagger UI truy cập được

Sau khi upload:
- [ ] Response trả về `success: true`
- [ ] Xem `compressionRatio` để biết tiết kiệm bao nhiêu %
- [ ] Test user lấy link đọc
- [ ] Link PDF/EPUB hoạt động

## 🎉 Kết quả

Với chức năng upload ZIP, bạn có thể:
- ✅ Upload file lớn **nhanh hơn 30-50%**
- ✅ **Tiết kiệm băng thông** khi upload nhiều file
- ✅ Vẫn giữ được **file PDF/EPUB gốc** để user đọc
- ✅ Hỗ trợ cả **truyện chữ** (EPUB) và **truyện tranh** (PDF)

---

**Tạo bởi:** BookStore API Team  
**Ngày:** 18/11/2025
