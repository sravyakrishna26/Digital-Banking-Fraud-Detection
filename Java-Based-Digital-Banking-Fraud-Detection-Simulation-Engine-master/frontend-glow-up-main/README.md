# Transaction Fraud Detection System - Frontend

A modern React + TypeScript frontend for the Transaction Fraud Detection System, built with Vite, shadcn/ui, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL (optional):**

   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The app will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend-glow-up-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── FraudBadge.tsx
│   │   └── ui/              # shadcn/ui components
│   ├── pages/               # Page components
│   │   ├── Index.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── TransactionGeneration.tsx
│   ├── services/            # API services
│   │   └── transactionApi.ts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── App.tsx              # Root component
├── public/                  # Static assets
└── package.json
```

## 🎯 Features

- **Transaction Submission** - Submit new transactions with validation
- **Transaction History** - View and filter all transactions
- **Status Filtering** - Filter by Success, Failed, Pending, or Fraud
- **Fraud Detection** - Visual alerts for fraud-flagged transactions
- **Real-time Statistics** - Dashboard cards with transaction counts
- **Search & Sort** - Search transactions and sort by columns
- **Date Range Filtering** - Filter transactions by date range
- **Responsive Design** - Works on all device sizes

## 🔌 Backend Integration

This frontend is fully integrated with the Spring Boot backend API.

See [INTEGRATION.md](./INTEGRATION.md) for details.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **date-fns** - Date utilities

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |

## 🐛 Troubleshooting

### Backend Not Responding
- Ensure backend is running: `cd transaction-api && mvn spring-boot:run`
- Check API URL in `.env` file
- Verify backend is accessible at `http://localhost:8080/api/transactions`

### Port Already in Use
Vite will automatically use the next available port (3001, 3002, etc.)

### CORS Errors
- Backend has CORS configured in `CorsConfig.java`
- Restart backend if CORS errors persist
- Check browser console for specific errors

## 📄 License

Part of the Infosys Internship program.

---

**Status:** ✅ Integrated with Backend
**UI:** Preserved (No changes to UI design)
