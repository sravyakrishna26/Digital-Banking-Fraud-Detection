package com.example.transaction_api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * ML Transaction Payload - must match Python ML model input features.
 * Uses primitive types only (no LocalDateTime).
 */
public class MlTransactionPayload {

    private double amount;
    private String currency;
    private String transactionType;
    private String channel;
    private String status;

    @JsonProperty("hour")
    private int hour;  // Hour of day (0-23)

    @JsonProperty("day_of_week")
    private int dayOfWeek;  // Day of week (0=Monday, 6=Sunday)

    // Getters and Setters

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public int getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(int dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }
}
