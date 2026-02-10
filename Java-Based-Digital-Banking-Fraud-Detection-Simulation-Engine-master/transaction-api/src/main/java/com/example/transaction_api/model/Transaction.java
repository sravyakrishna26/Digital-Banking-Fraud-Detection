package com.example.transaction_api.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.time.LocalDateTime;

public class Transaction {

    private String transactionId;

    // Accepts multiple formats:
    // - ISO format: "2024-01-15T10:30:00"
    // - Space format: "2024-01-15 10:30:00" (from Java generator)
    // - With milliseconds: "2024-01-15T10:30:00.000" or "2024-01-15 10:30:00.000"
    // If null, will be set to current time in service
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private String currency;
    private double amount;

    private String senderAccount;
    private String receiverAccount;

    private String transactionType;
    private String channel;

    private String status; // SUCCESS / FAILED / PENDING
    private String ipAddress;
    private String location;

    /*
     * IMPORTANT:
     * Oracle does not support BOOLEAN
     * 1 = Fraud
     * 0 = Not Fraud
     */
    private Integer fraudFlag;

    private String fraudReason;

    // ML score (probability from model)
    private Double mlScore;

    /* ===================== GETTERS & SETTERS ===================== */

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getSenderAccount() {
        return senderAccount;
    }

    public void setSenderAccount(String senderAccount) {
        this.senderAccount = senderAccount;
    }

    public String getReceiverAccount() {
        return receiverAccount;
    }

    public void setReceiverAccount(String receiverAccount) {
        this.receiverAccount = receiverAccount;
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

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getFraudFlag() {
        return fraudFlag;
    }

    public void setFraudFlag(Integer fraudFlag) {
        this.fraudFlag = fraudFlag;
    }

    public String getFraudReason() {
        return fraudReason;
    }

    public void setFraudReason(String fraudReason) {
        this.fraudReason = fraudReason;
    }

    public Double getMlScore() {
        return mlScore;
    }

    public void setMlScore(Double mlScore) {
        this.mlScore = mlScore;
    }
}
