package org.example;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class FakeDataGenerator {

    static Random random = new Random();
    static String[] currencies = {"INR", "USD", "EUR", "GBP"};
    static String[] transactionTypes = {"TRANSFER", "WITHDRAW", "DEPOSIT", "PAYMENT"};
    static String[] channels = {"MOBILE", "ATM", "CARD", "NETBANKING"};
    static String[] locations = {"Mumbai", "Hyderabad", "Bangalore", "Delhi", "Pune", "Chennai"};

    public static String randomAccount() {
        return "AC" + (10000000 + random.nextInt(90000000));
    }

    public static String randomIP() {
        return random.nextInt(256) + "." +
                random.nextInt(256) + "." +
                random.nextInt(256) + "." +
                random.nextInt(256);
    }

    public static String randomDateTime() {
        LocalDateTime dateTime = LocalDateTime.now()
                .minusDays(random.nextInt(30))
                .minusHours(random.nextInt(24))
                .minusMinutes(random.nextInt(60));

        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public static Transaction generateTransaction() {
        return new Transaction(
                "TXN" + System.currentTimeMillis(),
                randomDateTime(),
                currencies[random.nextInt(currencies.length)],
                Math.round((100 + random.nextDouble() * 90000) * 100.0) / 100.0,
                randomAccount(),
                randomAccount(),
                transactionTypes[random.nextInt(transactionTypes.length)],
                channels[random.nextInt(channels.length)],
                null, // ❗ STATUS decided by service
                randomIP(),
                locations[random.nextInt(locations.length)]
        );
    }

}
