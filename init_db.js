import { MongoClient } from 'mongodb';

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'travel_by';

async function main() {
  const client = new MongoClient(mongoUrl);
  try {
    console.log('🔌 Connecting to local MongoDB at mongodb://localhost:27017...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const db = client.db(dbName);

    // List existing collections
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map(c => c.name);

    console.log('🛠️ Rebuilding collections and validation indexes...');

    // 1. Rebuild app_users
    if (!existingNames.includes('app_users')) {
      await db.createCollection('app_users');
      console.log('  - Created collection: app_users');
    }
    await db.collection('app_users').createIndex({ email: 1 }, { unique: true });

    // 2. Rebuild admins
    if (!existingNames.includes('admins')) {
      await db.createCollection('admins');
      console.log('  - Created collection: admins');
    }
    await db.collection('admins').createIndex({ username: 1 }, { unique: true });

    // 3. Rebuild drivers
    if (!existingNames.includes('drivers')) {
      await db.createCollection('drivers');
      console.log('  - Created collection: drivers');
    }
    await db.collection('drivers').createIndex({ email: 1 }, { unique: true });

    // 4. Rebuild driver_documents
    if (!existingNames.includes('driver_documents')) {
      await db.createCollection('driver_documents');
      console.log('  - Created collection: driver_documents');
    }
    await db.collection('driver_documents').createIndex({ email: 1 }, { unique: true });

    // 5. Rebuild system_logs
    if (!existingNames.includes('system_logs')) {
      await db.createCollection('system_logs');
      console.log('  - Created collection: system_logs');
    }

    console.log('🛠️ Database collections and indexes ensure complete.');
    console.log('🎉 MongoDB database schema setup completed successfully!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    await client.close();
  }
}

main();
