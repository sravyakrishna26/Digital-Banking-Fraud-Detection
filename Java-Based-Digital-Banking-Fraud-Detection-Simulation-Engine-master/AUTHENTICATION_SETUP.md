# Authentication & Email Fraud Alerts Setup Guide

This document provides instructions for setting up the authentication system and email fraud alerts for the Transaction Fraud Detection System.

## 🎯 Overview

The system now includes:

- **Admin Authentication** (Login/Signup)
- **JWT-based API Security**
- **Email Fraud Alerts** (automatic notifications when fraud is detected)

---

## 📋 Prerequisites

1. Oracle Database running and accessible
2. Java 17+ installed
3. Node.js and npm/yarn for frontend
4. SMTP email account (Gmail, Outlook, or Mailtrap for testing)

---

## 🗄️ Database Setup

### Step 1: Create USERS Table

Run the SQL script to create the USERS table:

```sql
-- Execute this in your Oracle database
-- File: src/main/resources/create_users_table.sql

CREATE TABLE USERS (
    USER_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USERNAME VARCHAR2(100) NOT NULL UNIQUE,
    EMAIL VARCHAR2(255) NOT NULL UNIQUE,
    PASSWORD_HASH VARCHAR2(255) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON USERS(USERNAME);
CREATE INDEX idx_users_email ON USERS(EMAIL);
```

**Method 1: Using SQL*Plus or SQL Developer**

```bash
sqlplus system/system@localhost:1521/XE
@src/main/resources/create_users_table.sql
```

**Method 2: Copy and paste the SQL into your database client**

---

## ⚙️ Backend Configuration

### Step 2: Configure Email Settings

Edit `src/main/resources/application.properties`:

#### Option A: Gmail SMTP (Recommended for Testing)

```properties
# Gmail SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

**⚠️ Important for Gmail:**

1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password** (not your regular password):
   - Go to: <https://myaccount.google.com/apppasswords>
   - Generate a new app password
   - Use this app password in `application.properties`

#### Option B: Outlook/Hotmail

```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

#### Option C: Mailtrap (For Testing - No Real Emails)

```properties
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=your-mailtrap-username
spring.mail.password=your-mailtrap-password
```

### Step 3: JWT Configuration (Optional)

The default JWT settings in `application.properties` are:

```properties
jwt.secret=mySecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLongForHS512Algorithm
jwt.expiration=86400000  # 24 hours in milliseconds
```

**For production**, change `jwt.secret` to a strong random string (at least 256 bits).

### Step 4: Build and Run Backend

```bash
cd transaction-api
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

---

## 🎨 Frontend Setup

### Step 5: Install Dependencies and Run

```bash
cd frontend-glow-up-main
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (or similar)

---

## 🔐 Creating Admin Account

### Step 6: Create Admin Account

1. **Open the frontend** in your browser: `http://localhost:5173`
2. You will be redirected to the **Login page**
3. Click **"Create Admin Account"** or navigate to `/signup`
4. Fill in:
   - **Username**: e.g., `admin`
   - **Email**: Your email address (where fraud alerts will be sent)
   - **Password**: At least 6 characters
5. Click **"Create Admin Account"**
6. You'll be redirected to login page
7. **Login** with your credentials

**⚠️ Important:**

- The email you provide during signup is where fraud alerts will be sent
- You can create multiple admin accounts, but email alerts go to the first user or user with username "admin"

---

## ✅ Testing the System

### Test Authentication

1. **Try accessing protected pages without login** → Should redirect to `/login`
2. **Login with your credentials** → Should access all pages
3. **Click Logout** → Should clear session and redirect to login

### Test Email Fraud Alerts

1. **Create a fraudulent transaction**:
   - Amount > 100,000
   - IP starting with "172."
   - Multiple rapid transactions
   - ML score > 0.8

2. **Check your email inbox** for fraud alert with subject: `🚨 Fraud Alert Detected`

3. **Email should include**:
   - Transaction ID
   - Amount and currency
   - Sender/Receiver accounts
   - Fraud reason
   - ML fraud score
   - Timestamp

---

## 🔧 Troubleshooting

### Issue: "No admin user found. Cannot send fraud alert email."

**Solution:**

- Ensure you've created an admin account via `/signup`
- Check that the USERS table exists and has data
- Verify database connection in `application.properties`

### Issue: Email not sending

**Solutions:**

1. **Check SMTP credentials** in `application.properties`
2. **For Gmail**: Ensure you're using an App Password, not your regular password
3. **Check application logs** for SMTP errors
4. **Test with Mailtrap** first (easiest to debug)
5. **Check firewall/network** - port 587 must be accessible

### Issue: "401 Unauthorized" errors

**Solutions:**

1. **Ensure you're logged in** via frontend
2. **Check browser localStorage** for `authToken`
3. **Token may have expired** - login again
4. **Verify JWT secret** in `application.properties` matches

### Issue: Cannot access protected routes

**Solutions:**

1. **Clear browser localStorage**: `localStorage.clear()`
2. **Login again**
3. **Check browser console** for errors
4. **Verify backend is running** on port 8080

---

## 📁 File Structure

### Backend Files Added/Modified

```
transaction-api/
├── src/main/java/com/example/transaction_api/
│   ├── model/
│   │   └── User.java                          # User model
│   ├── repository/
│   │   └── UserRepository.java                # User data access
│   ├── service/
│   │   ├── UserService.java                   # User business logic
│   │   └── EmailService.java                  # Email sending logic
│   ├── controller/
│   │   └── AuthController.java                # /api/auth/* endpoints
│   ├── security/
│   │   ├── JwtTokenProvider.java              # JWT token generation/validation
│   │   └── JwtAuthenticationFilter.java       # JWT filter for requests
│   └── config/
│       └── SecurityConfig.java                # Spring Security configuration
├── src/main/resources/
│   ├── application.properties                 # Email & JWT config
│   └── create_users_table.sql                 # Database schema
└── pom.xml                                    # Added dependencies
```

### Frontend Files Added/Modified

```
frontend-glow-up-main/
├── src/
│   ├── services/
│   │   ├── authApi.ts                         # Authentication API calls
│   │   └── transactionApi.ts                  # Updated with JWT headers
│   ├── pages/
│   │   ├── Login.tsx                          # Login page
│   │   └── Signup.tsx                         # Signup page
│   ├── components/
│   │   └── ProtectedRoute.tsx                 # Route protection wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx                    # Authentication state management
│   └── App.tsx                                # Updated with protected routes
```

---

## 🔒 Security Notes

1. **Passwords** are hashed using BCrypt (secure one-way hashing)
2. **JWT tokens** expire after 24 hours (configurable)
3. **All APIs** except `/api/auth/*` require authentication
4. **CORS** is configured for `localhost:5173` and `localhost:3000`

---

## 🚀 Production Recommendations

1. **Change JWT secret** to a strong random string
2. **Use environment variables** for sensitive config (email credentials, JWT secret)
3. **Enable HTTPS** for production
4. **Set up proper email service** (SendGrid, AWS SES, etc.)
5. **Add rate limiting** on authentication endpoints
6. **Implement password reset** functionality
7. **Add audit logging** for admin actions

---

## 📞 Support

If you encounter issues:

1. Check application logs for detailed error messages
2. Verify database connection and table existence
3. Test email configuration with Mailtrap first
4. Ensure all dependencies are installed correctly

---

**Setup Complete! 🎉**

You now have a fully secured fraud detection system with authentication and email alerts!
