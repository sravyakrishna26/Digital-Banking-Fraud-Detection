package com.example.transaction_api.model;

public class LocationWiseFraud {
    private String location;
    private long fraudCount;
    private long totalTransactions;

    public LocationWiseFraud() {
    }

    public LocationWiseFraud(String location, long fraudCount, long totalTransactions) {
        this.location = location;
        this.fraudCount = fraudCount;
        this.totalTransactions = totalTransactions;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public long getFraudCount() {
        return fraudCount;
    }

    public void setFraudCount(long fraudCount) {
        this.fraudCount = fraudCount;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }
}
