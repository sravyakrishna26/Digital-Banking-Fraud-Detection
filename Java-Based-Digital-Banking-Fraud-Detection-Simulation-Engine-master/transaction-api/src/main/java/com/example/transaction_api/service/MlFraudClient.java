package com.example.transaction_api.service;

import com.example.transaction_api.model.MlTransactionPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Client for ML Fraud Detection Service.
 * Calls Python ML API at http://127.0.0.1:5000/predict-fraud
 */
@Component
public class MlFraudClient {

    private static final Logger logger = LoggerFactory.getLogger(MlFraudClient.class);
    private static final String ML_URL = "http://127.0.0.1:5000/predict-fraud";

    private final RestTemplate restTemplate;

    public MlFraudClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Predicts fraud probability using ML model.
     *
     * @param payload Transaction data formatted for ML model
     * @return Map containing "fraud_probability" (double) and optionally "is_fraud" (boolean/int)
     *         Returns default values (fraud_probability=0.0) if ML service is unavailable
     */
    public Map<String, Object> predictFraud(MlTransactionPayload payload) {
        try {
            logger.debug("Calling ML fraud detection service: {}", ML_URL);
            Map<String, Object> result = restTemplate.postForObject(
                    ML_URL,
                    payload,
                    Map.class
            );

            if (result != null) {
                logger.debug("ML service responded with: {}", result);
                return result;
            } else {
                logger.warn("ML service returned null response");
                return getDefaultResponse();
            }

        } catch (RestClientException e) {
            logger.error("ML fraud detection service unavailable: {}. Using default values.", e.getMessage());
            return getDefaultResponse();
        } catch (Exception e) {
            logger.error("Unexpected error calling ML service: {}", e.getMessage(), e);
            return getDefaultResponse();
        }
    }

    /**
     * Returns default response when ML service is unavailable.
     * Fraud probability = 0.0, indicating no fraud detected.
     */
    private Map<String, Object> getDefaultResponse() {
        Map<String, Object> defaultResponse = new HashMap<>();
        defaultResponse.put("fraud_probability", 0.0);
        defaultResponse.put("is_fraud", false);
        return defaultResponse;
    }
}
