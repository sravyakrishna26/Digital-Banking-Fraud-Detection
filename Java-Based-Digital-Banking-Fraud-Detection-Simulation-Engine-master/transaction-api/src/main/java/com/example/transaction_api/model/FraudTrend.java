package com.example.transaction_api.model;

import java.time.LocalDate;

public class FraudTrend {
    private LocalDate date;
    private long fraudCount;

    public FraudTrend() {
    }

    public FraudTrend(LocalDate date, long fraudCount) {
        this.date = date;
        this.fraudCount = fraudCount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getFraudCount() {
        return fraudCount;
    }

    public void setFraudCount(long fraudCount) {
        this.fraudCount = fraudCount;
    }
}
