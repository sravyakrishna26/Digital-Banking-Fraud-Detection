package com.example.transaction_api.service;

import com.example.transaction_api.model.MlTransactionPayload;
import com.example.transaction_api.model.Transaction;
import com.example.transaction_api.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    private final TransactionRepository repository;
    private final MlFraudClient mlFraudClient;
    private final MlPayloadMapper mlPayloadMapper;
    private final EmailService emailService;
    private final AccountStatusService accountStatusService;

    public TransactionService(TransactionRepository repository,
            MlFraudClient mlFraudClient,
            MlPayloadMapper mlPayloadMapper,
            EmailService emailService,
            AccountStatusService accountStatusService) {
        this.repository = repository;
        this.mlFraudClient = mlFraudClient;
        this.mlPayloadMapper = mlPayloadMapper;
        this.emailService = emailService;
        this.accountStatusService = accountStatusService;
    }

    public void processTransaction(Transaction txn) {

        // Set timestamp if not provided
        if (txn.getTimestamp() == null) {
            txn.setTimestamp(java.time.LocalDateTime.now());
        }

        /* ================= ACCOUNT STATUS CHECK ================= */

        // Check if sender account is blocked
        if (accountStatusService.isAccountBlocked(txn.getSenderAccount())) {
            txn.setStatus("FAILED");
            txn.setFraudFlag(0);
            txn.setFraudReason("Account blocked due to multiple failed transactions");
            repository.insertTransaction(txn);
            return; // Stop processing immediately
        }

        /* ================= HARD FAIL RULES ================= */

        if (txn.getAmount() <= 0) {
            txn.setStatus("FAILED");
            txn.setFraudFlag(0);
            txn.setFraudReason("Invalid amount");
            repository.insertTransaction(txn);
            return;
        }

        if (txn.getSenderAccount().equals(txn.getReceiverAccount())) {
            txn.setStatus("FAILED");
            txn.setFraudFlag(0);
            txn.setFraudReason("Sender and receiver same");
            repository.insertTransaction(txn);
            return;
        }

        /* ================= RULE-BASED FRAUD SIGNALS ================= */

        StringBuilder alerts = new StringBuilder();

        if (txn.getAmount() > 100000) {
            alerts.append("High amount. ");
        }

        if (txn.getIpAddress() != null && txn.getIpAddress().startsWith("172.")) {
            alerts.append("Suspicious IP. ");
        }

        int velocity = repository.countRecentTransactions(txn.getSenderAccount());
        if (velocity >= 3) {
            alerts.append("High transaction velocity. ");
        }

        Double avg = repository.avgAmountLast5Min(txn.getSenderAccount());
        if (avg != null && avg > 0 && txn.getAmount() > avg * 3) {
            alerts.append("Rapid amount spike. ");
        }

        int failedAttempts = repository.countRecentFailedTxns(txn.getSenderAccount());
        if (failedAttempts >= 2) {
            alerts.append("Multiple failed attempts before success. ");
        }

        /* ================= RULE-BASED DECISION ================= */

        if (!alerts.isEmpty()) {
            txn.setStatus("PENDING");
            txn.setFraudFlag(1);
            txn.setFraudReason(alerts.toString());
        } else {
            txn.setStatus("SUCCESS");
            txn.setFraudFlag(0);
            txn.setFraudReason("NONE");
        }

        /* ================= ML FRAUD CHECK ================= */

        Double mlScore = 0.0;
        try {
            MlTransactionPayload payload = mlPayloadMapper.toMlPayload(txn);
            Map<String, Object> mlResult = mlFraudClient.predictFraud(payload);

            if (mlResult != null && mlResult.containsKey("fraud_probability")) {
                Object fraudProb = mlResult.get("fraud_probability");
                if (fraudProb instanceof Number) {
                    mlScore = ((Number) fraudProb).doubleValue();
                }
            }
        } catch (Exception e) {
            // ML service error - use default score of 0.0
            // Error already logged by MlFraudClient
            mlScore = 0.0;
        }

        txn.setMlScore(mlScore);

        // ML can only UPGRADE risk (never downgrade)
        if (mlScore >= 0.7 && !"FAILED".equals(txn.getStatus())) {
            txn.setStatus("FAILED");
            txn.setFraudFlag(1);

            if ("NONE".equals(txn.getFraudReason())) {
                txn.setFraudReason("ML_HIGH_RISK");
            } else {
                txn.setFraudReason(txn.getFraudReason() + " ML_HIGH_RISK.");
            }
        } else {
            txn.setStatus("SUCCESS");
            txn.setFraudFlag(0);
        }

        /* ================= SAVE ================= */

        repository.insertTransaction(txn);

        /* ================= EMAIL ALERT (if fraud detected) ================= */

        // Send email alert if fraud is detected (fraudFlag = 1)
        if (txn.getFraudFlag() != null && txn.getFraudFlag() == 1) {
            try {
                emailService.sendFraudAlert(txn);
            } catch (Exception e) {
                // Log error but don't fail transaction processing
                org.slf4j.LoggerFactory.getLogger(TransactionService.class)
                        .error("Failed to send fraud alert email: {}", e.getMessage());
            }
        }

        /* ================= ACCOUNT STATUS UPDATE ================= */

        // Update account status based on transaction result
        boolean transactionFailed = "FAILED".equals(txn.getStatus());
        accountStatusService.updateAccountStatusAfterTransaction(
                txn.getSenderAccount(),
                transactionFailed);
    }

    /* ================= READ APIs ================= */

    public List<Transaction> getAllTransactions() {
        return repository.findAll();
    }

    public List<Transaction> getFraudTransactions() {
        return repository.findFraudTransactions();
    }

    public List<Transaction> getSuccessTransactions() {
        return repository.findByStatus("SUCCESS");
    }

    public List<Transaction> getFailedTransactions() {
        return repository.findByStatus("FAILED");
    }

    public List<Transaction> getPendingTransactions() {
        return repository.findByStatus("PENDING");
    }
}
