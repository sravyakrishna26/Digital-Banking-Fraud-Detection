# Backend Integration Guide

This frontend has been integrated with the Spring Boot backend API.

## ✅ Integration Complete

The following components have been integrated with the backend:

1. **TransactionForm** - Now submits transactions to the real API
2. **TransactionHistory** - Fetches real transaction data from the backend
3. **API Service** - Created `src/services/transactionApi.ts` for all API calls

## 🔌 API Endpoints Used

- `POST /api/transactions` - Create new transaction
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/success` - Get successful transactions
- `GET /api/transactions/failed` - Get failed transactions
- `GET /api/transactions/pending` - Get pending transactions
- `GET /api/transactions/fraud` - Get fraud transactions

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080
```

If not set, it defaults to `http://localhost:8080`.

### Port Configuration

The frontend runs on port **3000** (changed from 8080 to avoid conflict with backend).

Backend runs on port **8080**.

## 🚀 Running the Application

### Step 1: Start Backend

```bash
cd transaction-api
mvn spring-boot:run
```

Wait for: `Started TransactionApiApplication`

### Step 2: Start Frontend

```bash
cd frontend-glow-up-main
npm install  # First time only
npm run dev
```

The frontend will open at `http://localhost:3000`

## 🔄 What Changed

### Files Modified:
- `src/components/TransactionForm.tsx` - Replaced mock API call with real API
- `src/pages/TransactionHistory.tsx` - Replaced mock data with real API calls
- `vite.config.ts` - Changed port from 8080 to 3000

### Files Created:
- `src/services/transactionApi.ts` - API service layer
- `.env.example` - Environment variable template

### UI:
- **No UI changes** - All UI components remain exactly the same
- Only the data source changed from mock to real API

## ✅ Features Working

- ✅ Submit new transactions
- ✅ View all transactions
- ✅ Filter by status (Success, Failed, Pending, Fraud)
- ✅ Search transactions
- ✅ Sort transactions
- ✅ Real-time statistics
- ✅ Fraud detection alerts
- ✅ Date range filtering (client-side)

## 🐛 Troubleshooting

### Backend Connection Issues

**Error: "Failed to fetch"**
- Ensure backend is running on `http://localhost:8080`
- Check browser console for CORS errors
- Verify CORS configuration in backend (`CorsConfig.java`)

**Error: "Network error"**
- Check if backend is accessible: `http://localhost:8080/api/transactions`
- Verify API URL in `.env` file
- Check backend logs for errors

### Port Conflicts

If port 3000 is in use, Vite will automatically use the next available port (3001, 3002, etc.).

### CORS Issues

The backend already has CORS configured. If you see CORS errors:
1. Restart the backend
2. Clear browser cache
3. Check `CorsConfig.java` is properly configured

## 📝 Notes

- The UI remains **exactly the same** as before
- All mock data has been replaced with real API calls
- Error handling is implemented for all API calls
- Loading states are preserved
- The date range filter works on the client-side (filters fetched data)

---

**Integration Status:** ✅ Complete
**UI Changes:** None (preserved as requested)

