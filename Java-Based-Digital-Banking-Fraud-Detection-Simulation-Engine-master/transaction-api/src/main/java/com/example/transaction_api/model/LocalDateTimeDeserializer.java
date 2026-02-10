package com.example.transaction_api.model;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Custom deserializer for LocalDateTime that accepts multiple formats:
 * - ISO format: "2024-01-15T10:30:00"
 * - Space format: "2024-01-15 10:30:00"
 * - ISO with milliseconds: "2024-01-15T10:30:00.000"
 * - Space with milliseconds: "2024-01-15 10:30:00.000"
 */
public class LocalDateTimeDeserializer extends StdDeserializer<LocalDateTime> {

    private static final DateTimeFormatter[] FORMATTERS = {
        // ISO format with milliseconds (try first as it's most specific)
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"),
        // Space format with milliseconds
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"),
        // ISO format (standard) - without milliseconds
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
        // Space format (from Java transaction generator) - without milliseconds
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
    };

    public LocalDateTimeDeserializer() {
        super(LocalDateTime.class);
    }

    @Override
    public LocalDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String dateTimeString = parser.getText();

        if (dateTimeString == null || dateTimeString.trim().isEmpty()) {
            return null;
        }

        // Try each formatter until one works
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDateTime.parse(dateTimeString, formatter);
            } catch (DateTimeParseException e) {
                // Try next formatter
                continue;
            }
        }

        // If all formats fail, throw a descriptive error
        throw new IOException(
            String.format("Cannot parse timestamp '%s'. Supported formats: " +
                         "'yyyy-MM-ddTHH:mm:ss', 'yyyy-MM-dd HH:mm:ss', " +
                         "'yyyy-MM-ddTHH:mm:ss.SSS', 'yyyy-MM-dd HH:mm:ss.SSS'",
                         dateTimeString)
        );
    }
}

