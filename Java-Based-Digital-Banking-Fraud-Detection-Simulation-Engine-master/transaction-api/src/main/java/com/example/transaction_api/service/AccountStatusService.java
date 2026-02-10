package com.example.transaction_api.service;

import com.example.transaction_api.model.AccountStatus;
import com.example.transaction_api.repository.AccountStatusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountStatusService {

    private static final Logger logger = LoggerFactory.getLogger(AccountStatusService.class);

    private static final int BLOCK_THRESHOLD = 3;
    private static final int BLOCK_DURATION_HOURS = 24;

    private final AccountStatusRepository accountStatusRepository;

    public AccountStatusService(AccountStatusRepository accountStatusRepository) {
        this.accountStatusRepository = accountStatusRepository;
    }

    /**
     * Get account status (auto-unblock if expired)
     */
    public AccountStatus getAccountStatus(String accountNumber) {

        AccountStatus status = accountStatusRepository
                .findByAccountNumber(accountNumber)
                .orElseGet(() -> {
                    AccountStatus s = new AccountStatus(accountNumber, "ACTIVE");
                    s.setFailedCountLast5Min(0);
                    accountStatusRepository.saveOrUpdate(s);
                    return s;
                });

        // Auto-unblock
        if ("BLOCKED".equals(status.getStatus())
                && status.getUnblockAt() != null
                && LocalDateTime.now().isAfter(status.getUnblockAt())) {

            logger.info("Auto-unblocking account {}", accountNumber);
            accountStatusRepository.resetAccountStatus(accountNumber);

            status.setStatus("ACTIVE");
            status.setBlockedAt(null);
            status.setUnblockAt(null);
            status.setFailedCountLast5Min(0);
        }

        return status;
    }

    /**
     * Update status after transaction
     */
    public void updateAccountStatusAfterTransaction(
            String accountNumber,
            boolean transactionFailed) {

        AccountStatus status = getAccountStatus(accountNumber);

        // ✅ SINGLE SOURCE OF TRUTH
        int failedCount = status.getFailedCountLast5Min() == null
                ? 0
                : status.getFailedCountLast5Min();

        // ✅ Increment ONLY if failed
        if (transactionFailed) {
            failedCount++;
        } else {
            // Optional: reset on success
            failedCount = 0;
        }

        status.setFailedCountLast5Min(failedCount);

        // ✅ BLOCK LOGIC
        if (failedCount >= BLOCK_THRESHOLD && !"BLOCKED".equals(status.getStatus())) {

            LocalDateTime now = LocalDateTime.now();
            status.setStatus("BLOCKED");
            status.setBlockedAt(now);
            status.setUnblockAt(now.plusHours(BLOCK_DURATION_HOURS));

            logger.warn(
                    "Account {} BLOCKED after {} failed transactions. Unblock at {}",
                    accountNumber,
                    failedCount,
                    status.getUnblockAt()
            );
        }

        logger.info(
                "Saving account status → account={}, failedCount={}, status={}",
                accountNumber,
                status.getFailedCountLast5Min(),
                status.getStatus()
        );

        accountStatusRepository.saveOrUpdate(status);
    }

    /**
     * Get blocked accounts
     */
    public List<AccountStatus> getBlockedAccounts() {

        LocalDateTime now = LocalDateTime.now();

        List<AccountStatus> expired =
                accountStatusRepository.findAccountsToUnblock(now);

        for (AccountStatus account : expired) {
            logger.info("Auto-unblocking expired account {}", account.getAccountNumber());
            accountStatusRepository.resetAccountStatus(account.getAccountNumber());
        }

        return accountStatusRepository.findBlockedAccounts();
    }

    public boolean isAccountBlocked(String accountNumber) {
        return "BLOCKED".equals(getAccountStatus(accountNumber).getStatus());
    }
}
