package com.example.transaction_api.controller;

import com.example.transaction_api.model.AccountStatus;
import com.example.transaction_api.service.AccountStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountStatusService accountStatusService;

    public AccountController(AccountStatusService accountStatusService) {
        this.accountStatusService = accountStatusService;
    }

    @GetMapping("/status/{accountNumber}")
    public ResponseEntity<?> getAccountStatus(@PathVariable String accountNumber) {
        try {
            AccountStatus status = accountStatusService.getAccountStatus(accountNumber);

            Map<String, Object> response = new HashMap<>();
            response.put("accountNumber", status.getAccountNumber());
            response.put("status", status.getStatus());
            response.put("blockedAt", status.getBlockedAt());
            response.put("unblockAt", status.getUnblockAt());
            response.put("failedCountLast5Min", status.getFailedCountLast5Min());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get account status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/blocked")
    public ResponseEntity<?> getBlockedAccounts() {
        try {
            List<AccountStatus> blockedAccounts = accountStatusService.getBlockedAccounts();

            Map<String, Object> response = new HashMap<>();
            response.put("count", blockedAccounts.size());
            response.put("accounts", blockedAccounts);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get blocked accounts");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}