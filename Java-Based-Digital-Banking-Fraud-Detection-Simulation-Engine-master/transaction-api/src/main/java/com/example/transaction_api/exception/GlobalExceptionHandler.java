package com.example.transaction_api.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler to provide detailed error messages for API requests.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        errors.put("error", "Validation failed");
        errors.put("status", HttpStatus.BAD_REQUEST.value());
        errors.put("message", "Request validation errors");
        errors.put("errors", fieldErrors);

        logger.warn("Validation error: {}", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleJsonParseException(HttpMessageNotReadableException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Invalid request body");
        error.put("status", HttpStatus.BAD_REQUEST.value());

        String message = "Invalid JSON format";

        // Check if it's a LocalDateTime parsing error
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException) {
            InvalidFormatException ife = (InvalidFormatException) cause;
            String fieldName = ife.getPath().stream()
                    .map(ref -> ref.getFieldName())
                    .reduce((first, second) -> second)
                    .orElse("unknown");

            if (ife.getTargetType() == java.time.LocalDateTime.class) {
                message = String.format(
                    "Invalid timestamp format for field '%s'. Supported formats: " +
                    "'yyyy-MM-ddTHH:mm:ss', 'yyyy-MM-dd HH:mm:ss', " +
                    "'yyyy-MM-ddTHH:mm:ss.SSS', 'yyyy-MM-dd HH:mm:ss.SSS'. " +
                    "Received: '%s'",
                    fieldName, ife.getValue());
            } else {
                message = String.format("Invalid format for field '%s': %s", fieldName, ife.getMessage());
            }
        } else if (cause instanceof java.io.IOException && cause.getMessage() != null && cause.getMessage().contains("Cannot parse timestamp")) {
            // Handle our custom deserializer's IOException
            message = cause.getMessage();
        } else if (cause != null) {
            message = cause.getMessage();
        } else {
            message = ex.getMessage();
        }

        error.put("message", message);
        error.put("details", "Check your JSON format and ensure all required fields are present");

        logger.error("JSON parsing error: {}", message, ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Internal server error");
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("message", ex.getMessage());

        logger.error("Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

