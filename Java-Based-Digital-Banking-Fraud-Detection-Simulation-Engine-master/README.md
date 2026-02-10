# Transaction Generator & API

This project consists of two components:
1. **transaction-api** - Spring Boot REST API that receives, validates, and saves transactions
2. **Java_project** - Transaction generator client that creates fake transactions and sends them to the API

## Prerequisites

- **Java 17** or higher
- **Maven** (or use Maven Wrapper included with Spring Boot)
- **Oracle Database** (version 11g or higher) running on localhost:1521 with SID XE
  - Default credentials: username=`system`, password=`system`
  - Make sure Oracle database is running and accessible

## How to Run

### Step 0: Setup Oracle Database

**Important:** Before starting the API, ensure your Oracle database is running and the `TRANSACTIONS` table exists.

1. **Connect to Oracle Database** using SQL*Plus or SQL Developer:
   ```sql
   sqlplus system/system@localhost:1521/XE
   ```

2. **Create the TRANSACTIONS table** (if it doesn't exist):
   - Option A: Run the SQL script from `transaction-api/src/main/resources/create_transactions_table.sql`
   - Option B: The table will be auto-created if `spring.jpa.hibernate.ddl-auto=update` is set (already configured)

3. **Verify the table exists**:
   ```sql
   SELECT * FROM TRANSACTIONS;
   ```

**Note:** If you need to change database connection details, edit `transaction-api/src/main/resources/application.properties`

### Step 1: Start the API Server (transaction-api)

Open a terminal/command prompt and navigate to the `transaction-api` folder:

```bash
cd transaction-api
```

**Option A: Using Maven Wrapper (Recommended)**
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

**Option B: Using Maven (if installed)**
```bash
mvn spring-boot:run
```

**Option C: Using IDE**
- Open the `transaction-api` folder in your IDE (IntelliJ IDEA, Eclipse, VS Code)
- Run the `TransactionApiApplication.java` main class

The API will start on **http://localhost:8080**

You should see output like:
```
Started TransactionApiApplication in X.XXX seconds
```

### Step 2: Run the Transaction Generator (Java_project)

Open a **new terminal/command prompt** and navigate to the `Java_project` folder:

```bash
cd Java_project
```

**Option A: Using Maven**
```bash
# Compile and run
mvn compile exec:java -Dexec.mainClass="org.example.TransactionGeneratorMain"
```

**Option B: Using IDE**
- Open the `Java_project` folder in your IDE
- Run the `TransactionGeneratorMain.java` main class

**Option C: Using Java directly (after compilation)**
```bash
# Compile
mvn compile

# Run
java -cp target/classes;target/dependency/* org.example.TransactionGeneratorMain
```

The generator will send 10 transactions to the API. You should see output like:
```
Transaction 1 - Response Code: 201
✓ Transaction sent successfully: TXN...
Transaction 2 - Response Code: 201
✓ Transaction sent successfully: TXN...
...
```

## Verify It's Working

### Check API Logs
You should see requests being processed in the API server logs:
```
POST /api/transactions, parameters={}
```

### Verify Data in Oracle Database
Connect to Oracle and check the data:
```sql
-- Connect to Oracle
sqlplus system/system@localhost:1521/XE

-- View all transactions
SELECT * FROM TRANSACTIONS;

-- Count transactions
SELECT COUNT(*) FROM TRANSACTIONS;

-- View recent transactions
SELECT * FROM TRANSACTIONS ORDER BY TIMESTAMP_VAL DESC;
```

### Test the API Manually (Optional)

Using curl or Postman:
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d "{\"transactionId\":\"TXN123\",\"timestamp\":\"2024-01-01 10:00:00\",\"currency\":\"USD\",\"amount\":100.50,\"senderAccount\":\"AC12345678\",\"receiverAccount\":\"AC87654321\",\"transactionType\":\"TRANSFER\",\"channel\":\"MOBILE\",\"status\":\"SUCCESS\",\"ipAddress\":\"192.168.1.1\",\"location\":\"Mumbai\"}"
```

## Troubleshooting

### Oracle Database Connection Issues

**Error: "ORA-12505: TNS:listener does not currently know of SID"**
- Check if Oracle database is running
- Verify the SID in `application.properties` matches your Oracle installation
- Common SIDs: `XE`, `ORCL`, or check your `tnsnames.ora` file

**Error: "ORA-01017: invalid username/password"**
- Update username and password in `transaction-api/src/main/resources/application.properties`
- Default: username=`system`, password=`system`

**Error: "Table or view does not exist"**
- Run the SQL script: `transaction-api/src/main/resources/create_transactions_table.sql`
- Or ensure `spring.jpa.hibernate.ddl-auto=update` is set (it is by default)

**Connection refused or timeouts**
- Verify Oracle listener is running: `lsnrctl status`
- Check if Oracle is listening on port 1521: `netstat -an | findstr 1521` (Windows) or `netstat -an | grep 1521` (Linux/Mac)

### Port 8080 already in use
If you get a port conflict error, change the port in `transaction-api/src/main/resources/application.properties`:
```properties
server.port=8081
```
Then update the URL in `TransactionGeneratorMain.java` to match.

### API not running
Make sure the API server is running before starting the transaction generator. The generator will fail if it can't connect to http://localhost:8080.

### Maven not found
If Maven is not installed, you can use the Maven Wrapper (`mvnw` or `mvnw.cmd`) included with the Spring Boot project.

### Transactions not saving to database
1. **Check API logs** - Look for error messages in the console
2. **Verify database connection** - Check if the API can connect to Oracle
3. **Check table exists** - Run `SELECT * FROM TRANSACTIONS;` in Oracle
4. **Review logs** - The API now includes detailed logging for debugging
5. **Verify column names** - Ensure table columns match the entity (uppercase: TRANSACTION_ID, CURRENCY, etc.)

## Architecture

1. **TransactionGeneratorMain** generates fake transaction data
2. Sends HTTP POST requests to **http://localhost:8080/api/transactions**
3. **TransactionController** receives and validates the data
4. **TransactionService** saves to database using JPA Repository
5. No direct database access from the generator - all goes through the API!


