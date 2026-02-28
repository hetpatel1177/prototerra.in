require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function run() {
  console.log("URI:", process.env.MONGODB_URI);
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
