package com.example.transaction_api.controller;

import com.example.transaction_api.model.Transaction;
import com.example.transaction_api.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> saveTransaction(
            @Valid @RequestBody Transaction transaction,
            BindingResult result) {

        // Log incoming request for debugging
        org.slf4j.LoggerFactory.getLogger(TransactionController.class)
            .info("Received transaction: {}", transaction.getTransactionId());

        // Check for validation errors (from @Valid annotation)
        if (result.hasErrors()) {
            Map<String, Object> errorResponse = new HashMap<>();
            Map<String, String> fieldErrors = new HashMap<>();

            result.getFieldErrors().forEach(error -> {
                fieldErrors.put(error.getField(), error.getDefaultMessage());
            });

            errorResponse.put("error", "Validation failed");
            errorResponse.put("status", 400);
            errorResponse.put("message", "Request validation errors");
            errorResponse.put("errors", fieldErrors);

            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            service.processTransaction(transaction);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transaction saved successfully");
            response.put("transactionId", transaction.getTransactionId());
            response.put("status", transaction.getStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process transaction");
            errorResponse.put("status", 500);
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }


    @GetMapping
    public ResponseEntity<?> getAllTransactions() {
        return ResponseEntity.ok(service.getAllTransactions());
    }

    @GetMapping("/fraud")
    public ResponseEntity<List<Transaction>> getFraudTransactions() {
        return ResponseEntity.ok(service.getFraudTransactions());
    }

    @GetMapping("/success")
    public ResponseEntity<List<Transaction>> getSuccessTransactions() {
        return ResponseEntity.ok(service.getSuccessTransactions());
    }

    @GetMapping("/failed")
    public ResponseEntity<List<Transaction>> getFailedTransactions() {
        return ResponseEntity.ok(service.getFailedTransactions());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Transaction>> getPendingTransactions() {
        return ResponseEntity.ok(service.getPendingTransactions());
    }


}
