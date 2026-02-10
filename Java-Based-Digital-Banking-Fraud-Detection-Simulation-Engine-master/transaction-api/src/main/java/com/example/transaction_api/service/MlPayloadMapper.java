package com.example.transaction_api.service;

import com.example.transaction_api.model.MlTransactionPayload;
import com.example.transaction_api.model.Transaction;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.DayOfWeek;

/**
 * Maps Transaction entity to ML model payload.
 * Converts LocalDateTime to hour and day_of_week (primitive types).
 */
@Component
public class MlPayloadMapper {

    public MlTransactionPayload toMlPayload(Transaction txn) {
        MlTransactionPayload payload = new MlTransactionPayload();

        payload.setAmount(txn.getAmount());
        payload.setCurrency(txn.getCurrency());
        payload.setTransactionType(txn.getTransactionType());
        payload.setChannel(txn.getChannel());
        payload.setStatus(txn.getStatus());

        // Extract hour and day_of_week from LocalDateTime
        LocalDateTime timestamp = txn.getTimestamp();
        if (timestamp != null) {
            // Hour of day (0-23)
            int hour = timestamp.getHour();
            payload.setHour(hour);

            // Day of week (0=Monday, 6=Sunday)
            DayOfWeek dayOfWeekEnum = timestamp.getDayOfWeek();
            // Java DayOfWeek: MONDAY=1, SUNDAY=7
            // Convert to 0-based: Monday=0, Sunday=6
            int dayOfWeek = dayOfWeekEnum.getValue() - 1;
            payload.setDayOfWeek(dayOfWeek);
        } else {
            // Default values if timestamp is null
            payload.setHour(12);  // Default to noon
            payload.setDayOfWeek(0);  // Default to Monday
        }

        return payload;
    }
}
