# 🔧 Fix Swagger Loading Forever (Trang trắng)

## ❌ Vấn đề
Swagger UI load mãi không hiển thị (trang trắng), không có lỗi trong console.

## 🔍 Nguyên nhân
**ExceptionMiddleware** được đặt **TRƯỚC Swagger middleware** trong pipeline.

```csharp
// ❌ SAI - Middleware này chặn request đến Swagger
app.UseMiddleware<ExceptionMiddleware>();  
app.UseSwagger();
app.UseSwaggerUI();
```

## ✅ Giải pháp

### Thứ tự middleware ĐÚNG:
```csharp
// 1. Swagger FIRST (Development only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookStore API V1");
        c.RoutePrefix = "swagger";
    });
}

// 2. CORS
app.UseCors("AllowFrontend");

// 3. Exception Middleware (AFTER Swagger)
app.UseMiddleware<ExceptionMiddleware>();

// 4. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// 5. Map Controllers (LAST)
app.MapControllers();
```

## 📋 Quy tắc thứ tự middleware trong ASP.NET Core

```
1. Exception/Error Handling (EXCEPT Swagger needs to be before it)
2. Static Files (nếu có)
3. Swagger (Development only) ← PHẢI TRƯỚC Exception Middleware
4. CORS
5. Authentication
6. Authorization  
7. Custom Middlewares
8. Endpoint Routing (MapControllers)
```

## 🚀 Rebuild Docker sau khi sửa

```bash
# Stop container hiện tại
docker stop bookstore-api

# Rebuild với code mới
cd docker
docker-compose up -d --build bookstore-api

# Đợi 10-20 giây để container khởi động

# Check logs
docker logs bookstore-api --tail 30

# Check container running
docker ps
```

## 🧪 Test Swagger

### Cách 1: Browser
```
http://localhost:5276/swagger
```
- Nếu vẫn load mãi → Hard refresh: **Ctrl + Shift + R** (hoặc Ctrl + F5)
- Clear browser cache nếu cần

### Cách 2: Test swagger.json endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost:5276/swagger/v1/swagger.json" | Select-Object StatusCode
```
- Nếu trả về **200 OK** → Swagger đang hoạt động
- Nếu timeout → Container chưa khởi động xong hoặc có lỗi

### Cách 3: Check trong container
```bash
docker exec bookstore-api curl -s http://localhost:8080/swagger/index.html | head -20
```

## 💡 Các vấn đề thường gặp khác

### 1. Swagger generate chậm (nhiều controllers)
**Triệu chứng:** Trang load lâu (30-60 giây)
**Giải pháp:** 
- Bình thường, đợi load xong
- Hoặc giảm số controllers/endpoints trong Swagger

### 2. Browser cache
**Triệu chứng:** Sau khi sửa code, Swagger vẫn hiển thị như cũ
**Giải pháp:**
- Hard refresh: Ctrl + Shift + R
- Hoặc mở Incognito mode

### 3. CORS error trong Swagger
**Triệu chứng:** Swagger UI hiển thị nhưng không gọi được API
**Giải pháp:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5276",    // ← Thêm origin của Swagger
            "https://localhost:5276"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

### 4. FileUploadOperationFilter missing
**Triệu chứng:** Upload file endpoints không hiển thị đúng trong Swagger
**Giải pháp:**
```csharp
builder.Services.AddSwaggerGen(c =>
{
    // ... other config
    c.OperationFilter<FileUploadOperationFilter>();  // ← Thêm dòng này
});
```

## 📝 Checklist sau khi sửa

- [ ] Program.cs: Swagger đặt TRƯỚC Exception Middleware
- [ ] Program.cs: CORS có origin của Swagger
- [ ] Program.cs: FileUploadOperationFilter đã thêm
- [ ] Docker container đã rebuild
- [ ] Container đang running (docker ps)
- [ ] Logs không có lỗi (docker logs bookstore-api)
- [ ] Browser đã clear cache
- [ ] Swagger UI hiển thị danh sách APIs
- [ ] Test upload file trong Swagger OK

## ✅ Kết quả mong đợi

Sau khi sửa và rebuild:
1. Truy cập http://localhost:5276/swagger
2. Swagger UI hiển thị **ngay lập tức** (< 5 giây)
3. Thấy danh sách tất cả controllers và endpoints
4. Upload file hoạt động bình thường
5. Authenticate với JWT token OK
6. Test APIs thành công

---

**Note:** Nếu vẫn không được sau khi đã sửa theo hướng dẫn, hãy:
1. Restart Docker daemon
2. Xóa image cũ: `docker rmi docker-bookstore-api`
3. Rebuild lại: `docker-compose up -d --build`
4. Check logs chi tiết: `docker logs bookstore-api --follow`
