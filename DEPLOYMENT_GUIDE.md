# Deployment Guide: Frontend (Netlify) + Backend (Render)

This guide will help you deploy your hymns management system with the frontend on Netlify and backend on Render.

## Prerequisites

1. GitHub repository with your code
2. Netlify account
3. Render account
4. GitHub Personal Access Token

## Step 1: Deploy Backend to Render

### 1.1 Prepare Your Backend

1. Make sure your backend code is in the `dashboard/backend/` directory
2. Ensure `package.json` has the correct dependencies and scripts
3. Verify your `server.js` has proper CORS configuration

### 1.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `hymns-backend` (or your preferred name)
   - **Root Directory**: `dashboard/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

### 1.3 Set Environment Variables

In your Render service settings, add these environment variables:

```
JWT_SECRET=your-super-secret-jwt-key-here
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_OWNER=Reynold29
GITHUB_REPO=csi-hymns-vault
USERS_JSON=[{"username":"admin","password":"your-password","role":"admin"}]
```

**Important Notes:**
- Generate a strong JWT_SECRET (you can use a password generator)
- Create a GitHub Personal Access Token with repo permissions
- Update the USERS_JSON with your actual admin credentials
- The PORT will be automatically set by Render

### 1.4 Get Your Backend URL

After deployment, Render will provide a URL like:
`https://your-backend-name.onrender.com`

## Step 2: Deploy Frontend to Netlify

### 2.1 Update Frontend Configuration

1. Update `dashboard/frontend/src/config.js`:
   ```javascript
   production: {
     apiUrl: 'https://your-backend-name.onrender.com' // Your actual Render URL
   }
   ```

2. Update `dashboard/backend/server.js` CORS origins:
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'http://localhost:3000',
     'https://your-netlify-app.netlify.app', // Your actual Netlify URL
     'https://your-custom-domain.com' // If you have a custom domain
   ];
   ```

### 2.2 Deploy to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure the build settings:
   - **Base directory**: `dashboard/frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 2.3 Set Environment Variables (Optional)

If you want to use environment variables for the API URL:

1. In Netlify site settings, go to "Environment variables"
2. Add: `REACT_APP_API_URL=https://your-backend-name.onrender.com`

## Step 3: Test Your Deployment

1. Visit your Netlify URL
2. Try logging in with your admin credentials
3. Test the hymns and keerthane functionality
4. Verify that edits are being saved to GitHub

## Step 4: Custom Domain (Optional)

### For Netlify:
1. Go to your site settings in Netlify
2. Navigate to "Domain management"
3. Add your custom domain
4. Update CORS origins in your backend

### For Render:
1. Go to your service settings in Render
2. Navigate to "Custom Domains"
3. Add your custom domain

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend CORS configuration includes your Netlify URL
2. **404 Errors**: Ensure your Netlify redirects are configured correctly
3. **Authentication Issues**: Verify your JWT_SECRET and user credentials
4. **GitHub Sync Issues**: Check your GitHub token permissions

### Debug Steps:

1. Check browser console for frontend errors
2. Check Render logs for backend errors
3. Verify environment variables are set correctly
4. Test API endpoints directly using tools like Postman

## Security Considerations

1. Use strong, unique passwords
2. Generate a secure JWT_SECRET
3. Limit GitHub token permissions to only what's needed
4. Consider using HTTPS for all communications
5. Regularly update dependencies

## Monitoring

1. Set up logging in your backend
2. Monitor Render service health
3. Set up Netlify form notifications if needed
4. Consider setting up error tracking (Sentry, etc.)

## Updates and Maintenance

1. Push changes to GitHub to trigger automatic deployments
2. Monitor your services for any issues
3. Keep dependencies updated
4. Regularly backup your data

---

**Your deployment is now complete!** 🎉

Your frontend will be accessible at your Netlify URL, and it will communicate with your backend on Render. 