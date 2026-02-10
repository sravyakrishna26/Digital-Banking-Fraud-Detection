package com.example.transaction_api.service;

import com.example.transaction_api.model.ChannelWiseFraud;
import com.example.transaction_api.model.DashboardSummary;
import com.example.transaction_api.model.FraudTrend;
import com.example.transaction_api.model.LocationWiseFraud;
import com.example.transaction_api.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final TransactionRepository repository;

    public DashboardService(TransactionRepository repository) {
        this.repository = repository;
    }

    public DashboardSummary getSummary() {
        long totalTransactions = repository.countTotalTransactions();
        long fraudTransactions = repository.countFraudTransactions();
        long successTransactions = repository.countTransactionsByStatus("SUCCESS");
        long failedTransactions = repository.countTransactionsByStatus("FAILED");
        long pendingTransactions = repository.countTransactionsByStatus("PENDING");

        double fraudPercentage = totalTransactions > 0
            ? (double) fraudTransactions / totalTransactions * 100.0
            : 0.0;

        return new DashboardSummary(
            totalTransactions,
            fraudTransactions,
            successTransactions,
            failedTransactions,
            pendingTransactions,
            fraudPercentage
        );
    }

    public List<FraudTrend> getFraudTrends() {
        return repository.getFraudTrends();
    }

    public List<ChannelWiseFraud> getChannelWiseFraud() {
        return repository.getChannelWiseFraud();
    }

    public List<LocationWiseFraud> getLocationWiseFraud() {
        return repository.getLocationWiseFraud();
    }
}
