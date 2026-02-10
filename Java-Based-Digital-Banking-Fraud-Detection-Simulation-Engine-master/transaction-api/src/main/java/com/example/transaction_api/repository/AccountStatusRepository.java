package com.example.transaction_api.repository;

import com.example.transaction_api.model.AccountStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class AccountStatusRepository {

    private static final Logger logger = LoggerFactory.getLogger(AccountStatusRepository.class);

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_BLOCKED = "BLOCKED";

    private final JdbcTemplate jdbc;

    public AccountStatusRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Insert or update account status
     */
    public void saveOrUpdate(AccountStatus accountStatus) {

        logger.info("Saving account status for accountNumber={} status={}",
                accountStatus.getAccountNumber(),
                accountStatus.getStatus());

        try {
            Optional<AccountStatus> existing =
                    findByAccountNumber(accountStatus.getAccountNumber());

            Timestamp blockedAt = accountStatus.getBlockedAt() != null
                    ? Timestamp.valueOf(accountStatus.getBlockedAt())
                    : null;

            Timestamp unblockAt = accountStatus.getUnblockAt() != null
                    ? Timestamp.valueOf(accountStatus.getUnblockAt())
                    : null;

            int failedCount = accountStatus.getFailedCountLast5Min() != null
                    ? accountStatus.getFailedCountLast5Min()
                    : 0;

            if (existing.isPresent()) {

                String updateSql = """
                        UPDATE ACCOUNT_STATUS
                        SET STATUS = ?,
                            BLOCKED_AT = ?,
                            UNBLOCK_AT = ?,
                            FAILED_COUNT_LAST_5_MIN = ?
                        WHERE ACCOUNT_NUMBER = ?
                        """;

                int rowsUpdated = jdbc.update(
                        updateSql,
                        accountStatus.getStatus(),
                        blockedAt,
                        unblockAt,
                        failedCount,
                        accountStatus.getAccountNumber()
                );

                if (rowsUpdated == 0) {
                    logger.warn("No rows updated for account {}", accountStatus.getAccountNumber());
                } else {
                    logger.info("Account {} updated successfully", accountStatus.getAccountNumber());
                }

            } else {

                String insertSql = """
                        INSERT INTO ACCOUNT_STATUS
                        (ACCOUNT_NUMBER, STATUS, BLOCKED_AT, UNBLOCK_AT, FAILED_COUNT_LAST_5_MIN)
                        VALUES (?, ?, ?, ?, ?)
                        """;

                jdbc.update(
                        insertSql,
                        accountStatus.getAccountNumber(),
                        accountStatus.getStatus(),
                        blockedAt,
                        unblockAt,
                        failedCount
                );

                logger.info("Account {} inserted successfully", accountStatus.getAccountNumber());
            }

        } catch (Exception e) {
            logger.error("Failed to save/update account status for {}",
                    accountStatus.getAccountNumber(), e);
            throw new RuntimeException("Failed to save/update account status", e);
        }
    }

    /**
     * Fetch account status by account number
     */
    public Optional<AccountStatus> findByAccountNumber(String accountNumber) {

        String sql = "SELECT * FROM ACCOUNT_STATUS WHERE ACCOUNT_NUMBER = ?";

        try {
            AccountStatus status =
                    jdbc.queryForObject(sql, accountStatusRowMapper(), accountNumber);
            return Optional.ofNullable(status);

        } catch (Exception e) {
            logger.error("Error fetching account status for account {}", accountNumber, e);
            return Optional.empty();
        }
    }

    /**
     * Fetch all blocked accounts
     */
    public List<AccountStatus> findBlockedAccounts() {
        String sql = """
                SELECT * FROM ACCOUNT_STATUS
                WHERE STATUS = ?
                ORDER BY BLOCKED_AT DESC
                """;
        return jdbc.query(sql, accountStatusRowMapper(), STATUS_BLOCKED);
    }

    /**
     * Fetch accounts that are ready to be unblocked
     */
    public List<AccountStatus> findAccountsToUnblock(LocalDateTime currentTime) {

        String sql = """
                SELECT * FROM ACCOUNT_STATUS
                WHERE STATUS = ?
                AND UNBLOCK_AT IS NOT NULL
                AND UNBLOCK_AT <= ?
                ORDER BY UNBLOCK_AT ASC
                """;

        return jdbc.query(
                sql,
                accountStatusRowMapper(),
                STATUS_BLOCKED,
                Timestamp.valueOf(currentTime)
        );
    }

    /**
     * Reset account status to ACTIVE
     */
    public void resetAccountStatus(String accountNumber) {

        String sql = """
                UPDATE ACCOUNT_STATUS
                SET STATUS = ?,
                    BLOCKED_AT = NULL,
                    UNBLOCK_AT = NULL,
                    FAILED_COUNT_LAST_5_MIN = 0
                WHERE ACCOUNT_NUMBER = ?
                """;

        int rows = jdbc.update(sql, STATUS_ACTIVE, accountNumber);

        if (rows == 0) {
            logger.warn("No account found to reset for account {}", accountNumber);
        } else {
            logger.info("Account {} unblocked successfully", accountNumber);
        }
    }

    /**
     * RowMapper for AccountStatus
     */
    private RowMapper<AccountStatus> accountStatusRowMapper() {
        return (rs, rowNum) -> {

            AccountStatus status = new AccountStatus();
            status.setAccountNumber(rs.getString("ACCOUNT_NUMBER"));
            status.setStatus(rs.getString("STATUS"));

            Timestamp blockedAt = rs.getTimestamp("BLOCKED_AT");
            if (blockedAt != null) {
                status.setBlockedAt(blockedAt.toLocalDateTime());
            }

            Timestamp unblockAt = rs.getTimestamp("UNBLOCK_AT");
            if (unblockAt != null) {
                status.setUnblockAt(unblockAt.toLocalDateTime());
            }

            status.setFailedCountLast5Min(
                    rs.getInt("FAILED_COUNT_LAST_5_MIN")
            );

            return status;
        };
    }
}
