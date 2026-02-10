package com.example.transaction_api.repository;

import com.example.transaction_api.model.ChannelWiseFraud;
import com.example.transaction_api.model.FraudTrend;
import com.example.transaction_api.model.LocationWiseFraud;
import com.example.transaction_api.model.Transaction;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class TransactionRepository {

    private final JdbcTemplate jdbc;

    public TransactionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // INSERT
    public void insertTransaction(Transaction t) {

        String sql = """
        INSERT INTO TRANSACTIONS
        (TRANSACTION_ID, TIMESTAMP_VAL, CURRENCY, AMOUNT, SENDER_ACCOUNT,
         RECEIVER_ACCOUNT, TRANSACTION_TYPE, CHANNEL, STATUS,
         IP_ADDRESS, LOCATION, FRAUD_FLAG, FRAUD_REASON, ML_SCORE)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        // Convert LocalDateTime to Timestamp for Oracle
        Timestamp timestamp = null;
        if (t.getTimestamp() != null) {
            timestamp = Timestamp.valueOf(t.getTimestamp());
        } else {
            timestamp = new Timestamp(System.currentTimeMillis());
        }

        jdbc.update(sql,
                t.getTransactionId(),
                timestamp,
                t.getCurrency(),
                t.getAmount(),
                t.getSenderAccount(),
                t.getReceiverAccount(),
                t.getTransactionType(),
                t.getChannel(),
                t.getStatus(),
                t.getIpAddress(),
                t.getLocation(),
                t.getFraudFlag() != null ? t.getFraudFlag() : 0,
                t.getFraudReason(),
                t.getMlScore() != null ? t.getMlScore() : 0.0
        );
    }


    // GET ALL
    public List<Transaction> findAll() {
        String sql = "SELECT * FROM TRANSACTIONS";

        return jdbc.query(sql, transactionRowMapper());
    }

    private RowMapper<Transaction> transactionRowMapper() {
        return (rs, rowNum) -> {
            Transaction t = new Transaction();
            t.setTransactionId(rs.getString("TRANSACTION_ID"));

            // Convert Oracle TIMESTAMP to LocalDateTime
            Timestamp timestamp = rs.getTimestamp("TIMESTAMP_VAL");
            if (timestamp != null) {
                t.setTimestamp(timestamp.toLocalDateTime());
            }

            t.setCurrency(rs.getString("CURRENCY"));
            t.setAmount(rs.getDouble("AMOUNT"));
            t.setSenderAccount(rs.getString("SENDER_ACCOUNT"));
            t.setReceiverAccount(rs.getString("RECEIVER_ACCOUNT"));
            t.setTransactionType(rs.getString("TRANSACTION_TYPE"));
            t.setChannel(rs.getString("CHANNEL"));
            t.setStatus(rs.getString("STATUS"));
            t.setIpAddress(rs.getString("IP_ADDRESS"));
            t.setLocation(rs.getString("LOCATION"));
            t.setFraudFlag(rs.getInt("FRAUD_FLAG"));
            t.setFraudReason(rs.getString("FRAUD_REASON"));

            // Set ML score if column exists (might be null)
            try {
                Double mlScore = rs.getDouble("ML_SCORE");
                if (!rs.wasNull()) {
                    t.setMlScore(mlScore);
                }
            } catch (Exception e) {
                // Column doesn't exist yet - ignore
            }

            return t;
        };
    }

    public List<Transaction> findFraudTransactions() {

        String sql = """
        SELECT * FROM TRANSACTIONS
        WHERE FRAUD_FLAG = 1
        ORDER BY TIMESTAMP_VAL DESC
    """;

        return jdbc.query(sql, transactionRowMapper());
    }

    public int countRecentTransactions(String senderAccount) {
        String sql = """
        SELECT COUNT(*)
        FROM TRANSACTIONS
        WHERE SENDER_ACCOUNT = ?
        AND TIMESTAMP_VAL >= SYSDATE - (5 / (24 * 60))
    """;

        return jdbc.queryForObject(sql, Integer.class, senderAccount);
    }


    public Double avgAmountLast5Min(String senderAccount) {
        String sql = """
        SELECT AVG(AMOUNT)
        FROM TRANSACTIONS
        WHERE SENDER_ACCOUNT = ?
        AND TIMESTAMP_VAL >= SYSDATE - (5 / (24 * 60))
    """;

        return jdbc.queryForObject(sql, Double.class, senderAccount);
    }

    public int countRecentFailedTxns(String senderAccount) {
        String sql = """
        SELECT COUNT(*)
        FROM TRANSACTIONS
        WHERE SENDER_ACCOUNT = ?
        AND STATUS = 'FAILED'
        AND TIMESTAMP_VAL >= SYSDATE - (5 / (24 * 60))
    """;

        return jdbc.queryForObject(sql, Integer.class, senderAccount);
    }

    public List<Transaction> findByStatus(String status) {

        String sql = """
        SELECT * FROM TRANSACTIONS
        WHERE STATUS = ?
    """;

        return jdbc.query(sql, transactionRowMapper(), status);
    }

    /* ================= DASHBOARD QUERIES ================= */

    public long countTotalTransactions() {
        String sql = "SELECT COUNT(*) FROM TRANSACTIONS";
        Long count = jdbc.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public long countFraudTransactions() {
        String sql = "SELECT COUNT(*) FROM TRANSACTIONS WHERE FRAUD_FLAG = 1";
        Long count = jdbc.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public long countTransactionsByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM TRANSACTIONS WHERE STATUS = ?";
        Long count = jdbc.queryForObject(sql, Long.class, status);
        return count != null ? count : 0L;
    }

    public List<FraudTrend> getFraudTrends() {
        String sql = """
            SELECT TRUNC(TIMESTAMP_VAL) AS TRANSACTION_DATE, COUNT(*) AS FRAUD_COUNT
            FROM TRANSACTIONS
            WHERE FRAUD_FLAG = 1
            GROUP BY TRUNC(TIMESTAMP_VAL)
            ORDER BY TRANSACTION_DATE DESC
        """;

        return jdbc.query(sql, (rs, rowNum) -> {
            Date date = rs.getDate("TRANSACTION_DATE");
            LocalDate localDate = date != null ? date.toLocalDate() : LocalDate.now();
            long fraudCount = rs.getLong("FRAUD_COUNT");
            return new FraudTrend(localDate, fraudCount);
        });
    }

    public List<ChannelWiseFraud> getChannelWiseFraud() {
        String sql = """
            SELECT
                CHANNEL,
                SUM(CASE WHEN FRAUD_FLAG = 1 THEN 1 ELSE 0 END) AS FRAUD_COUNT,
                SUM(CASE WHEN FRAUD_FLAG = 0 THEN 1 ELSE 0 END) AS NON_FRAUD_COUNT,
                COUNT(*) AS TOTAL_COUNT
            FROM TRANSACTIONS
            WHERE CHANNEL IS NOT NULL
            GROUP BY CHANNEL
            ORDER BY FRAUD_COUNT DESC
        """;

        return jdbc.query(sql, (rs, rowNum) -> {
            String channel = rs.getString("CHANNEL");
            long fraudCount = rs.getLong("FRAUD_COUNT");
            long nonFraudCount = rs.getLong("NON_FRAUD_COUNT");
            long totalCount = rs.getLong("TOTAL_COUNT");
            return new ChannelWiseFraud(channel, fraudCount, nonFraudCount, totalCount);
        });
    }

    public List<LocationWiseFraud> getLocationWiseFraud() {
        String sql = """
            SELECT
                LOCATION,
                SUM(CASE WHEN FRAUD_FLAG = 1 THEN 1 ELSE 0 END) AS FRAUD_COUNT,
                COUNT(*) AS TOTAL_TRANSACTIONS
            FROM TRANSACTIONS
            WHERE LOCATION IS NOT NULL
            GROUP BY LOCATION
            HAVING SUM(CASE WHEN FRAUD_FLAG = 1 THEN 1 ELSE 0 END) > 0
            ORDER BY FRAUD_COUNT DESC
        """;

        return jdbc.query(sql, (rs, rowNum) -> {
            String location = rs.getString("LOCATION");
            long fraudCount = rs.getLong("FRAUD_COUNT");
            long totalTransactions = rs.getLong("TOTAL_TRANSACTIONS");
            return new LocationWiseFraud(location, fraudCount, totalTransactions);
        });
    }

}
