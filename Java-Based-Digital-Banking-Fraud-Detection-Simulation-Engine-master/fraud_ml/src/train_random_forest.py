import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# paths
base_dir = os.path.dirname(__file__)
data_path = os.path.join(base_dir, "..", "data", "transactions_features.csv")
model_path = os.path.join(base_dir, "..", "model", "fraud_model.pkl")

# ensure model directory exists
os.makedirs(os.path.dirname(model_path), exist_ok=True)

# load dataset
df = pd.read_csv(data_path)

# ❌ Remove leaky columns
leaky_features = [
    "velocity",
    "failed_attempts",
    "status_PENDING",
    "status_SUCCESS"
]

X = df.drop(columns=["is_fraud"] + leaky_features)
y = df["is_fraud"]


# train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# train Random Forest
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_split=5,
    class_weight="balanced",
    random_state=42
)

joblib.dump(model, "./model/fraud_model.pkl")
joblib.dump(list(X.columns), "./model/feature_columns.pkl")

print("Model and feature columns saved successfully")


model.fit(X_train, y_train)

# predictions
y_pred = model.predict(X_test)

# evaluation
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# save model
joblib.dump(model, model_path)

print(f"\nRandom Forest model saved at: {model_path}")
