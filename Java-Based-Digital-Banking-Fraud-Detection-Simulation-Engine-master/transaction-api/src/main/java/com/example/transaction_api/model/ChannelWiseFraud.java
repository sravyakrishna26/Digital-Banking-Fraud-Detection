package com.example.transaction_api.model;

public class ChannelWiseFraud {
    private String channel;
    private long fraudCount;
    private long nonFraudCount;
    private long totalCount;

    public ChannelWiseFraud() {
    }

    public ChannelWiseFraud(String channel, long fraudCount, long nonFraudCount, long totalCount) {
        this.channel = channel;
        this.fraudCount = fraudCount;
        this.nonFraudCount = nonFraudCount;
        this.totalCount = totalCount;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public long getFraudCount() {
        return fraudCount;
    }

    public void setFraudCount(long fraudCount) {
        this.fraudCount = fraudCount;
    }

    public long getNonFraudCount() {
        return nonFraudCount;
    }

    public void setNonFraudCount(long nonFraudCount) {
        this.nonFraudCount = nonFraudCount;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }
}
