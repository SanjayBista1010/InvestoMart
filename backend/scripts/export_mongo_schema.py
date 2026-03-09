import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv('MONGO_URI')
MONGODB_NAME = os.getenv('MONGO_DB_NAME', 'goatfarm')

def get_type_name(value):
    if isinstance(value, dict):
        return "Object"
    elif isinstance(value, list):
        if len(value) > 0:
            return f"Array[{get_type_name(value[0])}]"
        return "Array"
    elif value is None:
        return "Null"
    else:
        return type(value).__name__

def analyze_schema():
    print(f"Connecting to MongoDB...")
    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_NAME]
    
    collections = db.list_collection_names()
    print(f"Found {len(collections)} collections in database '{MONGODB_NAME}'\n")
    
    schema_dump_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mongodb_schema_dump.md")
    
    with open(schema_dump_path, "w", encoding='utf-8') as f:
        f.write(f"# MongoDB Schema Dump for database `{MONGODB_NAME}`\n\n")
        
        for coll_name in sorted(collections):
            print(f"Analyzing {coll_name}...")
            collection = db[coll_name]
            
            # Sample up to 50 documents to find most fields and handle optional properties
            sample_docs = collection.find().limit(50)
            
            schema = {}
            doc_count = 0
            for doc in sample_docs:
                doc_count += 1
                for key, value in doc.items():
                    if key not in schema:
                        schema[key] = set()
                    
                    # Don't add None if we already have a real type (unless it's only None)
                    type_name = get_type_name(value)
                    if type_name != "Null" or len(schema[key]) == 0:
                        schema[key].add(type_name)
                    
            f.write(f"## Collection: `{coll_name}`\n")
            f.write(f"*(Based on a sample of {doc_count} documents)*\n\n")
            
            if not schema:
                f.write("*Collection is empty or no documents were sampled.*\n\n")
                continue
                
            f.write("| Field Name | Inferred Types |\n")
            f.write("| ---------- | -------------- |\n")
            for key in sorted(schema.keys()):
                # Remove Null if there are other types, to avoid clutter
                types_set = schema[key]
                if "Null" in types_set and len(types_set) > 1:
                    types_set.remove("Null")
                    types_set.add("Optional")
                
                types_str = ", ".join(sorted(list(types_set)))
                f.write(f"| `{key}` | {types_str} |\n")
            f.write("\n")
            
    print(f"\nSchema dump complete! Saved to {schema_dump_path}")

if __name__ == "__main__":
    analyze_schema()
