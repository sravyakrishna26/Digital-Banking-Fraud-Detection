package com.example.transaction_api.controller;

import com.example.transaction_api.model.ChannelWiseFraud;
import com.example.transaction_api.model.DashboardSummary;
import com.example.transaction_api.model.FraudTrend;
import com.example.transaction_api.model.LocationWiseFraud;
import com.example.transaction_api.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/fraud-trends")
    public ResponseEntity<List<FraudTrend>> getFraudTrends() {
        return ResponseEntity.ok(dashboardService.getFraudTrends());
    }

    @GetMapping("/channel-wise")
    public ResponseEntity<List<ChannelWiseFraud>> getChannelWiseFraud() {
        return ResponseEntity.ok(dashboardService.getChannelWiseFraud());
    }

    @GetMapping("/location-wise")
    public ResponseEntity<List<LocationWiseFraud>> getLocationWiseFraud() {
        return ResponseEntity.ok(dashboardService.getLocationWiseFraud());
    }
}
