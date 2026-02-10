# How to Start the Frontend

## 📋 Prerequisites

Before starting the frontend, ensure you have:

1. **Node.js 18+** installed
   - Check: `node --version`
   - Should show version 18 or higher

2. **npm** (comes with Node.js)
   - Check: `npm --version`

3. **Backend API running** (optional but recommended)
   - The frontend will work but won't fetch real data without the backend
   - Backend should be running on `http://localhost:8080`

## 🚀 Starting the Frontend

### Step 1: Navigate to Frontend Directory

```bash
cd frontend-glow-up-main
```

### Step 2: Install Dependencies (First Time Only)

If this is your first time running the frontend:

```bash
npm install
```

This will install all required packages. It may take a few minutes.

**Note:** You only need to run this once, or when `package.json` dependencies change.

### Step 3: Configure API URL (Optional)

If your backend is running on a different URL, create a `.env` file:

```bash
# Create .env file in frontend-glow-up-main directory
echo VITE_API_URL=http://localhost:8080 > .env
```

Or manually create `.env` file with:
```env
VITE_API_URL=http://localhost:8080
```

**Note:** If you don't create `.env`, it defaults to `http://localhost:8080`

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Open in Browser

The terminal will show output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

- **Automatically:** The browser may open automatically
- **Manually:** Open `http://localhost:3000` in your browser

## ✅ Verify It's Working

1. **Check Terminal Output:**
   - Should see "VITE ready" message
   - Should show local URL (usually `http://localhost:3000`)

2. **Check Browser:**
   - Should see the Transaction Fraud Detection dashboard
   - Should see "Transaction Generation" page

3. **Test Backend Connection:**
   - Try submitting a transaction
   - Check browser console (F12) for any errors
   - If backend is running, transactions should be saved

## 🛠️ Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🐛 Troubleshooting

### Error: "npm: command not found"

**Problem:** Node.js/npm is not installed or not in PATH.

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart terminal after installation
3. Verify: `node --version` and `npm --version`

### Error: "Port 3000 already in use"

**Problem:** Another application is using port 3000.

**Solution:**
- Vite will automatically use the next available port (3001, 3002, etc.)
- Check the terminal output for the actual URL
- Or stop the application using port 3000

### Error: "Cannot find module" or dependency errors

**Problem:** Dependencies not installed or corrupted.

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Frontend loads but shows "Failed to fetch" errors

**Problem:** Backend is not running or not accessible.

**Solution:**
1. Start the backend:
   ```bash
   cd transaction-api
   mvn spring-boot:run
   ```
2. Verify backend is accessible: `http://localhost:8080/api/transactions`
3. Check `.env` file has correct API URL
4. Check browser console for specific errors

### CORS Errors in Browser Console

**Problem:** Backend CORS not configured properly.

**Solution:**
1. Ensure backend `CorsConfig.java` exists
2. Restart the backend
3. Clear browser cache
4. Check backend logs for CORS-related errors

### TypeScript Errors

**Problem:** TypeScript compilation errors.

**Solution:**
- Most TypeScript errors are warnings and won't prevent the app from running
- Check terminal for actual errors (not warnings)
- Run `npm run lint` to see detailed errors

## 📝 Quick Reference

```bash
# First time setup
cd frontend-glow-up-main
npm install

# Start frontend
npm run dev

# Access at
http://localhost:3000
```

## 🎯 Expected Output

When successfully started, you should see:

```
  VITE v5.4.19  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

  ready in 500 ms.
```

## ✅ Success Checklist

- [ ] Node.js 18+ installed
- [ ] Navigated to `frontend-glow-up-main` directory
- [ ] Ran `npm install` (first time only)
- [ ] Started with `npm run dev`
- [ ] See "VITE ready" message
- [ ] Can access `http://localhost:3000` in browser
- [ ] Dashboard loads without errors
- [ ] Backend is running (for full functionality)

---

**Once the frontend is running, you can:**
- Submit new transactions
- View transaction history
- Filter by status
- Search and sort transactions
- View fraud alerts

**Happy Coding! 🎉**

