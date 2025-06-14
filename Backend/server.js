const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware - FIXED: Single CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Azure Cosmos DB configuration
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE);
const userContainer = database.container(process.env.COSMOS_DB_CONTAINER);

// Helper function to generate chat container name
const generateChatContainerName = (user) => {
  const emailPrefix = user.email ? user.email.split('@')[0] : '';
  const displayName = user.displayName ? user.displayName.replace(/\s+/g, '') : '';
  const uid = user.uid.substring(0, 8);
  
  const baseName = displayName || emailPrefix || `user_${uid}`;
  const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `${cleanName}_${uid}_chats`;
};

// Helper function to create chat container
const createChatContainer = async (containerName) => {
  try {
    console.log(`📁 Creating chat container: ${containerName}`);
    
    const { container } = await database.containers.createIfNotExists({
      id: containerName,
      partitionKey: {
        kind: "Hash",
        paths: ["/chatId"]
      }
    });

    // Add a welcome message to initialize the container
    await container.items.create({
      id: "welcome_message",
      chatId: "system",
      messageType: "system",
      message: "Welcome to your personal chat container!",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    console.log(`✅ Chat container created successfully: ${containerName}`);
    return { success: true, containerName };
  } catch (error) {
    if (error.code === 409) {
      // Container already exists
      console.log(`ℹ️ Chat container already exists: ${containerName}`);
      return { success: true, containerName, existed: true };
    }
    console.error(`❌ Error creating chat container ${containerName}:`, error);
    throw error;
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, createdAt } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email are required' });
    }

    const userDoc = {
      id: uid,
      uid,
      email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocked: [], // Initialize blocked array
      isOnline: true
    };

    const { resource } = await userContainer.items.upsert(userDoc);
    
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

// NEW: Create user with chat container (combined registration)
app.post('/api/users/register-with-chat', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, createdAt, blocked = [] } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email are required' });
    }

    // Generate chat container name
    const chatContainerName = generateChatContainerName({ uid, email, displayName });
    
    console.log(`🚀 Starting user registration with chat container for: ${email}`);
    console.log(`📁 Generated container name: ${chatContainerName}`);

    // Create user document
    const userDoc = {
      id: uid,
      uid,
      email,
      displayName: displayName || email.split('@')[0] || 'User',
      photoURL: photoURL || '',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocked: blocked,
      isOnline: true,
      chatContainerName: chatContainerName
    };

    // Create user first
    console.log('👤 Creating user document...');
    const { resource: createdUser } = await userContainer.items.upsert(userDoc);
    console.log('✅ User document created successfully');

    // Create chat container
    console.log('📁 Creating chat container...');
    const containerResult = await createChatContainer(chatContainerName);
    
    if (containerResult.success) {
      console.log('✅ User registration with chat container completed successfully');
      res.status(200).json({
        success: true,
        user: createdUser,
        chatContainerName: chatContainerName,
        containerCreated: !containerResult.existed
      });
    } else {
      console.error('❌ Failed to create chat container');
      res.status(500).json({
        error: 'User created but failed to create chat container',
        user: createdUser
      });
    }

  } catch (error) {
    console.error('❌ Error in register-with-chat:', error);
    res.status(500).json({ 
      error: 'Failed to register user with chat container',
      details: error.message 
    });
  }
});

// Get user by UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const { resource } = await userContainer.item(uid, uid).read();
    
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

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const { resources } = await userContainer.items
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

// Update user
app.put('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;
    
    // Get existing user first
    const { resource: existingUser } = await userContainer.item(uid, uid).read();
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Merge update data with existing user
    const updatedUser = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await userContainer.items.upsert(updatedUser);
    
    res.json({
      success: true,
      user: resource
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    });
  }
});

// Block user
app.post('/api/users/:uid/block', async (req, res) => {
  try {
    const { uid } = req.params;
    const { userToBlockId } = req.body;
    
    if (!userToBlockId) {
      return res.status(400).json({ error: 'userToBlockId is required' });
    }
    
    // Get current user
    const { resource: currentUser } = await userContainer.item(uid, uid).read();
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user to block (to get their info)
    const { resource: userToBlock } = await userContainer.item(userToBlockId, userToBlockId).read();
    if (!userToBlock) {
      return res.status(404).json({ error: 'User to block not found' });
    }
    
    // Initialize blocked array if it doesn't exist
    const blocked = currentUser.blocked || [];
    
    // Check if user is already blocked
    if (blocked.some(blockedUser => blockedUser.userId === userToBlockId)) {
      return res.status(400).json({ error: 'User is already blocked' });
    }
    
    // Add user to blocked list
    blocked.push({
      userId: userToBlockId,
      email: userToBlock.email,
      displayName: userToBlock.displayName,
      blockedAt: new Date().toISOString()
    });
    
    // Update user document
    const updatedUser = {
      ...currentUser,
      blocked,
      updatedAt: new Date().toISOString()
    };
    
    await userContainer.items.upsert(updatedUser);
    
    res.json({
      success: true,
      message: 'User blocked successfully',
      blockedUsers: blocked
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ 
      error: 'Failed to block user',
      details: error.message 
    });
  }
});

// Unblock user
app.post('/api/users/:uid/unblock', async (req, res) => {
  try {
    const { uid } = req.params;
    const { userToUnblockId } = req.body;
    
    if (!userToUnblockId) {
      return res.status(400).json({ error: 'userToUnblockId is required' });
    }
    
    // Get current user
    const { resource: currentUser } = await userContainer.item(uid, uid).read();
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Initialize blocked array if it doesn't exist
    const blocked = currentUser.blocked || [];
    
    // Check if user is actually blocked
    if (!blocked.some(blockedUser => blockedUser.userId === userToUnblockId)) {
      return res.status(400).json({ error: 'User is not blocked' });
    }
    
    // Remove user from blocked list
    const updatedBlocked = blocked.filter(blockedUser => blockedUser.userId !== userToUnblockId);
    
    // Update user document
    const updatedUser = {
      ...currentUser,
      blocked: updatedBlocked,
      updatedAt: new Date().toISOString()
    };
    
    await userContainer.items.upsert(updatedUser);
    
    res.json({
      success: true,
      message: 'User unblocked successfully',
      blockedUsers: updatedBlocked
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ 
      error: 'Failed to unblock user',
      details: error.message 
    });
  }
});

// Get blocked users
app.get('/api/users/:uid/blocked', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const { resource: user } = await userContainer.item(uid, uid).read();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      blockedUsers: user.blocked || []
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch blocked users',
      details: error.message 
    });
  }
});

// NEW: Chat container management endpoints

// Create chat container manually
app.post('/api/chats/container', async (req, res) => {
  try {
    const { containerName } = req.body;
    
    if (!containerName) {
      return res.status(400).json({ error: 'Container name is required' });
    }
    
    const result = await createChatContainer(containerName);
    res.json(result);
  } catch (error) {
    console.error('Error creating chat container:', error);
    res.status(500).json({ 
      error: 'Failed to create chat container',
      details: error.message 
    });
  }
});

// Add message to chat container
app.post('/api/chats/:containerName', async (req, res) => {
  try {
    const { containerName } = req.params;
    const chatData = req.body;
    
    const chatContainer = database.container(containerName);
    const { resource } = await chatContainer.items.create({
      id: chatData.id || `msg_${Date.now()}`,
      ...chatData,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: resource
    });
  } catch (error) {
    console.error('Error creating chat message:', error);
    res.status(500).json({ 
      error: 'Failed to create chat message',
      details: error.message 
    });
  }
});

// Get messages from chat container
app.get('/api/chats/:containerName/:chatId?', async (req, res) => {
  try {
    const { containerName, chatId } = req.params;
    
    const chatContainer = database.container(containerName);
    
    let query = 'SELECT * FROM c ORDER BY c.timestamp DESC';
    if (chatId) {
      query = `SELECT * FROM c WHERE c.chatId = "${chatId}" ORDER BY c.timestamp DESC`;
    }
    
    const { resources } = await chatContainer.items.query(query).fetchAll();
    
    res.json({
      success: true,
      messages: resources
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat messages',
      details: error.message 
    });
  }
});

// Delete user
app.delete('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    await userContainer.item(uid, uid).delete();
    
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log('🔧 Server features enabled:');
  console.log('   ✅ User registration with automatic chat container creation');
  console.log('   ✅ Block/Unblock user functionality');
  console.log('   ✅ Chat container management');
  console.log('   ✅ CORS configured for multiple origins');
  console.log('   ✅ Error handling middleware');
});