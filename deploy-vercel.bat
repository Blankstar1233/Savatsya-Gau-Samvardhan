@echo off
echo ========================================
echo Vercel Deployment Preparation Script
echo ========================================

echo Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo Vercel CLI is already installed.
)

echo.
echo Logging into Vercel...
vercel login

echo.
echo Setting up project...
vercel --prod

echo.
echo Deployment complete! Check your Vercel dashboard for the live URL.
echo.
echo Don't forget to set environment variables in Vercel dashboard:
echo - MONGO_URI
echo - JWT_SECRET
echo - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
echo - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (optional)
echo.
pause