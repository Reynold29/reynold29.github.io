#!/bin/bash

echo "🚀 Hymns Management System Deployment Setup"
echo "=========================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🚂 DEPLOY BACKEND TO RAILWAY:"
echo "   - Go to https://railway.app/"
echo "   - Create new project"
echo "   - Deploy from GitHub repo"
echo "   - Set Root Directory to: dashboard/backend"
echo "   - Railway will auto-detect Node.js and configure build/start commands"
echo ""
echo "2. 🔧 SET ENVIRONMENT VARIABLES IN RAILWAY:"
echo "   JWT_SECRET=your-super-secret-jwt-key-here"
echo "   GITHUB_TOKEN=your-github-personal-access-token"
echo "   GITHUB_OWNER=Reynold29"
echo "   GITHUB_REPO=csi-hymns-vault"
echo "   USERS_JSON=[{\"username\":\"admin\",\"password\":\"your-password\",\"role\":\"admin\"}]"
echo ""
echo "3. 🌐 DEPLOY FRONTEND TO NETLIFY:"
echo "   - Go to https://app.netlify.com/"
echo "   - Create new site from Git"
echo "   - Connect your GitHub repo"
echo "   - Set Base directory to: dashboard/frontend"
echo "   - Set Build command to: npm run build"
echo "   - Set Publish directory to: dist"
echo ""
echo "4. 🔗 UPDATE CONFIGURATION:"
echo "   - Update dashboard/frontend/src/config.js with your Railway URL"
echo "   - Backend CORS is already configured for Netlify domains"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Happy deploying!" 