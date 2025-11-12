from utils.connect_db import get_db

def test_connection():
    try:
        db = get_db()
        print("✅ Connected to MongoDB")
        
        # Optional: Insert test
        db["auditsmartai"].insert_one({"test": "MongoDB connection successful"})
        print("✅ Test document inserted")
        
        # Optional: Fetch test
        doc = db["auditsmartai"].find_one({"test": "MongoDB connection successful"})
        print("✅ Fetched Document:", doc)

    except Exception as e:
        print("❌ Connection failed:", e)

if __name__ == "__main__":
    test_connection()
