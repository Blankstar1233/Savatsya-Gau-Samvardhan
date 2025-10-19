# Docker Setup Guide

## Prerequisites
- Docker Desktop installed and running (Windows/Mac) or Docker Engine (Linux)
- Docker Compose installed (included with Docker Desktop)

## Environment Variables Setup

Before running with Docker, create a `.env` file at the project root (same level as `docker-compose.yml`):

```bash
# MongoDB Connection
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP (optional, for email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
FROM_EMAIL=no-reply@example.com
FROM_NAME=Savatsya Gau Samvardhan
```

## Running with Docker Compose

### 1. Build and start all services
```powershell
docker compose up --build
```

### 2. Run in detached mode (background)
```powershell
docker compose up --build -d
```

### 3. View logs
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### 4. Stop services
```powershell
docker compose down
```

### 5. Stop and remove volumes (clean slate)
```powershell
docker compose down -v
```

## Service Ports

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **MongoDB**: Internal (not exposed to host by default)
- **WebSocket**: ws://localhost:5000/ws

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"
**Solution**: Ensure Docker Desktop is running on Windows/Mac

### Issue: Frontend build fails with Rollup error
**Solution**: The Dockerfile uses `--no-optional` flag to avoid optional native deps. If issues persist:
```powershell
# Rebuild without cache
docker compose build --no-cache frontend
```

### Issue: Backend exits with "MONGO_URI not set"
**Solution**: Ensure `.env` file exists at project root with `MONGO_URI` set, or pass env vars:
```powershell
$env:MONGO_URI = 'your-mongo-uri'
docker compose up
```

### Issue: Images not uploading
**Solution**: Verify Cloudinary credentials are set in `.env` and containers have been restarted after adding them.

## Development Workflow with Docker

1. Make code changes in your editor
2. Rebuild specific service:
```powershell
docker compose up --build backend  # or frontend
```

3. For live development without Docker, see main README.md

## Production Deployment

For production, consider:
- Using managed services (MongoDB Atlas, Cloudinary)
- Setting environment variables via secrets manager (not .env)
- Using reverse proxy (NGINX) for SSL/TLS
- Scaling backend with multiple containers

## Health Checks

Check if services are healthy:
```powershell
docker compose ps
```

Test backend API:
```powershell
curl http://localhost:5000/api/auth/me
```

Test frontend:
```powershell
# Open in browser
start http://localhost:3000
```
