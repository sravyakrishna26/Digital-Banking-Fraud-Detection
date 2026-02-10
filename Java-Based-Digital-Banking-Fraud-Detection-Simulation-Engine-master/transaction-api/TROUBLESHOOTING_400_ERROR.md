# Troubleshooting 400 Bad Request Error

## Common Causes and Solutions

### 1. **Invalid JSON Format**

**Error:** `400 Bad Request` with message about JSON parsing

**Solution:** Ensure your JSON is valid and matches the expected format.

**Example Valid Request:**
```json
{
  "transactionId": "TXN123456789",
  "timestamp": "2024-01-15T10:30:00",
  "currency": "USD",
  "amount": 1500.50,
  "senderAccount": "AC12345678",
  "receiverAccount": "AC87654321",
  "transactionType": "TRANSFER",
  "channel": "MOBILE",
  "status": "SUCCESS",
  "ipAddress": "192.168.1.100",
  "location": "Mumbai"
}
```

### 2. **Timestamp Format Issues**

**Error:** `Invalid timestamp format for field 'timestamp'`

**Accepted Formats:**
- `"2024-01-15T10:30:00"` (ISO format - recommended)
- `"2024-01-15T10:30:00.000"` (with milliseconds)
- `null` or omit field (will be set to current time automatically)

**Note:** The timestamp field is optional. If omitted, it will be set to the current time.

### 3. **Missing Required Fields**

**Error:** Validation errors listing missing fields

**Required Fields:**
- `transactionId` (String)
- `amount` (Number, must be > 0)
- `senderAccount` (String)
- `receiverAccount` (String)

**Optional Fields:**
- `timestamp` (String in ISO format, or null)
- `currency` (String)
- `transactionType` (String)
- `channel` (String)
- `status` (String)
- `ipAddress` (String)
- `location` (String)

### 4. **Data Type Mismatches**

**Common Issues:**
- `amount` must be a number (e.g., `1500.50`, not `"1500.50"`)
- `timestamp` must be a string in ISO format, or null
- All account IDs should be strings

### 5. **Null Safety Issues**

**Fix:** Ensure nullable fields can be null or omitted:
- `timestamp` can be null
- `ipAddress` can be null
- `location` can be null

## How to Debug

### Check API Logs

Look at the server console logs. The enhanced error handling will show:
- Exact field causing the error
- Expected format
- Validation messages

### Test with curl

```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN123",
    "timestamp": "2024-01-15T10:30:00",
    "currency": "USD",
    "amount": 1500.50,
    "senderAccount": "AC12345678",
    "receiverAccount": "AC87654321",
    "transactionType": "TRANSFER",
    "channel": "MOBILE",
    "status": "SUCCESS",
    "ipAddress": "192.168.1.100",
    "location": "Mumbai"
  }'
```

### Check Error Response

The API now returns detailed error messages:

**Validation Error Example:**
```json
{
  "error": "Validation failed",
  "status": 400,
  "message": "Request validation errors",
  "errors": {
    "amount": "must be greater than 0",
    "senderAccount": "must not be blank"
  }
}
```

**JSON Parse Error Example:**
```json
{
  "error": "Invalid request body",
  "status": 400,
  "message": "Invalid timestamp format for field 'timestamp'. Expected format: 'yyyy-MM-ddTHH:mm:ss' or 'yyyy-MM-dd HH:mm:ss'",
  "details": "Check your JSON format and ensure all required fields are present"
}
```

## Quick Fixes

### Frontend/TypeScript Issues

If using TypeScript/Frontend, ensure:

1. **Content-Type Header:**
   ```typescript
   headers: {
     'Content-Type': 'application/json'
   }
   ```

2. **Timestamp Format:**
   ```typescript
   const timestamp = new Date().toISOString().slice(0, 19); // "2024-01-15T10:30:00"
   ```

3. **Request Body:**
   ```typescript
   const requestBody = {
     transactionId: "TXN123",
     timestamp: timestamp, // or null/omit
     currency: "USD",
     amount: 1500.50, // number, not string
     senderAccount: "AC123",
     receiverAccount: "AC456",
     // ... other fields
   };
   ```

## Still Having Issues?

1. Check server logs for detailed error messages
2. Use the example JSON in `EXAMPLE_REQUEST.json`
3. Verify your frontend is sending proper JSON
4. Test with curl/Postman first to isolate frontend issues

