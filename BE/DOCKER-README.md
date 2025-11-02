# BookStore Docker Setup

## Cấu trúc
- **Dockerfile**: Build image cho BookStore API (.NET 8.0)
- **docker-compose.yml**: Orchestrate API + SQL Server 2022

## Yêu cầu
- Docker Desktop
- Docker Compose

## Cách sử dụng

### 1. Build và chạy tất cả services
```bash
cd BE
docker-compose up --build
```

### 2. Chỉ chạy (không build lại)
```bash
docker-compose up
```

### 3. Chạy ở chế độ background
```bash
docker-compose up -d
```

### 4. Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Chỉ API
docker-compose logs -f bookstore-api

# Chỉ SQL Server
docker-compose logs -f sqlserver
```

### 5. Dừng services
```bash
docker-compose down
```

### 6. Dừng và xóa volumes (xóa database)
```bash
docker-compose down -v
```

## Thông tin Services

### SQL Server
- **Container**: bookstore-sqlserver
- **Port**: 1433
- **SA Password**: YourStrong@Password123
- **Database**: ChuyenDeTongHop
- **Version**: SQL Server 2022

### BookStore API
- **Container**: bookstore-api
- **Port**: 5276 (host) -> 8080 (container)
- **URL**: http://localhost:5276
- **Swagger**: http://localhost:5276/swagger
- **Framework**: .NET 8.0

## Connection String
```
Server=sqlserver;Database=ChuyenDeTongHop;User Id=sa;Password=YourStrong@Password123;MultipleActiveResultSets=true;TrustServerCertificate=True
```

## Kết nối SQL Server từ máy local
- **Server**: localhost,1433
- **Username**: sa
- **Password**: YourStrong@Password123
- **Database**: ChuyenDeTongHop

## Chạy Migration (nếu có)
```bash
# Exec vào container API
docker exec -it bookstore-api bash

# Chạy migration
dotnet ef database update
```

## Troubleshooting

### API không kết nối được SQL Server
- Kiểm tra healthcheck: `docker-compose ps`
- Xem logs SQL Server: `docker-compose logs sqlserver`
- Đảm bảo SQL Server đã ready trước khi API start

### Build lỗi
- Xóa cache: `docker-compose build --no-cache`
- Kiểm tra .dockerignore
- Đảm bảo tất cả .csproj files đều tồn tại

### Port conflict
- Đổi port trong docker-compose.yml:
  ```yaml
  ports:
    - "5277:8080"  # Thay 5276 thành port khác
  ```

## Bảo mật
     **QUAN TRỌNG**: 
- Đổi SA_PASSWORD trong production
- Không commit password vào Git
- Sử dụng Docker secrets hoặc environment variables file

## Performance Tips
- Multi-stage build để giảm kích thước image
- Health check đảm bảo SQL Server ready
- Volume persistence cho database
- Network isolation giữa services
