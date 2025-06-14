const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Azure Cosmos DB configuration
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE);
const container = database.container(process.env.COSMOS_DB_CONTAINER);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, createdAt } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email are required' });
    }

    const userDoc = {
      id: uid, // Use Firebase UID as Cosmos DB id
      uid,
      email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Upsert user (create or update)
    const { resource } = await container.items.upsert(userDoc);
    
    res.status(200).json({
      success: true,
      user: resource
    });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ 
      error: 'Failed to save user',
      details: error.message 
    });
  }
});

// Get user by UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const { resource } = await container.item(uid, uid).read();
    
    if (resource) {
      res.json({
        success: true,
        user: resource
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.code === 404) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch user',
        details: error.message 
      });
    }
  }
});

// Get all users (for admin/debugging)
app.get('/api/users', async (req, res) => {
  try {
    const { resources } = await container.items
      .query('SELECT * FROM c')
      .fetchAll();
    
    res.json({
      success: true,
      users: resources
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});

// Delete user
app.delete('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    await container.item(uid, uid).delete();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});