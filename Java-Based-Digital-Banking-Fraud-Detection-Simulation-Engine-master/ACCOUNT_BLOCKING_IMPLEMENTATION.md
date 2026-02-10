# Account Blocking Feature - Implementation Summary

## ✅ Completed Features

### 🗄️ Backend Implementation

#### 1. Database

- ✅ **ACCOUNT_STATUS Table** - Created with all required fields:
  - `ACCOUNT_NUMBER` (Primary Key)
  - `STATUS` (ACTIVE/BLOCKED)
  - `BLOCKED_AT` (Timestamp)
  - `UNBLOCK_AT` (Timestamp)
  - `FAILED_COUNT_LAST_5_MIN` (Counter)

#### 2. Model & Repository

- ✅ **AccountStatus Model** - Java entity class
- ✅ **AccountStatusRepository** - Database operations with:
  - Save/update account status (MERGE operation)
  - Find by account number
  - Find all blocked accounts
  - Find accounts to auto-unblock
  - Reset account status

#### 3. Service Layer

- ✅ **AccountStatusService** - Business logic:
  - Get account status (with auto-unblock check)
  - Check if account is blocked
  - Update status after transaction processing
  - Count failed transactions (last 5 minutes)
  - Block account if threshold exceeded (≥3 failed transactions)
  - Auto-unblock after 24 hours

#### 4. Transaction Service Integration

- ✅ **TransactionService Updated**:
  - Checks account status **BEFORE** processing transaction
  - Rejects blocked accounts immediately
  - Updates account status **AFTER** transaction processing
  - Blocks account if failed count ≥ 3 in 5 minutes

#### 5. API Endpoints

- ✅ **AccountController**:
  - `GET /api/accounts/status/{accountNumber}` - Get account status
  - `GET /api/accounts/blocked` - Get all blocked accounts

### 🎨 Frontend Implementation

#### 1. API Service

- ✅ **transactionApi.ts** - Added:
  - `getAccountStatus()` - Fetch account status
  - `getBlockedAccounts()` - Fetch all blocked accounts
  - TypeScript interfaces for `AccountStatus`

#### 2. Components

- ✅ **AccountStatusBadge** - Visual badge component:
  - Shows ACTIVE (green) or BLOCKED (red)
  - Displays unblock time when blocked

#### 3. Transaction Form

- ✅ **TransactionForm Enhanced**:
  - Auto-checks account status when sender account changes (debounced 500ms)
  - Displays account status badge
  - Shows warning message for blocked accounts
  - Disables submit button if account is blocked
  - Shows unblock time information

---

## 🔄 Transaction Flow (Updated)

```
1. Transaction Request Received
   ↓
2. Check Account Status
   ├─ If BLOCKED → Reject immediately (status=FAILED)
   └─ If ACTIVE → Continue
   ↓
3. Set Timestamp
   ↓
4. Hard Fail Rules (amount ≤ 0, same sender/receiver)
   ↓
5. Rule-based Fraud Detection
   ↓
6. ML Fraud Prediction
   ↓
7. Final Status Determination
   ↓
8. Save Transaction
   ↓
9. Update Account Status
   ├─ Count failed transactions (last 5 min)
   ├─ If failed count ≥ 3 → Block account for 24 hours
   └─ Auto-unblock if expired
   ↓
10. Email Alert (if fraud detected)
```

---

## 📁 Files Created/Modified

### Backend Files

#### New Files

1. `resources/create_account_status_table.sql` - Database schema
2. `model/AccountStatus.java` - Account status entity
3. `repository/AccountStatusRepository.java` - Data access layer
4. `service/AccountStatusService.java` - Business logic
5. `controller/AccountController.java` - REST endpoints

#### Modified Files

1. `service/TransactionService.java` - Integrated account blocking logic

### Frontend Files

#### New Files

1. `components/AccountStatusBadge.tsx` - Status badge component

#### Modified Files

1. `services/transactionApi.ts` - Added account status API calls
2. `components/TransactionForm.tsx` - Added account status display and blocking

---

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL script to create the ACCOUNT_STATUS table:

```sql
-- Execute in Oracle Database
-- File: src/main/resources/create_account_status_table.sql

CREATE TABLE ACCOUNT_STATUS (
    ACCOUNT_NUMBER VARCHAR2(100) PRIMARY KEY,
    STATUS VARCHAR2(20) NOT NULL CHECK (STATUS IN ('ACTIVE', 'BLOCKED')),
    BLOCKED_AT TIMESTAMP,
    UNBLOCK_AT TIMESTAMP,
    FAILED_COUNT_LAST_5_MIN NUMBER DEFAULT 0
);

CREATE INDEX idx_account_status_status ON ACCOUNT_STATUS(STATUS);
CREATE INDEX idx_account_status_unblock ON ACCOUNT_STATUS(UNBLOCK_AT);
```

### 2. Restart Backend

```bash
cd transaction-api
./mvnw spring-boot:run
```

### 3. Frontend (No changes needed)

The frontend will automatically use the new features.

---

## 🧪 Testing the Feature

### Test Scenario 1: Account Blocking

1. **Submit a transaction** with a sender account
2. **Submit 3 failed transactions** from the same account within 5 minutes:
   - Amount ≤ 0
   - Same sender/receiver
   - ML score > 0.7
3. **Verify**:
   - Account status shows as BLOCKED
   - Submit button is disabled
   - Unblock time is displayed
   - New transactions from blocked account are rejected

### Test Scenario 2: Auto-Unblock

1. **Manually set UNBLOCK_AT** to a past time in database:

   ```sql
   UPDATE ACCOUNT_STATUS
   SET UNBLOCK_AT = SYSDATE - 1
   WHERE ACCOUNT_NUMBER = 'TEST123';
   ```

2. **Try to submit a transaction** from that account
3. **Verify**:
   - Account is automatically unblocked
   - Transaction can be processed
   - Account status shows ACTIVE

### Test Scenario 3: Status API

1. **Call API**:

   ```bash
   GET /api/accounts/status/AC12345678
   ```

2. **Verify Response**:

   ```json
   {
     "accountNumber": "AC12345678",
     "status": "BLOCKED",
     "blockedAt": "2026-01-19T14:17:11",
     "unblockAt": "2026-01-20T14:17:11",
     "failedCountLast5Min": 3
   }
   ```

### Test Scenario 4: Blocked Accounts List

1. **Call API**:

   ```bash
   GET /api/accounts/blocked
   ```

2. **Verify Response**:

   ```json
   {
     "count": 2,
     "accounts": [
       {
         "accountNumber": "AC12345678",
         "status": "BLOCKED",
         "blockedAt": "2026-01-19T14:17:11",
         "unblockAt": "2026-01-20T14:17:11",
         "failedCountLast5Min": 3
       }
     ]
   }
   ```

---

## 🔧 Configuration

### Blocking Threshold

Currently set to **3 failed transactions** in the last **5 minutes**.

To change, modify `AccountStatusService.java`:

```java
private static final int BLOCK_THRESHOLD = 3; // Change this value
```

### Block Duration

Currently set to **24 hours**.

To change, modify `AccountStatusService.java`:

```java
private static final int BLOCK_DURATION_HOURS = 24; // Change this value
```

---

## ⚠️ Important Notes

1. **No Changes to Existing Logic** - All existing fraud rules and ML logic remain unchanged
2. **Automatic Status Creation** - Account status is created automatically when first checked (defaults to ACTIVE)
3. **Auto-Unblocking** - Accounts are automatically unblocked after 24 hours or when unblock time expires
4. **Failed Count Window** - Failed count is based on transactions in the last 5 minutes (configurable in TransactionRepository)
5. **Blocking Persists** - Even if failed count drops, account remains blocked until unblock time

---

## 📊 Account Status States

| Status | Description | Can Transact? |
|--------|-------------|---------------|
| **ACTIVE** | Account is active and can process transactions | ✅ Yes |
| **BLOCKED** | Account blocked due to multiple failures | ❌ No |

---

## 🎯 API Endpoints

### GET /api/accounts/status/{accountNumber}

**Description**: Get account status information

**Response**:

```json
{
  "accountNumber": "AC12345678",
  "status": "ACTIVE" | "BLOCKED",
  "blockedAt": "2026-01-19T14:17:11" | null,
  "unblockAt": "2026-01-20T14:17:11" | null,
  "failedCountLast5Min": 0
}
```

### GET /api/accounts/blocked

**Description**: Get all currently blocked accounts

**Response**:

```json
{
  "count": 2,
  "accounts": [
    {
      "accountNumber": "AC12345678",
      "status": "BLOCKED",
      "blockedAt": "2026-01-19T14:17:11",
      "unblockAt": "2026-01-20T14:17:11",
      "failedCountLast5Min": 3
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: Account not blocking after 3 failed transactions

**Solution**:

- Verify failed transactions are actually marked as "FAILED"
- Check database: `SELECT * FROM ACCOUNT_STATUS WHERE ACCOUNT_NUMBER = '...'`
- Verify `FAILED_COUNT_LAST_5_MIN` is incrementing
- Check application logs for blocking messages

### Issue: Account not auto-unblocking

**Solution**:

- Verify `UNBLOCK_AT` timestamp in database
- Ensure time zone is correct
- Check that `getAccountStatus()` is being called (triggers auto-unblock)

### Issue: Frontend not showing account status

**Solution**:

- Check browser console for API errors
- Verify authentication token is valid
- Ensure account number is not empty
- Check network tab for `/api/accounts/status/` calls

---

**Implementation Complete! 🎉**

The account blocking feature is fully integrated and ready to use.
