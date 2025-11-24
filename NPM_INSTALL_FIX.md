# 🔧 NPM Install Troubleshooting Guide

## The Problem
`ENOTEMPTY: directory not empty` error when running `npm install`

## Root Cause
Node v22.14.0 + npm 10.9.2 + macOS file system can cause race conditions during install

## Solutions (Try in Order)

### Solution 1: Use Node 18 or 20 (Recommended)
```bash
# Switch to Node 18 (more stable)
nvm install 18
nvm use 18

cd client
rm -rf node_modules package-lock.json
npm install
```

### Solution 2: Use Yarn Instead
```bash
# Install yarn if you don't have it
npm install -g yarn

cd client
rm -rf node_modules package-lock.json
yarn install
```

### Solution 3: Install with Different Flags
```bash
cd client
rm -rf node_modules package-lock.json

# Try this
npm install --legacy-peer-deps --no-optional --prefer-offline
```

### Solution 4: Install Packages One at a Time
```bash
cd client
rm -rf node_modules

# Install core dependencies first
npm install react react-dom react-router-dom --legacy-peer-deps
npm install react-scripts --legacy-peer-deps
npm install tailwindcss autoprefixer postcss --legacy-peer-deps
# Then install the rest
npm install --legacy-peer-deps
```

### Solution 5: Use npm ci (if package-lock.json exists)
```bash
cd client
rm -rf node_modules
npm ci --legacy-peer-deps
```

### Solution 6: Manual Cleanup + Retry
```bash
cd client

# Kill all node processes
pkill -9 node

# Remove everything
rm -rf node_modules package-lock.json .npm

# Clear npm cache
npm cache clean --force

# Wait 5 seconds
sleep 5

# Try install again
npm install --legacy-peer-deps
```

### Solution 7: Check Disk Space
```bash
df -h .
# If disk is full, free up space
```

### Solution 8: Check File Permissions
```bash
cd client
ls -la node_modules 2>/dev/null | head -5
# If permission errors, try:
sudo chown -R $(whoami) node_modules
```

## Quick Test After Install
```bash
cd client
npm start
# Should start without errors
```

## If Nothing Works
1. **Use a different branch** that already has working node_modules
2. **Copy node_modules from another project** (same React version)
3. **Use Docker** to isolate the environment
4. **Report the issue** to npm with: `npm install --verbose > install.log 2>&1`

## Recommended: Use Node 18
This is the most reliable solution:
```bash
nvm install 18
nvm use 18
nvm alias default 18  # Make it default
cd client
npm install
```
