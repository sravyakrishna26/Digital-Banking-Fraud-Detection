import os
import pandas as pd

# paths
base_dir = os.path.dirname(__file__)
input_path = os.path.join(base_dir, "..", "data", "synthetic_transactions.csv")
output_path = os.path.join(base_dir, "..", "data", "transactions_features.csv")

# load data
df = pd.read_csv(input_path)

# convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])
df["hour"] = df["timestamp"].dt.hour
df["day_of_week"] = df["timestamp"].dt.dayofweek

# drop unused columns
df = df.drop(columns=[
    "transactionId",
    "senderAccount",
    "receiverAccount",
    "ip_address",
    "location",
    "timestamp"
])

# one-hot encode categorical columns
df = pd.get_dummies(df, columns=[
    "currency",
    "transactionType",
    "channel",
    "status"
])

# convert boolean columns to int (TRUE/FALSE -> 1/0)
df = df.astype(int)


# save processed data
df.to_csv(output_path, index=False)

print("Feature engineering completed successfully")
print(f"Saved ML-ready dataset at: {output_path}")
