// src/lib/testConnection.js
import azureDB from './azureDb.js';

export const testAzureConnection = async () => {
  console.log('🔄 Testing Azure DB connection...');
  
  try {
    const isConnected = await azureDB.initialize();
    
    if (isConnected) {
      console.log('✅ Azure DB connection successful!');
      
      // Test getting all users (should be empty initially)
      const result = await azureDB.getAllUsers();
      console.log('📊 Current users in database:', result.users?.length || 0);
      
      return true;
    } else {
      console.log('❌ Azure DB connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
};