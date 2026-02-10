package com.example.transaction_api.model;

import java.time.LocalDateTime;

public class AccountStatus {
    private String accountNumber;
    private String status; // ACTIVE or BLOCKED
    private LocalDateTime blockedAt;
    private LocalDateTime unblockAt;
    private Integer failedCountLast5Min;

    public AccountStatus() {
    }

    public AccountStatus(String accountNumber, String status) {
        this.accountNumber = accountNumber;
        this.status = status;
        this.failedCountLast5Min = 0;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getBlockedAt() {
        return blockedAt;
    }

    public void setBlockedAt(LocalDateTime blockedAt) {
        this.blockedAt = blockedAt;
    }

    public LocalDateTime getUnblockAt() {
        return unblockAt;
    }

    public void setUnblockAt(LocalDateTime unblockAt) {
        this.unblockAt = unblockAt;
    }

    public Integer getFailedCountLast5Min() {
        return failedCountLast5Min;
    }

    public void setFailedCountLast5Min(Integer failedCountLast5Min) {
        this.failedCountLast5Min = failedCountLast5Min;
    }
}