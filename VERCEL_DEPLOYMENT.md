# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your project should be pushed to GitHub
3. **Environment Variables**: Set up the following in Vercel dashboard:

### Required Environment Variables

Add these in your Vercel project settings under "Environment Variables":

```
# Database
MONGO_URI=mongodb+srv://your-connection-string

# JWT Authentication
JWT_SECRET=your-48-byte-hex-secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=dsfwyovxr
CLOUDINARY_API_KEY=983834196338784
CLOUDINARY_API_SECRET=tTA8r1tWAirMcBqNXZU8ciuXeoM

# Email (optional - for order confirmations)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Production settings
NODE_ENV=production
```

## Deployment Steps

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Select "Other" (we have custom config)
   - **Root Directory**: Leave empty (project root)
   - **Build Command**: Leave default
   - **Output Directory**: Leave default

### Step 2: Configure Build Settings

The `vercel.json` file in your project root handles the configuration automatically. It:
- Builds the frontend as a static site
- Deploys backend functions to Vercel Functions
- Routes API calls to backend functions
- Uses `--no-optional` flag to avoid Rollup dependency issues

### Step 3: Set Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add all the required environment variables listed above
3. Make sure they're set for "Production", "Preview", and "Development" environments

### Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (may take 5-10 minutes)
3. Once deployed, you'll get a `.vercel.app` URL

### Step 5: Configure Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Failures

If you encounter build errors:

1. **Rollup Optional Dependency Issue**: The `vercel.json` includes `--no-optional` flag to fix this
2. **Missing Dependencies**: Check that all required environment variables are set
3. **Build Logs**: Check the "Functions" tab in Vercel dashboard for detailed error logs

### Common Issues

1. **MongoDB Connection**: Ensure `MONGO_URI` is correct and accessible from Vercel
2. **Cloudinary Uploads**: Verify Cloudinary credentials are correct
3. **Email Sending**: SMTP settings are optional - app works without them
4. **WebSocket Support**: Vercel Functions don't support persistent WebSockets. For production, consider using a WebSocket service like Pusher or Socket.io with a hosted solution.

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Authentication works (login/register)
- [ ] Profile management works
- [ ] Image uploads work (Cloudinary)
- [ ] Orders can be placed
- [ ] Email confirmations are sent (if SMTP configured)
- [ ] Theme toggles work
- [ ] Account deletion works

## Production Notes

- **WebSockets**: Vercel serverless functions don't support persistent connections. The WebSocket code will work in development but may need adaptation for production (consider Pusher, Socket.io, or similar services).

- **File Uploads**: Cloudinary integration handles image uploads reliably.

- **Database**: MongoDB Atlas works well with Vercel deployments.

- **Performance**: The app is optimized with Vite build and should load quickly.

## Updating Your Deployment

1. Push changes to your GitHub repository
2. Vercel will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger a deployment from the Vercel dashboard

## Cost Considerations

- **Free Tier**: Suitable for development and low-traffic sites
- **Hobby Plan**: $7/month for higher limits
- **Pro/Enterprise**: For high-traffic applications

Monitor your usage in the Vercel dashboard to understand costs.