# Hướng dẫn sử dụng API Upload Ebook dạng ZIP (Nén PDF/EPUB)

## Tổng quan
Thay vì upload file PDF/EPUB nguyên bản trực tiếp, bạn có thể **nén file PDF/EPUB vào trong ZIP** rồi upload. Điều này giúp:
- **⚡ Tăng tốc độ upload**: File ZIP nhỏ hơn 30-70% so với PDF gốc
- **💾 Tiết kiệm băng thông**: Đặc biệt quan trọng khi upload nhiều file
- **📖 Đọc full truyện**: Khi gọi API, hệ thống trả về link PDF/EPUB đầy đủ để đọc
- **🔄 Tương thích**: Hoạt động giống API upload trực tiếp, chỉ khác bước nén

## 1. Chuẩn bị file ZIP

### Cấu trúc ZIP yêu cầu:
ZIP chỉ chứa **1 file PDF hoặc EPUB** bên trong:

```
ebook.zip
└── truyen_tranh_hay.pdf  (hoặc .epub)
```

### Quy tắc:
- ✅ ZIP chứa **duy nhất 1 file** PDF hoặc EPUB
- ✅ Tên file PDF/EPUB bên trong tùy ý (hệ thống sẽ đổi tên khi lưu)
- ✅ Hỗ trợ định dạng: `.pdf`, `.epub`
- ❌ Không được để nhiều file trong ZIP
- ❌ Không được để file khác ngoài PDF/EPUB

### Cách nén file:

**Windows:**
1. Click chuột phải vào file PDF/EPUB
2. Chọn **Send to** → **Compressed (zipped) folder**
3. Đổi tên file ZIP (tùy chọn)

**Mac:**
1. Click chuột phải vào file PDF/EPUB
2. Chọn **Compress "filename.pdf"**

**Linux:**
```bash
zip ebook.zip truyen_tranh.pdf
```

**Python:**
```python
import zipfile

# Nén PDF vào ZIP
with zipfile.ZipFile('ebook.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('truyen_tranh.pdf', 'truyen_tranh.pdf')
```

### So sánh dung lượng:
- **PDF gốc**: 50 MB
- **ZIP (compression)**: ~35 MB (giảm 30%)
- **Upload nhanh hơn**: 30-70% tùy file

## 2. API Endpoints

### 2.1. Upload Ebook ZIP (Admin only)

**Endpoint:** `POST /api/rental/books/{bookId}/upload-zip`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request:**
- `bookId`: GUID của sách (trong URL)
- `file`: File ZIP chứa PDF hoặc EPUB bên trong

**Response (Success):**
```json
{
  "success": true,
  "message": "Upload thành công. Đã giảm 35% dung lượng khi upload",
  "originalFileName": "truyen_tranh_hay.pdf",
  "originalSize": 52428800,      // 50 MB (sau khi extract)
  "compressedSize": 34078720,    // 32.5 MB (file ZIP đã upload)
  "compressionRatio": 35.00      // Tiết kiệm 35%
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Không tìm thấy file PDF hoặc EPUB trong ZIP",
  "originalFileName": "",
  "originalSize": 0,
  "compressedSize": 0,
  "compressionRatio": 0
}
```

**Swagger UI:**
1. Chọn endpoint `POST /api/rental/books/{bookId}/upload-zip`
2. Click **Try it out**
3. Nhập `bookId` (GUID của sách)
4. Click **Choose File** và chọn file ZIP (chứa PDF/EPUB)
5. Click **Execute**
6. Xem kết quả: message cho biết đã tiết kiệm bao nhiêu % dung lượng

### 2.2. Lấy link đọc Ebook (User có subscription)

**Endpoint:** `GET /api/rental/books/{bookId}/access-link`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "bookId": "12345678-1234-1234-1234-123456789abc",
  "bookTitle": "Truyện tranh hay",
  "ebookUrl": "http://localhost:9000/ebook-files/12345678...pdf?X-Amz-Algorithm=...",
  "fileType": "PDF",
  "expiresAt": "2024-11-18T10:30:00Z",
  "message": "Link đọc ebook có hiệu lực trong 10 phút"
}
```

**Lưu ý:**
- User phải có gói thuê (subscription) còn hạn
- Pre-signed URL có hiệu lực **10 phút**
- Sau 10 phút cần gọi lại API để lấy URL mới
- **URL trỏ đến file PDF/EPUB đầy đủ** (không phải ảnh từng trang)

## 3. Luồng sử dụng

### Admin upload ebook:

**Option 1: Upload trực tiếp (chậm hơn)**
```
POST /api/rental/books/{bookId}/upload
Body: file = truyen_tranh.pdf (50 MB)
→ Tốc độ: Chậm, tốn băng thông
```

**Option 2: Upload qua ZIP (nhanh hơn 30-70%) - KHUYÊN DÙNG**
```
1. Nén PDF vào ZIP: truyen_tranh.pdf → ebook.zip (35 MB)
2. POST /api/rental/books/{bookId}/upload-zip
3. Body: file = ebook.zip
4. Hệ thống:
   - Nhận file ZIP (35 MB) → Nhanh hơn
   - Extract PDF ra (50 MB)
   - Lưu PDF vào MinIO với tên: {bookId}.pdf
   - Trả về thông báo: "Đã giảm 35% dung lượng khi upload"
```

### User đọc ebook:
1. User mua gói thuê (subscription)
2. Login với tài khoản User
3. Gọi API `GET /api/rental/books/{bookId}/access-link`
4. Hệ thống sẽ:
   - Kiểm tra subscription còn hạn
   - Tạo Pre-signed URL cho file PDF/EPUB
   - Trả về URL (valid 10 phút)
5. **Mobile/Web app mở PDF viewer với URL đã có**
6. User đọc **full truyện tranh** trong PDF
7. Sau 10 phút, app gọi lại API để refresh URL

## 4. Mobile/Web App Integration

### React Native với PDF Viewer:
```javascript
import Pdf from 'react-native-pdf';

// Lấy link PDF
const getEbookLink = async (bookId) => {
  const response = await fetch(
    `http://localhost:5276/api/rental/books/${bookId}/access-link`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    }
  );
  
  const data = await response.json();
  return data.ebookUrl; // Pre-signed URL tới file PDF
};

// Component đọc ebook
const EbookReader = ({ bookId }) => {
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    loadPdf();
  }, [bookId]);

  const loadPdf = async () => {
    const url = await getEbookLink(bookId);
    setPdfUrl(url);
    
    // Refresh URL sau 9 phút (trước khi hết hạn 10 phút)
    setTimeout(loadPdf, 9 * 60 * 1000);
  };

  return (
    <View style={{ flex: 1 }}>
      <Pdf
        source={{ uri: pdfUrl }}
        style={{ flex: 1 }}
        onLoadComplete={(numberOfPages) => {
          console.log(`Loaded PDF with ${numberOfPages} pages`);
        }}
        onError={(error) => {
          console.error('PDF error:', error);
        }}
      />
    </View>
  );
};
```

### Flutter với PDF Viewer:
```dart
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:http/http.dart' as http;

// Lấy link PDF
Future<String> getEbookLink(String bookId) async {
  final response = await http.get(
    Uri.parse('http://localhost:5276/api/rental/books/$bookId/access-link'),
    headers: {'Authorization': 'Bearer $userToken'},
  );
  
  final data = json.decode(response.body);
  return data['ebookUrl'];
}

// Widget đọc ebook
class EbookReader extends StatefulWidget {
  final String bookId;
  
  @override
  _EbookReaderState createState() => _EbookReaderState();
}

class _EbookReaderState extends State<EbookReader> {
  String pdfUrl = '';

  @override
  void initState() {
    super.initState();
    loadPdf();
  }

  void loadPdf() async {
    final url = await getEbookLink(widget.bookId);
    setState(() => pdfUrl = url);
    
    // Refresh sau 9 phút
    Future.delayed(Duration(minutes: 9), loadPdf);
  }

  @override
  Widget build(BuildContext context) {
    return PDFView(
      filePath: pdfUrl,
      enableSwipe: true,
      swipeHorizontal: true,
      autoSpacing: true,
      pageFling: true,
    );
  }
}
```

### Web App với PDF.js:
```javascript
// Lấy link PDF
const getEbookLink = async (bookId) => {
  const response = await fetch(
    `http://localhost:5276/api/rental/books/${bookId}/access-link`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    }
  );
  
  const data = await response.json();
  return data.ebookUrl;
};

// Hiển thị PDF trong iframe
const EbookReader = ({ bookId }) => {
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    loadPdf();
  }, [bookId]);

  const loadPdf = async () => {
    const url = await getEbookLink(bookId);
    setPdfUrl(url);
    
    // Refresh URL sau 9 phút
    setTimeout(loadPdf, 9 * 60 * 1000);
  };

  return (
    <iframe
      src={pdfUrl}
      width="100%"
      height="600px"
      title="Ebook Reader"
    />
  );
};
```

## 5. Testing với Postman

### Upload ZIP:
1. Method: `POST`
2. URL: `http://localhost:5276/api/rental/books/{bookId}/upload-zip`
3. Headers: 
   - `Authorization: Bearer <admin_token>`
4. Body: 
   - Type: `form-data`
   - Key: `file`
   - Type: `File`
   - Value: Chọn file ZIP (chứa PDF/EPUB)

### Get Ebook Link:
1. Method: `GET`
2. URL: `http://localhost:5276/api/rental/books/{bookId}/access-link`
3. Headers:
   - `Authorization: Bearer <user_token>`

## 6. Storage trong MinIO

**Bucket:** `ebook-files`

**Structure:**
```
ebook-files/
├── {bookId-1}.pdf      (File PDF sau khi extract từ ZIP)
├── {bookId-2}.epub     (File EPUB sau khi extract từ ZIP)
├── {bookId-3}.pdf
└── ...
```

- Mỗi sách có 1 file PDF hoặc EPUB với tên là `{bookId}.pdf` hoặc `{bookId}.epub`
- File được lưu sau khi extract từ ZIP
- User truy cập thông qua Pre-signed URL có thời hạn 10 phút

## 7. Security & Performance

### Security:
- ✅ Pre-signed URLs tự động expire sau 10 phút
- ✅ Yêu cầu authentication (JWT token)
- ✅ Kiểm tra subscription còn hạn
- ✅ Admin role required để upload
- ✅ File PDF/EPUB không public trực tiếp

### Performance:
- ✅ **Upload nhanh hơn 30-70%** nhờ ZIP compression
- ✅ Tiết kiệm băng thông khi upload nhiều file
- ✅ File được extract 1 lần và lưu sẵn trong MinIO
- ✅ User đọc full PDF, không cần load từng trang

## 8. So sánh 2 phương thức Upload

### Upload trực tiếp (không nén):
```
POST /api/rental/books/{bookId}/upload
```
- ✅ Đơn giản, không cần nén
- ❌ Upload chậm hơn
- ❌ Tốn băng thông hơn
- 💡 **Dùng khi:** Upload 1-2 file, mạng nhanh

### Upload qua ZIP (đã nén):
```
POST /api/rental/books/{bookId}/upload-zip
```
- ✅ **Upload nhanh hơn 30-70%**
- ✅ Tiết kiệm băng thông
- ✅ Phù hợp upload nhiều file
- ❌ Cần nén file trước
- 💡 **Dùng khi:** Upload nhiều file, mạng chậm, file lớn

### Kết quả giống nhau:
- Cả 2 phương thức đều lưu file PDF/EPUB vào MinIO
- User đọc bằng cách gọi: `GET /api/rental/books/{bookId}/access-link`
- Trả về Pre-signed URL tới file PDF/EPUB đầy đủ

## 9. Troubleshooting

### ZIP upload failed: "Không tìm thấy file PDF hoặc EPUB trong ZIP"
- ✅ Kiểm tra ZIP chứa đúng 1 file PDF hoặc EPUB
- ✅ Kiểm tra extension: `.pdf` hoặc `.epub` (lowercase)
- ❌ Không được để nhiều file trong ZIP
- ❌ Không được để file ảnh .jpg/.png

### Cannot get ebook link: "Bạn chưa có gói thuê hoặc gói thuê đã hết hạn"
- Kiểm tra user đã mua subscription chưa
- Kiểm tra subscription còn hạn (EndDate > Now)
- Kiểm tra subscription status = Active

### Cannot get ebook link: "Không tìm thấy file ebook"
- Kiểm tra bookId đã upload ebook chưa
- Kiểm tra MinIO service đang chạy
- Kiểm tra bucket `ebook-files` tồn tại

### Pre-signed URL expired:
- Gọi lại API `/access-link` để lấy URL mới
- Implement auto-refresh sau 9 phút trong app
- Không cache Pre-signed URL quá 10 phút

---

**Created by:** BookStore API
**Date:** 2024
