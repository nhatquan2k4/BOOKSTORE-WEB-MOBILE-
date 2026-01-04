# BookStore Docker Setup

## Prerequisites
- Docker Desktop installed
- Docker Compose
- Gemini API Key (for ChatBot feature)

## Quick Start

### 1. Configure Gemini API Key

Create or edit the `.env` file in this directory:

```bash
# .env file
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

**How to get Gemini API Key:**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it into the `.env` file

### 2. Start Services

Start all services:
```bash
docker compose -f docker-compose.local.yml up -d
```

Check service status:
```bash
docker compose -f docker-compose.local.yml ps
```

View logs:
```bash
docker compose -f docker-compose.local.yml logs -f bookstore-api
```

### 3. Stop Services

```bash
docker compose -f docker-compose.local.yml down
```

To remove volumes as well:
```bash
docker compose -f docker-compose.local.yml down -v
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| SQL Server | 1433 | Database server |
| MinIO | 9000 | Object storage (images, files) |
| MinIO Console | 9001 | MinIO admin interface |
| Nginx | 8081 | Reverse proxy for MinIO |
| BookStore API | 5276 | Main API backend |

## Accessing Services

- **API**: http://localhost:5276
- **API Swagger**: http://localhost:5276/swagger
- **MinIO Console**: http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin123`

## Database Connection

**Connection String:**
```
Server=localhost,1433;Database=BookStore;User Id=bookstoreUser;Password=BookstorePass1@;TrustServerCertificate=True
```

**SA Password:**
```
YourStrong@Password123
```

## Troubleshooting

### Port Already in Use

If you get "port is already in use" error:

**Windows:**
```powershell
# Find process using port (e.g., 8081)
netstat -ano | findstr :8081

# Kill process by PID
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find process using port
lsof -i :8081

# Kill process
kill -9 <PID>
```

### ChatBot Returns 500 Error

This means Gemini API key is not set or invalid:

1. Check `.env` file exists in `BE/docker/` directory
2. Verify `GEMINI_API_KEY` is set correctly
3. Restart services:
   ```bash
   docker compose -f docker-compose.local.yml down
   docker compose -f docker-compose.local.yml up -d
   ```

### Database Connection Failed

1. Check SQL Server is healthy:
   ```bash
   docker logs bookstore-sqlserver
   ```

2. Restart SQL Server container:
   ```bash
   docker restart bookstore-sqlserver
   ```

### MinIO Access Denied

1. Check MinIO is healthy:
   ```bash
   docker logs bookstore-minio
   ```

2. Verify buckets were created:
   ```bash
   docker logs bookstore-minio-init
   ```

## Environment Variables

All environment variables can be set in `.env` file:

```bash
# Gemini AI
GEMINI_API_KEY=your-key-here

# Add more as needed
```

## Rebuilding API

If you made code changes:

```bash
# Rebuild and restart API only
docker compose -f docker-compose.local.yml up -d --build bookstore-api
```

## Cleanup

Remove all containers, networks, volumes:
```bash
docker compose -f docker-compose.local.yml down -v --remove-orphans
```

## Support

For issues, check:
1. Docker logs: `docker compose logs -f`
2. API health: http://localhost:5276/health
3. Database connection in appsettings.json
