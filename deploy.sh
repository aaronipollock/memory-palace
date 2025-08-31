#!/bin/bash

echo "🚀 Memory Palace Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo-name.git"
    exit 1
fi

echo "✅ Git repository found"

# Check for required files
echo "📋 Checking required files..."

if [ ! -f "server/render.yaml" ]; then
    echo "❌ render.yaml not found in server directory"
    exit 1
fi

if [ ! -f "server/package.json" ]; then
    echo "❌ package.json not found in server directory"
    exit 1
fi

if [ ! -f "client/package.json" ]; then
    echo "❌ package.json not found in client directory"
    exit 1
fi

echo "✅ All required files found"

# Check environment variables
echo "🔧 Environment Variables Checklist:"
echo "   Make sure you have the following ready:"
echo "   - MONGODB_URI (MongoDB Atlas connection string)"
echo "   - JWT_SECRET (32+ character secret key)"
echo "   - STABILITY_API_KEY (Stability AI API key)"
echo ""

# Build test
echo "🔨 Testing build process..."

cd client
if npm run build; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo ""
echo "🎯 Deployment Steps:"
echo "==================="
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to Render Dashboard:"
echo "   https://dashboard.render.com"
echo ""
echo "3. Create New Blueprint Instance:"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will create both services automatically"
echo ""
echo "4. Set Environment Variables:"
echo "   - Go to your backend service"
echo "   - Add the environment variables listed above"
echo ""
echo "5. Update Frontend API URL:"
echo "   - Go to your frontend service"
echo "   - Update REACT_APP_API_URL to your backend URL"
echo ""
echo "6. Test your deployment:"
echo "   - Visit your frontend URL"
echo "   - Try the demo functionality"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Good luck with your deployment!"
