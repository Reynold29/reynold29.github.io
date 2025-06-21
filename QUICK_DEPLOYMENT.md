# Quick Deployment Checklist: Netlify + Railway

## 🚀 Ready to Deploy? Follow This Checklist!

### Backend (Railway) Setup

- [ ] **Railway Account**: Sign up at [railway.app](https://railway.app/)
- [ ] **Create Project**: New project → Deploy from GitHub repo
- [ ] **Select Repository**: Choose your GitHub repo
- [ ] **Set Root Directory**: `dashboard/backend`
- [ ] **Environment Variables**:
  - [ ] `JWT_SECRET=your-super-secret-jwt-key-here`
  - [ ] `GITHUB_TOKEN=your-github-personal-access-token`
  - [ ] `GITHUB_OWNER=Reynold29`
  - [ ] `GITHUB_REPO=csi-hymns-vault`
  - [ ] `USERS_JSON=[{"username":"admin","password":"your-password","role":"admin"}]`
- [ ] **Get Railway URL**: Copy the generated URL (e.g., `https://your-app-name-production.up.railway.app`)

### Frontend (Netlify) Setup

- [ ] **Netlify Account**: Sign up at [netlify.com](https://netlify.com/)
- [ ] **Create Site**: New site from Git
- [ ] **Select Repository**: Choose your GitHub repo
- [ ] **Build Settings**:
  - [ ] Base directory: `dashboard/frontend`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] **Environment Variables** (Optional):
  - [ ] `REACT_APP_API_URL=https://your-railway-url.up.railway.app`

### Configuration Updates

- [ ] **Update Frontend Config**: Edit `dashboard/frontend/src/config.js`
  ```javascript
  production: {
    apiUrl: 'https://your-railway-url.up.railway.app'
  }
  ```
- [ ] **Test Backend**: Visit your Railway URL to see the health check
- [ ] **Test Frontend**: Visit your Netlify URL and try logging in

### Testing Checklist

- [ ] **Backend Health**: Railway URL shows `{"status":"OK"}`
- [ ] **Frontend Loads**: Netlify URL loads without errors
- [ ] **Login Works**: Can log in with admin credentials
- [ ] **Hymns Load**: Can view hymns list
- [ ] **Keerthane Load**: Can view keerthane list
- [ ] **Edit Works**: Can edit and save songs
- [ ] **GitHub Sync**: Changes appear in your GitHub repo

### Troubleshooting

**If you see CORS errors:**
- Backend CORS is already configured for Netlify domains
- Check that your Railway URL is correct in frontend config

**If login fails:**
- Verify JWT_SECRET is set in Railway
- Check USERS_JSON format in Railway environment variables

**If songs don't load:**
- Verify GITHUB_TOKEN has repo permissions
- Check GITHUB_OWNER and GITHUB_REPO are correct

### Success Indicators

✅ **No spin-down delays** - App responds instantly  
✅ **Fast loading** - No 30-60 second waits  
✅ **Reliable service** - Backend stays running  
✅ **Easy updates** - Push to GitHub triggers auto-deploy  

---

**🎉 You're all set!** Your hymns management system is now live with:
- **Frontend**: Netlify (fast, reliable)
- **Backend**: Railway (no spin-down, fast cold starts)

Both services will automatically deploy when you push changes to GitHub! 