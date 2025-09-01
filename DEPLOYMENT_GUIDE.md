# 🚀 Render Deployment Guide - Memory Palace

## Prerequisites

1. **Render Account** - Sign up at [render.com](https://render.com)
2. **MongoDB Database** - Set up MongoDB Atlas (free tier)
3. **Stability AI API Key** - Get from [platform.stability.ai](https://platform.stability.ai)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with read/write permissions
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/memory-palace`)

## Step 2: Deploy Backend API (Manual)

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `aaronipollock/memory-palace`
   - Select the repository

2. **Configure Backend Service**
   - **Name**: `memory-palace-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: `server`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/memory-palace
   JWT_SECRET=your-super-secret-jwt-key-here
   STABILITY_API_KEY=your-stability-ai-api-key
   PORT=10000
   ```

## Step 3: Deploy Frontend (Manual)

1. **Create New Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository: `aaronipollock/memory-palace`

2. **Configure Frontend Service**
   - **Name**: `memory-palace-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Root Directory**: Leave empty (root)

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-service-name.onrender.com
   ```

## Step 4: Update Frontend API URL

After your backend is deployed, update the frontend environment variable:

1. Go to your frontend service in Render
2. Go to "Environment" tab
3. Update `REACT_APP_API_URL` to your actual backend URL
4. Redeploy the frontend

## Step 5: Test Your Deployment

1. **Test Backend Health**: Visit `https://your-backend-url.onrender.com/api/health`
2. **Test Frontend**: Visit your frontend URL
3. **Test Demo Login**: Try the demo functionality

## Environment Variables Reference

### Backend Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/memory-palace
JWT_SECRET=your-32-character-secret-key
STABILITY_API_KEY=your-stability-ai-api-key
PORT=10000
```

### Frontend Variables
```bash
REACT_APP_API_URL=https://your-backend-service-name.onrender.com
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in package.json
   - Check build logs in Render dashboard

2. **Database Connection Fails**
   - Verify MongoDB URI is correct
   - Check network access in MongoDB Atlas
   - Ensure database user has correct permissions

3. **API Calls Fail**
   - Verify REACT_APP_API_URL is correct
   - Check CORS settings
   - Verify environment variables are set

4. **Images Not Loading**
   - Check file permissions
   - Verify static file serving is configured
   - Check image paths in the application

### Debug Commands

```bash
# Check backend logs
# Go to Render Dashboard → Your Backend Service → Logs

# Check frontend build
# Go to Render Dashboard → Your Frontend Service → Logs

# Test API endpoints
curl https://your-backend-url.onrender.com/api/health
```

## Post-Deployment

1. **Set up Custom Domain** (Optional)
   - Go to your service settings
   - Add custom domain
   - Configure DNS records

2. **Set up Monitoring** (Optional)
   - Enable uptime monitoring
   - Set up error alerts
   - Monitor performance metrics

3. **Update Documentation**
   - Update README with live URLs
   - Update API documentation
   - Update user guide

## Security Checklist

- [ ] Environment variables are set (not in code)
- [ ] JWT secret is strong and unique
- [ ] MongoDB connection uses SSL
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Security headers are set
- [ ] HTTPS is enforced

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Optimize images
- [ ] Enable caching headers
- [ ] Monitor response times

---

## 🎉 Your Memory Palace is Live!

Once deployed, your application will be available at:
- **Frontend**: `https://memory-palace-frontend.onrender.com`
- **Backend API**: `https://memory-palace-api.onrender.com`

Share your creation with the world! 🌟
