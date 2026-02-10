package com.example.transaction_api.service;

import com.example.transaction_api.model.Transaction;
import com.example.transaction_api.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final UserService userService;

    public EmailService(JavaMailSender mailSender, UserService userService) {
        this.mailSender = mailSender;
        this.userService = userService;
    }

    public void sendFraudAlert(Transaction transaction) {
        try {
            // Get the first user's email (single admin system)
            // First try to find user with username "admin", otherwise get the first user
            Optional<User> adminUser = userService.findByUsername("admin");

            if (adminUser.isEmpty()) {
                // Try to get the first user in the system
                adminUser = userService.findFirstUser();
            }

            if (adminUser.isEmpty()) {
                logger.warn("No admin user found. Cannot send fraud alert email.");
                logger.info("Please ensure an admin user exists in the database.");
                return;
            }

            User admin = adminUser.get();
            String adminEmail = admin.getEmail();

            if (adminEmail == null || adminEmail.trim().isEmpty()) {
                logger.warn("Admin email is not configured. Cannot send fraud alert.");
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("🚨 Fraud Alert Detected");
            message.setText(buildEmailBody(transaction));

            mailSender.send(message);
            logger.info("Fraud alert email sent successfully to: {}", adminEmail);

        } catch (Exception e) {
            logger.error("Failed to send fraud alert email: {}", e.getMessage(), e);
            // Don't throw exception - email failure shouldn't break transaction processing
        }
    }

    private String buildEmailBody(Transaction transaction) {
        StringBuilder body = new StringBuilder();
        body.append("🚨 FRAUD ALERT DETECTED\n\n");
        body.append("A fraudulent transaction has been detected in the system.\n\n");
        body.append("Transaction Details:\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        body.append("Transaction ID: ").append(transaction.getTransactionId()).append("\n");
        body.append("Amount: ").append(transaction.getCurrency()).append(" ").append(transaction.getAmount())
                .append("\n");
        body.append("Sender Account: ").append(transaction.getSenderAccount()).append("\n");
        body.append("Receiver Account: ").append(transaction.getReceiverAccount()).append("\n");
        body.append("Status: ").append(transaction.getStatus()).append("\n");
        body.append("Fraud Reason: ")
                .append(transaction.getFraudReason() != null ? transaction.getFraudReason() : "N/A").append("\n");

        if (transaction.getMlScore() != null) {
            body.append("ML Fraud Score: ").append(String.format("%.2f%%", transaction.getMlScore() * 100))
                    .append("\n");
        }

        body.append("Timestamp: ").append(transaction.getTimestamp() != null ? transaction.getTimestamp() : "N/A")
                .append("\n");

        if (transaction.getChannel() != null) {
            body.append("Channel: ").append(transaction.getChannel()).append("\n");
        }

        if (transaction.getLocation() != null) {
            body.append("Location: ").append(transaction.getLocation()).append("\n");
        }

        if (transaction.getIpAddress() != null) {
            body.append("IP Address: ").append(transaction.getIpAddress()).append("\n");
        }

        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        body.append("Please review this transaction immediately.\n");
        body.append("This is an automated alert from the Fraud Detection System.");

        return body.toString();
    }
}