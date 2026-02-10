package com.example.transaction_api.model;

public class DashboardSummary {
    private long totalTransactions;
    private long fraudTransactions;
    private long successTransactions;
    private long failedTransactions;
    private long pendingTransactions;
    private double fraudPercentage;

    public DashboardSummary() {
    }

    public DashboardSummary(long totalTransactions, long fraudTransactions,
                          long successTransactions, long failedTransactions,
                          long pendingTransactions, double fraudPercentage) {
        this.totalTransactions = totalTransactions;
        this.fraudTransactions = fraudTransactions;
        this.successTransactions = successTransactions;
        this.failedTransactions = failedTransactions;
        this.pendingTransactions = pendingTransactions;
        this.fraudPercentage = fraudPercentage;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getFraudTransactions() {
        return fraudTransactions;
    }

    public void setFraudTransactions(long fraudTransactions) {
        this.fraudTransactions = fraudTransactions;
    }

    public long getSuccessTransactions() {
        return successTransactions;
    }

    public void setSuccessTransactions(long successTransactions) {
        this.successTransactions = successTransactions;
    }

    public long getFailedTransactions() {
        return failedTransactions;
    }

    public void setFailedTransactions(long failedTransactions) {
        this.failedTransactions = failedTransactions;
    }

    public long getPendingTransactions() {
        return pendingTransactions;
    }

    public void setPendingTransactions(long pendingTransactions) {
        this.pendingTransactions = pendingTransactions;
    }

    public double getFraudPercentage() {
        return fraudPercentage;
    }

    public void setFraudPercentage(double fraudPercentage) {
        this.fraudPercentage = fraudPercentage;
    }
}
