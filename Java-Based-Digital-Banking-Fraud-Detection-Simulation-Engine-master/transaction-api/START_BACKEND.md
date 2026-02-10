# How to Start the Backend API

## 📋 Prerequisites

Before starting the backend, ensure you have:

1. **Java 17** or higher installed
   - Check: `java -version`
   - Should show version 17 or higher

2. **Oracle Database** running
   - Default: `localhost:1521` with SID `XE`
   - Username: `system`
   - Password: `system`
   - **Important:** Database must be running before starting the API

3. **Maven** (optional - Maven Wrapper is included)
   - Check: `mvn -version`
   - If not installed, use Maven Wrapper (`mvnw` or `mvnw.cmd`)

## 🚀 Starting the Backend

### Step 1: Navigate to Backend Directory

```bash
cd transaction-api
```

### Step 2: Choose a Method to Start

#### **Option A: Using Maven Wrapper (Recommended - No Maven Installation Needed)**

**Windows:**
```bash
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
./mvnw spring-boot:run
```

#### **Option B: Using Maven (If Installed)**

```bash
mvn spring-boot:run
```

#### **Option C: Using IDE (IntelliJ IDEA / Eclipse / VS Code)**

1. Open the `transaction-api` folder in your IDE
2. Navigate to: `src/main/java/com/example/transaction_api/TransactionApiApplication.java`
3. Right-click → Run `TransactionApiApplication`
   - Or click the green play button next to the `main` method

## ✅ Verify Backend is Running

### Check 1: Look for Success Message

You should see output like:
```
Started TransactionApiApplication in X.XXX seconds
```

### Check 2: Test API Endpoint

Open your browser or use curl:
```bash
# Browser
http://localhost:8080/api/transactions

# Or using curl
curl http://localhost:8080/api/transactions
```

Expected response: `[]` (empty array) or transaction data in JSON format.

### Check 3: Check Console Logs

The console should show:
- Spring Boot banner
- Application startup logs
- Database connection logs (if configured)
- "Started TransactionApiApplication" message

## 🔧 Configuration

### Database Connection

If your Oracle database has different settings, edit:
```
transaction-api/src/main/resources/application.properties
```

Change these lines:
```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:XE
spring.datasource.username=system
spring.datasource.password=system
```

### Port Configuration

Default port is **8080**. To change it, edit `application.properties`:
```properties
server.port=8081
```

## 🐛 Troubleshooting

### Error: "ORA-12505: TNS:listener does not currently know of SID"

**Problem:** Oracle database is not running or SID is incorrect.

**Solution:**
1. Start Oracle database service
2. Verify SID in `application.properties` matches your Oracle installation
3. Common SIDs: `XE`, `ORCL`
4. Check Oracle listener: `lsnrctl status`

### Error: "ORA-01017: invalid username/password"

**Problem:** Database credentials are incorrect.

**Solution:**
1. Update username and password in `application.properties`
2. Verify credentials by connecting with SQL*Plus:
   ```bash
   sqlplus system/system@localhost:1521/XE
   ```

### Error: "Port 8080 already in use"

**Problem:** Another application is using port 8080.

**Solution:**
1. Change port in `application.properties`:
   ```properties
   server.port=8081
   ```
2. Or stop the application using port 8080

### Error: "Java version not found" or "Unsupported class file version"

**Problem:** Java version is too old or not installed.

**Solution:**
1. Install Java 17 or higher
2. Verify: `java -version`
3. Set JAVA_HOME environment variable if needed

### Error: "Maven not found" (when using Option B)

**Problem:** Maven is not installed or not in PATH.

**Solution:**
1. Use Maven Wrapper instead (Option A)
2. Or install Maven and add to PATH

### Error: "Table or view does not exist"

**Problem:** TRANSACTIONS table doesn't exist in database.

**Solution:**
1. Run the SQL script: `src/main/resources/create_transactions_table.sql`
2. Or the table will be auto-created if Hibernate DDL auto is enabled

### Backend Starts but Frontend Can't Connect

**Problem:** CORS (Cross-Origin Resource Sharing) issue.

**Solution:**
- CORS configuration is already added in `CorsConfig.java`
- If still having issues, restart the backend
- Check browser console for specific error messages

## 📝 Quick Reference Commands

```bash
# Start backend (Windows)
cd transaction-api
.\mvnw.cmd spring-boot:run

# Start backend (Linux/Mac)
cd transaction-api
./mvnw spring-boot:run

# Start backend (with Maven installed)
cd transaction-api
mvn spring-boot:run

# Test API
curl http://localhost:8080/api/transactions

# Stop backend
Press Ctrl+C in the terminal
```

## 🎯 Expected Output

When successfully started, you should see:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.6)

... (various startup logs) ...

Started TransactionApiApplication in 3.456 seconds
```

## ✅ Success Checklist

- [ ] Java 17+ installed
- [ ] Oracle database running
- [ ] Navigated to `transaction-api` directory
- [ ] Started with Maven Wrapper or Maven
- [ ] See "Started TransactionApiApplication" message
- [ ] Can access `http://localhost:8080/api/transactions`
- [ ] No error messages in console

---

**Once the backend is running, you can start the frontend!**


