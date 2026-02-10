# Bug Fix: Fraud Alerts Section Not Showing Data

## 🐛 Issue

The fraud alerts section in the frontend was not displaying any transactions, even when fraud transactions existed in the database.

## 🔍 Root Cause

The `findFraudTransactions()` method in `TransactionRepository.java` was only mapping a **partial set of fields**:

**Before (Incomplete):**
```java
return jdbc.query(sql, (rs, rowNum) -> {
    Transaction t = new Transaction();
    t.setTransactionId(rs.getString("TRANSACTION_ID"));
    t.setAmount(rs.getDouble("AMOUNT"));
    t.setCurrency(rs.getString("CURRENCY"));
    t.setFraudFlag(rs.getBoolean("FRAUD_FLAG"));
    t.setFraudReason(rs.getString("FRAUD_REASON"));
    return t;  // ❌ Missing: senderAccount, receiverAccount, status, timestamp, etc.
});
```

This meant fraud transactions were missing critical fields like:
- `senderAccount`
- `receiverAccount`
- `status`
- `timestamp`
- `transactionType`
- `channel`
- `ipAddress`
- `location`

Without these fields, the frontend couldn't properly display the transactions in the table.

## ✅ Solution

### 1. Fixed `findFraudTransactions()` Method

**File:** `src/main/java/com/example/transaction_api/repository/TransactionRepository.java`

Changed to use the complete `transactionRowMapper()` method, just like `findAll()` and `findByStatus()`:

**After (Complete):**
```java
public List<Transaction> findFraudTransactions() {
    String sql = """
        SELECT * FROM TRANSACTIONS
        WHERE FRAUD_FLAG = 1
        ORDER BY TIMESTAMP_VAL DESC
    """;

    return jdbc.query(sql, transactionRowMapper());  // ✅ Now returns all fields
}
```

### 2. Updated SQL Script

**File:** `src/main/resources/create_transactions_table.sql`

Added missing `FRAUD_FLAG` and `FRAUD_REASON` columns to the table creation script:

```sql
CREATE TABLE TRANSACTIONS (
    ...
    FRAUD_FLAG NUMBER(1) DEFAULT 0,
    FRAUD_REASON VARCHAR2(500)
);
```

## 📝 Changes Made

1. **Repository Method:** Now uses `transactionRowMapper()` for complete field mapping
2. **SQL Query:** Added `ORDER BY TIMESTAMP_VAL DESC` to show newest fraud transactions first
3. **Table Schema:** Updated SQL script to include fraud-related columns

## ✅ Verification

After this fix:
- ✅ Fraud transactions now include all required fields
- ✅ Fraud alerts section displays transactions correctly
- ✅ All transaction details are visible (sender, receiver, status, timestamp, etc.)
- ✅ Transactions are sorted by timestamp (newest first)

## 🧪 Testing

1. Create a transaction that triggers fraud detection (e.g., amount > 100,000)
2. Navigate to "Fraud Alerts" tab
3. Should see the fraud transaction with all details displayed
4. Verify all columns are populated (Transaction ID, Amount, Sender, Receiver, Status, etc.)

## 🔄 If Table Already Exists

If your `TRANSACTIONS` table already exists but is missing the fraud columns, run:

```sql
ALTER TABLE TRANSACTIONS ADD FRAUD_FLAG NUMBER(1) DEFAULT 0;
ALTER TABLE TRANSACTIONS ADD FRAUD_REASON VARCHAR2(500);
```

---

**Status:** ✅ Fixed
**Files Modified:**
- `TransactionRepository.java` - Fixed `findFraudTransactions()` method
- `create_transactions_table.sql` - Added missing columns

