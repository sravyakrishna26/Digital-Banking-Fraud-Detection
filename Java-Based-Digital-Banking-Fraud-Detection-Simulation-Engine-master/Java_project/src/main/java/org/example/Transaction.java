package org.example;

public class Transaction {

    private String transactionId;
    private String timestamp;
    private String currency;
    private double amount;
    private String senderAccount;
    private String receiverAccount;
    private String transactionType;
    private String channel;
    private String status;
    private String ipAddress;
    private String location;

    public Transaction(String transactionId, String timestamp, String currency, double amount,
                       String senderAccount, String receiverAccount, String transactionType,
                       String channel, String status, String ipAddress, String location) {

        this.transactionId = transactionId;
        this.timestamp = timestamp;
        this.currency = currency;
        this.amount = amount;
        this.senderAccount = senderAccount;
        this.receiverAccount = receiverAccount;
        this.transactionType = transactionType;
        this.channel = channel;
        this.status = status;
        this.ipAddress = ipAddress;
        this.location = location;
    }

    // -----------------------------
    // Getters (use these in other classes)
    // -----------------------------

    public String getTransactionId() {
        return transactionId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getCurrency() {
        return currency;
    }

    public double getAmount() {
        return amount;
    }

    public String getSenderAccount() {
        return senderAccount;
    }

    public String getReceiverAccount() {
        return receiverAccount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public String getChannel() {
        return channel;
    }

    public String getStatus() {
        return status;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getLocation() {
        return location;
    }

    // -----------------------------
    // Optional Setters (use only if needed)
    // -----------------------------

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setSenderAccount(String senderAccount) {
        this.senderAccount = senderAccount;
    }

    public void setReceiverAccount(String receiverAccount) {
        this.receiverAccount = receiverAccount;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    @Override
    public String toString() {
        return transactionId + "," + timestamp + "," + currency + "," + amount + "," +
                senderAccount + "," + receiverAccount + "," + transactionType + "," +
                channel + "," + status + "," + ipAddress + "," + location;
    }
}
