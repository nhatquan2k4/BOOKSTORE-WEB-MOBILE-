# MinIO URL Configuration Guide

## 🎯 Vấn đề

Khi lưu file vào MinIO, bạn cần lưu URL vào database để frontend/mobile có thể truy cập ảnh.

## ✅ Giải pháp

### **1. Cấu hình appsettings.json**

```json
{
  "MinIO": {
    "Endpoint": "minio:9000",           // Internal endpoint - Backend upload/download
    "PublicEndpoint": "http://localhost/storage",  // Public URL - Lưu vào DB
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin123",
    "BucketName": "bookstore-images",
    "UseSSL": false
  }
}
```

**Development:**
```json
"PublicEndpoint": "http://localhost/storage"
```

**Production:**
```json
"PublicEndpoint": "https://yourdomain.com/storage"
```

### **2. Service Code**

```csharp
public class MinIOService : IMinIOService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;
    private readonly string _publicEndpoint;

    public MinIOService(IConfiguration config)
    {
        var endpoint = config["MinIO:Endpoint"];
        var accessKey = config["MinIO:AccessKey"];
        var secretKey = config["MinIO:SecretKey"];
        _bucketName = config["MinIO:BucketName"];
        _publicEndpoint = config["MinIO:PublicEndpoint"]; // ⭐ Thêm này
        
        _minioClient = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(accessKey, secretKey)
            .Build();
    }

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        
        // Upload qua internal endpoint
        using var stream = file.OpenReadStream();
        await _minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(fileName)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(file.ContentType));
        
        // ⭐ Trả về public URL để lưu vào DB
        var publicUrl = $"{_publicEndpoint}/{_bucketName}/{fileName}";
        // Ví dụ: http://localhost/storage/bookstore-images/abc123.jpg
        
        return publicUrl;
    }

    public async Task DeleteFileAsync(string fileUrl)
    {
        // Extract filename từ URL
        var uri = new Uri(fileUrl);
        var fileName = Path.GetFileName(uri.LocalPath);
        
        await _minioClient.RemoveObjectAsync(new RemoveObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(fileName));
    }
}
```

### **3. Controller Example**

```csharp
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IMinIOService _minioService;
    private readonly IBookRepository _bookRepo;

    [HttpPost]
    public async Task<IActionResult> CreateBook([FromForm] CreateBookDto dto)
    {
        // Upload image và nhận public URL
        var imageUrl = await _minioService.UploadFileAsync(dto.CoverImage);
        
        // Lưu URL vào database
        var book = new Book
        {
            Title = dto.Title,
            CoverImageUrl = imageUrl  // http://localhost/storage/bookstore-images/abc.jpg
        };
        
        await _bookRepo.AddAsync(book);
        return Ok(book);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBook(int id)
    {
        var book = await _bookRepo.GetByIdAsync(id);
        
        // Frontend nhận được:
        // {
        //   "title": "Book Title",
        //   "coverImageUrl": "http://localhost/storage/bookstore-images/abc.jpg"
        // }
        return Ok(book);
    }
}
```

## 🔄 Flow hoàn chỉnh

### **Upload:**
```
1. Client → API: Upload file
2. API → MinIO (minio:9000): Upload qua internal endpoint
3. API → Database: Lưu public URL (http://localhost/storage/...)
4. API → Client: Trả về book với imageUrl
```

### **Display:**
```
1. Frontend request: GET /api/books/1
2. API → Database: Lấy book (có coverImageUrl)
3. API → Frontend: Trả về book
4. Frontend: <img src="http://localhost/storage/bookstore-images/abc.jpg">
5. Browser → Nginx: GET /storage/bookstore-images/abc.jpg
6. Nginx → MinIO: Proxy request
7. MinIO → Nginx → Browser: Trả về ảnh
```

## 🌐 Environment-specific URLs

### **appsettings.Development.json**
```json
{
  "MinIO": {
    "Endpoint": "minio:9000",
    "PublicEndpoint": "http://localhost/storage"
  }
}
```

### **appsettings.Production.json**
```json
{
  "MinIO": {
    "Endpoint": "minio:9000",
    "PublicEndpoint": "https://api.yourdomain.com/storage"
  }
}
```

### **Docker Compose - Environment Variables**
```yaml
bookstore-api:
  environment:
    - MinIO__Endpoint=minio:9000
    - MinIO__PublicEndpoint=http://localhost/storage  # Dev
    # - MinIO__PublicEndpoint=https://api.yourdomain.com/storage  # Prod
```

## 📱 Frontend Usage

### **React/Next.js**
```jsx
function BookCard({ book }) {
  return (
    <img 
      src={book.coverImageUrl}  // http://localhost/storage/bookstore-images/abc.jpg
      alt={book.title}
    />
  );
}
```

### **React Native**
```jsx
<Image 
  source={{ uri: book.coverImageUrl }}
  style={{ width: 200, height: 300 }}
/>
```

## ✅ URL Examples

### **Development:**
```
Backend upload qua: minio:9000
Lưu vào DB: http://localhost/storage/bookstore-images/abc.jpg
Frontend hiển thị: http://localhost/storage/bookstore-images/abc.jpg
```

### **Production:**
```
Backend upload qua: minio:9000 (internal)
Lưu vào DB: https://api.yourdomain.com/storage/bookstore-images/abc.jpg
Frontend hiển thị: https://api.yourdomain.com/storage/bookstore-images/abc.jpg
```

## 🎯 Lợi ích

✅ Backend upload nhanh qua internal network
✅ Frontend/Mobile truy cập qua public URL
✅ Nginx cache static files (giảm load MinIO)
✅ Có thể thêm CDN sau này
✅ Dễ migrate sang S3/CloudFront

## 🔒 Security (Production)

### **Read-only public buckets:**
```csharp
// Chỉ cho phép đọc public qua nginx
// Upload phải qua API (có authentication)
```

### **Nginx rate limiting:**
```nginx
location /storage/ {
    limit_req zone=storage_limit burst=20;
    # ... rest of config
}
```

### **Signed URLs (nâng cao):**
```csharp
// Tạo temporary signed URL (expire sau 1h)
var signedUrl = await _minioClient.PresignedGetObjectAsync(
    new PresignedGetObjectArgs()
        .WithBucket(bucketName)
        .WithObject(fileName)
        .WithExpiry(3600)
);
// Lưu: https://minio.com/bucket/file?signature=...
```

## 📝 Summary

**Không cần proxy MinIO cho upload/download từ backend**
**CẦN proxy MinIO cho frontend/mobile truy cập ảnh**

Cấu hình:
- Backend: `Endpoint = minio:9000` (internal)
- Database: `PublicEndpoint = http://localhost/storage` (public)
- Nginx: Proxy `/storage/` → `minio:9000`
