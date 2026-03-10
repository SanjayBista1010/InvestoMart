const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

if (!uri || !dbName) {
    console.error("Error: MONGO_URI or MONGO_DB_NAME not found in .env");
    process.exit(1);
}

const REQUIRED_COLLECTIONS = [
    "auth_user",
    "chat_messages",
    "chatbot_analytics",
    "chatbot_sessions",
    "dashboard_analytics",
    "health_records",
    "livestock",
    "price_history",
    "products",
    "recommendations",
    "transactions",
    "user_investments",
    "users",
    "video_surveillance"
];

async function initializeDatabase() {
    const client = new MongoClient(uri);

    try {
        console.log(`Connecting to MongoDB Atlas...`);
        console.log(`Target Database: ${dbName}`);
        
        await client.connect();
        console.log("Connected successfully!\n");
        
        const db = client.db(dbName);
        
        // Get existing collections
        const collections = await db.listCollections().toArray();
        const existingNames = collections.map(c => c.name);
        
        let createdCount = 0;
        
        for (const name of REQUIRED_COLLECTIONS) {
            if (!existingNames.includes(name)) {
                console.log(`Creating collection: ${name}...`);
                await db.createCollection(name);
                createdCount++;
            } else {
                console.log(`Collection already exists: ${name}`);
            }
        }
        
        console.log(`\nInitialization complete! Added ${createdCount} new collections out of ${REQUIRED_COLLECTIONS.length} total required.`);
        
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        await client.close();
    }
}

initializeDatabase();
