-- Create USERS table for authentication
CREATE TABLE USERS (
    USER_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USERNAME VARCHAR2(100) NOT NULL UNIQUE,
    EMAIL VARCHAR2(255) NOT NULL UNIQUE,
    PASSWORD_HASH VARCHAR2(255) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: Oracle automatically creates indexes for UNIQUE constraints,
-- so explicit index creation on USERNAME and EMAIL is not needed.
-- If you want custom index names, you can drop the UNIQUE constraints
-- and create unique indexes instead, but this is not necessary.