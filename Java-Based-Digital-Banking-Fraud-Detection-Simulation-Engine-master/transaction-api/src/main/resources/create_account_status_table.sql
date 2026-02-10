-- Create ACCOUNT_STATUS table for account blocking feature
CREATE TABLE ACCOUNT_STATUS (
    ACCOUNT_NUMBER VARCHAR2(100) PRIMARY KEY,
    STATUS VARCHAR2(20) NOT NULL CHECK (STATUS IN ('ACTIVE', 'BLOCKED')),
    BLOCKED_AT TIMESTAMP,
    UNBLOCK_AT TIMESTAMP,
    FAILED_COUNT_LAST_5_MIN NUMBER DEFAULT 0
);

-- Create index on status for faster lookups
CREATE INDEX idx_account_status_status ON ACCOUNT_STATUS(STATUS);

-- Create index on unblock_at for efficient cleanup queries
CREATE INDEX idx_account_status_unblock ON ACCOUNT_STATUS(UNBLOCK_AT);