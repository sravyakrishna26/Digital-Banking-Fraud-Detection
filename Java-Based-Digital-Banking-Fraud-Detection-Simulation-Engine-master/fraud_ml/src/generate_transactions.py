import random
import pandas as pd
from datetime import datetime, timedelta

NUM_RECORDS = 5000

currencies = ["INR", "USD", "EUR"]
channels = ["CARD", "ATM", "NETBANKING", "MOBILE"]
transaction_types = ["PAYMENT", "TRANSFER", "WITHDRAW"]
locations = ["Hyderabad", "Bangalore", "Mumbai", "Delhi"]

def random_ip(is_suspicious=False):
    if is_suspicious:
        return f"172.{random.randint(16,31)}.{random.randint(0,255)}.{random.randint(0,255)}"
    return f"192.168.{random.randint(0,255)}.{random.randint(0,255)}"

data = []

start_time = datetime.now() - timedelta(days=30)

for i in range(NUM_RECORDS):

    amount = random.choice([
        random.randint(10, 5000),
        random.randint(5000, 20000),
        random.randint(50000, 200000)  # high amount
    ])

    velocity = random.randint(0, 6)
    failed_attempts = random.randint(0, 4)

    suspicious_ip = random.random() < 0.2
    ip = random_ip(suspicious_ip)

    # Fraud labeling rules
    is_fraud = 0
    if amount > 50000:
        is_fraud = 1
    if velocity >= 4:
        is_fraud = 1
    if failed_attempts >= 2:
        is_fraud = 1
    if suspicious_ip:
        is_fraud = 1

    status = "SUCCESS"
    if amount <= 0:
        status = "FAILED"
    elif is_fraud:
        status = "PENDING"

    data.append({
        "transactionId": f"TXN{i+100000}",
        "timestamp": start_time + timedelta(minutes=random.randint(0, 43200)),
        "amount": amount,
        "currency": random.choice(currencies),
        "transactionType": random.choice(transaction_types),
        "channel": random.choice(channels),
        "senderAccount": f"AC{random.randint(10000000,99999999)}",
        "receiverAccount": f"AC{random.randint(10000000,99999999)}",
        "ip_address": ip,
        "location": random.choice(locations),
        "velocity": velocity,
        "failed_attempts": failed_attempts,
        "status": status,
        "is_fraud": is_fraud
    })

df = pd.DataFrame(data)
df.to_csv("./synthetic_transactions.csv", index=False)

print("Synthetic transaction dataset generated successfully")
