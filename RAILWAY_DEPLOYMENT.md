# Railway Deployment Guide (Alternative to Render)

Railway is a great alternative to Render with **no spin-down** and faster cold starts!

## Why Railway?

✅ **No spin-down** - Your app stays running  
✅ **Fast cold starts** - No 30-60 second delays  
✅ **Generous free tier** - $5/month usage  
✅ **Easy deployment** - Simple GitHub integration  
✅ **Custom domains** - Available on free tier  

## Step 1: Deploy to Railway

### 1.1 Sign Up
1. Go to [Railway.app](https://railway.app/)
2. Sign up with your GitHub account
3. Create a new project

### 1.2 Deploy Your Backend
1. Click "Deploy from GitHub repo"
2. Select your repository
3. Set the **Root Directory** to: `dashboard/backend`
4. Railway will automatically detect it's a Node.js app

### 1.3 Configure Environment Variables
In your Railway project settings, add these variables:

```
JWT_SECRET=your-super-secret-jwt-key-here
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_OWNER=Reynold29
GITHUB_REPO=csi-hymns-vault
USERS_JSON=[{"username":"admin","password":"your-password","role":"admin"}]
```

### 1.4 Get Your Railway URL
Railway will provide a URL like:
`https://your-app-name-production.up.railway.app`

## Step 2: Update Frontend Configuration

### 2.1 Update config.js
```javascript
// dashboard/frontend/src/config.js
const config = {
  development: {
    apiUrl: 'http://localhost:5001'
  },
  production: {
    apiUrl: 'https://your-app-name-production.up.railway.app' // Your Railway URL
  }
};
```

### 2.2 Update CORS in Backend
```javascript
// dashboard/backend/server.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://reyziecrafts.netlify.app', // Your Netlify URL
  'https://your-custom-domain.com' // If you have one
];
```

## Step 3: Custom Domain (Optional)

1. In Railway project settings, go to "Domains"
2. Add your custom domain
3. Update CORS origins in your backend
4. Update frontend config with your custom domain

## Railway vs Render Comparison

| Feature | Railway | Render (Free) |
|---------|---------|---------------|
| Spin-down | ❌ No | ✅ Yes (15 min) |
| Cold start | ⚡ Fast | 🐌 Slow (30-60s) |
| Free tier | $5/month usage | 750 hours/month |
| Custom domains | ✅ Yes | ❌ No |
| Setup difficulty | 🟢 Easy | 🟢 Easy |

## Other Alternatives

### Fly.io (Also Great)
- **No spin-down**
- **Global deployment**
- **Generous free tier**
- **More complex setup**

### Heroku
- **No free tier** ($7/month minimum)
- **Very reliable**
- **Great ecosystem**

### DigitalOcean App Platform
- **$5/month minimum**
- **Very reliable**
- **Good performance**

## Migration from Render

If you want to migrate from Render to Railway:

1. Deploy to Railway following the steps above
2. Update your frontend configuration
3. Test everything works
4. Delete your Render service

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Railway | $5/month usage | Pay as you go |
| Render | 750 hours/month | $7/month |
| Fly.io | 3 shared VMs | $1.94/month |
| Heroku | None | $7/month |
| DigitalOcean | None | $5/month |

## Recommendation

**For your use case, I recommend Railway** because:
- No spin-down means better user experience
- Fast cold starts
- Generous free tier
- Easy deployment
- Custom domains available

---

**Ready to deploy?** Follow the steps above and enjoy a much better user experience! 🚂 