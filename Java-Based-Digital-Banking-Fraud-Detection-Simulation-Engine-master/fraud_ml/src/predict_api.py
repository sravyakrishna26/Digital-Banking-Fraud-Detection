from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "fraud_model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "..", "model", "feature_columns.pkl")

# Load model and feature list
model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(FEATURE_PATH)

@app.route("/predict-fraud", methods=["POST"])
def predict_fraud():
    data = request.json

    # Create dataframe with correct feature order
    df = pd.DataFrame([data])

    # Add missing columns with 0
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    # Reorder columns
    df = df[feature_columns]

    fraud_prob = model.predict_proba(df)[0][1]
    decision = "FRAUD" if fraud_prob >= 0.7 else "LEGIT"

    return jsonify({
        "fraud_probability": round(float(fraud_prob), 3),
        "decision": decision
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
