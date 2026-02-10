package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class TransactionGeneratorMain {

    public static void main(String[] args) {

        int count = 1;
        ObjectMapper mapper = new ObjectMapper();

        for (int i = 0; i < count; i++) {
            try {
                Transaction txn = FakeDataGenerator.generateTransaction();
                String json = mapper.writeValueAsString(txn);

                URL url = new URL("http://localhost:8080/api/transactions");
                HttpURLConnection con = (HttpURLConnection) url.openConnection();

                con.setRequestMethod("POST");
                con.setRequestProperty("Content-Type", "application/json");
                con.setDoOutput(true);

                try (OutputStream os = con.getOutputStream()) {
                    os.write(json.getBytes());
                }

                int responseCode = con.getResponseCode();
                System.out.println("Transaction " + (i + 1) + " - Response Code: " + responseCode);

                if (responseCode >= 200 && responseCode < 300) {
                    System.out.println("✓ Transaction sent successfully: " + txn.getTransactionId());
                } else {
                    System.out.println("✗ Failed to send transaction: " + txn.getTransactionId());
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
