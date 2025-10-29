import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🔍 MongoDB Connection Test\n');

const mongoUri = process.env.MONGO_URI;
console.log('Configuration Check:');
console.log('- MONGO_URI exists:', !!mongoUri);
console.log('- MONGO_URI length:', mongoUri?.length || 0);

if (!mongoUri) {
  console.log('\n❌ MONGO_URI is missing!');
  process.exit(1);
}

// Extract basic info from URI (safely)
try {
  const url = new URL(mongoUri.replace('mongodb+srv://', 'https://'));
  console.log('- Database host:', url.hostname);
  console.log('- Database name:', url.pathname.substring(1) || 'Not specified');
} catch (e) {
  console.log('- Could not parse URI details');
}

console.log('\nTesting MongoDB connection...');

const options = {
  serverSelectionTimeoutMS: 15000, // 15 seconds for initial connection
  connectTimeoutMS: 15000,
  socketTimeoutMS: 15000
};

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, options);
    
    console.log('✅ MongoDB connection successful!');
    console.log('✅ Database name:', mongoose.connection.name);
    console.log('✅ Connection ready state:', mongoose.connection.readyState);
    
    // Test a simple operation
    console.log('\n⏳ Testing database operations...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Collections found:', collections.length);
    
    if (collections.length > 0) {
      console.log('   Available collections:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.log('\n❌ MongoDB connection failed:');
    console.log('Error:', error.message);
    console.log('Error code:', error.code);
    
    if (error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Troubleshooting steps for ETIMEDOUT:');
      console.log('1. Check if MongoDB Atlas cluster is running (not paused)');
      console.log('2. Verify network connectivity');
      console.log('3. Check if your IP address is whitelisted in MongoDB Atlas');
      console.log('4. Try connecting from MongoDB Compass with the same URI');
      console.log('5. Check firewall settings');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Authentication issue:');
      console.log('1. Verify username and password in the URI');
      console.log('2. Check if the database user exists in MongoDB Atlas');
      console.log('3. Verify user permissions');
    }
    
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Connection test interrupted');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(0);
});

testConnection();