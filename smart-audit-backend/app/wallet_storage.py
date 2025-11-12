import json
from datetime import datetime, timedelta
from pathlib import Path

# JSON file path
WALLET_DATA_FILE = Path("wallet_data.json")

# Whitelisted wallets (unlimited audits)
WHITELISTED_WALLETS = [
    "0xb97fcdcd02fe2b50d8014b80080c904845e027f1",
    "0x857b213598ed77fb4e862fc4355c13c472b94078",
    "0xc1e43b61445cd96e096554a637ac2a43451ebce2",
    "0x6e7bd4a9c0b4695dd21bd7557a6c55ae4676cb1c"
]

def load_wallet_data():
    if WALLET_DATA_FILE.exists():
        with open(WALLET_DATA_FILE, "r") as file:
            try:
                data = json.load(file)
            except json.JSONDecodeError:
                # If the JSON is corrupted, reset it
                data = {}

        if "wallet_audit_registry" not in data:
            data["wallet_audit_registry"] = {}
        if "wallet_usage_log" not in data:
            data["wallet_usage_log"] = []

        return data
    return {"wallet_audit_registry": {}, "wallet_usage_log": []}

def save_wallet_data(data):
    with open(WALLET_DATA_FILE, "w") as file:
        json.dump(data, file, indent=4, default=str)

def clean_old_wallet_entries(data):
    """Remove entries older than 24 hours"""
    now = datetime.utcnow()
    cleaned_log = [
        entry for entry in data["wallet_usage_log"]
        if now - datetime.fromisoformat(entry['timestamp']) < timedelta(hours=24)
    ]
    data["wallet_usage_log"] = cleaned_log
    save_wallet_data(data)

def is_wallet_allowed(wallet_address):
    wallet_address = wallet_address.lower()
    data = load_wallet_data()

    # Whitelisted wallets have unlimited access
    if wallet_address in [w.lower() for w in WHITELISTED_WALLETS]:
        return True, "Wallet is whitelisted. Unlimited audits allowed."

    now = datetime.utcnow()

    # Count unique wallets that accessed today
    unique_wallets_today = set()
    for entry in data["wallet_usage_log"]:
        entry_time = datetime.fromisoformat(entry["timestamp"])
        if now.date() == entry_time.date():
            unique_wallets_today.add(entry["wallet"])

    # Check if wallet already audited in the last 24 hours
    if wallet_address in data["wallet_audit_registry"]:
        last_audit_time = datetime.fromisoformat(data["wallet_audit_registry"][wallet_address])
        if now - last_audit_time < timedelta(hours=24):
            return False, "You have already used your free audit within the last 24 hours."

    # Enforce daily limit (max 100 unique wallets per day)
    if wallet_address not in unique_wallets_today and len(unique_wallets_today) >= 100:
        return False, "Daily audit limit reached. Please try again tomorrow."

    # Update wallet registry and log usage
    data["wallet_audit_registry"][wallet_address] = now.isoformat()
    data["wallet_usage_log"].append({"wallet": wallet_address, "timestamp": now.isoformat()})

    clean_old_wallet_entries(data)
    save_wallet_data(data)
    return True, "Audit allowed."
