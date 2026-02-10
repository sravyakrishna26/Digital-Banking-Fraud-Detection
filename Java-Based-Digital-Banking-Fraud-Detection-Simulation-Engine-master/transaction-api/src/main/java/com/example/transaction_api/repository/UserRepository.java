package com.example.transaction_api.repository;

import com.example.transaction_api.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public User save(User user) {
        String sql = """
                    INSERT INTO USERS (USERNAME, EMAIL, PASSWORD_HASH, CREATED_AT)
                    VALUES (?, ?, ?, ?)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPasswordHash());
            ps.setTimestamp(4, user.getCreatedAt() != null
                    ? Timestamp.valueOf(user.getCreatedAt())
                    : Timestamp.valueOf(LocalDateTime.now()));
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            user.setUserId(keyHolder.getKey().longValue());
        }

        return user;
    }

    public Optional<User> findByUsername(String username) {
        String sql = "SELECT * FROM USERS WHERE USERNAME = ?";
        try {
            User user = jdbc.queryForObject(sql, userRowMapper(), username);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM USERS WHERE EMAIL = ?";
        try {
            User user = jdbc.queryForObject(sql, userRowMapper(), email);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<User> findById(Long userId) {
        String sql = "SELECT * FROM USERS WHERE USER_ID = ?";
        try {
            User user = jdbc.queryForObject(sql, userRowMapper(), userId);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean existsByUsername(String username) {
        String sql = "SELECT COUNT(*) FROM USERS WHERE USERNAME = ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, username);
        return count != null && count > 0;
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM USERS WHERE EMAIL = ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    /**
     * Get the first user in the system (for single admin system)
     * Used for sending fraud alert emails
     */
    public Optional<User> findFirstUser() {
        String sql = "SELECT * FROM USERS WHERE ROWNUM = 1 ORDER BY USER_ID ASC";
        try {
            User user = jdbc.queryForObject(sql, userRowMapper());
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private RowMapper<User> userRowMapper() {
        return (rs, rowNum) -> {
            User user = new User();
            user.setUserId(rs.getLong("USER_ID"));
            user.setUsername(rs.getString("USERNAME"));
            user.setEmail(rs.getString("EMAIL"));
            user.setPasswordHash(rs.getString("PASSWORD_HASH"));

            Timestamp timestamp = rs.getTimestamp("CREATED_AT");
            if (timestamp != null) {
                user.setCreatedAt(timestamp.toLocalDateTime());
            }

            return user;
        };
    }
}