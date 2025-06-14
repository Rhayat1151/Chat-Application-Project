// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { apiService } from './api'; // Import your existing API service

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaRS_NOexD1-IeXHf3xqQcGRr9dyBTb0k",
  authDomain: "chat-application-5d1a4.firebaseapp.com",
  projectId: "chat-application-5d1a4",
  storageBucket: "chat-application-5d1a4.firebasestorage.app",
  messagingSenderId: "119430505192",
  appId: "1:119430505192:web:782132aedf94047f149f5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Track user creation promises to prevent race conditions
const userCreationPromises = new Map();
const processedUsers = new Set(); // Track already processed users

// Helper function to check if server is running
// Replace the checkServerRunning function in firebase.js with this:
const checkServerRunning = async () => {
  try {
    console.log('🔍 Checking server health using apiService...');
    
    // Use your existing apiService instead of direct fetch
    const data = await apiService.healthCheck();
    console.log('✅ Server health check response:', data);
    
    // Check if the response indicates server is running
    return data && (data.status === 'ok' || data.success === true || data.message);
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    console.error('❌ Full error:', error);
    
    // Try direct fetch as fallback
    try {
      console.log('🔄 Trying direct fetch as fallback...');
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        console.error(`❌ Direct fetch failed with status: ${response.status}`);
        return false;
      }
      
      const data = await response.json();
      console.log('✅ Direct fetch success:', data);
      return true;
    } catch (directError) {
      console.error('❌ Direct fetch also failed:', directError.message);
      return false;
    }
  }
};

// Azure DB Integration Functions using Backend API
export const handleUserAuthentication = async (user) => {
  if (!user) {
    console.log('🚪 User signed out');
    processedUsers.clear();
    return null;
  }

  console.log('🔐 User signed in:', user.displayName || user.email);

  if (processedUsers.has(user.uid)) {
    console.log('✅ User already processed, fetching existing data...');
    try {
      const result = await apiService.getUserByUid(user.uid);
      console.log('📁 Fetched user from Azure DB:', result.user.email);
      return result.user;
    } catch (error) {
      console.log('⚠️ Previously processed user not found, will recreate...');
      processedUsers.delete(user.uid);
    }
  }

  if (userCreationPromises.has(user.uid)) {
    console.log('⏳ User creation already in progress, waiting...');
    try {
      return await userCreationPromises.get(user.uid);
    } catch (error) {
      userCreationPromises.delete(user.uid);
      console.log('🔄 Previous user creation failed, retrying...');
    }
  }

  const userPromise = handleUserCreation(user);
  userCreationPromises.set(user.uid, userPromise);

  try {
    const result = await userPromise;
    if (result) {
      console.log('🟢 Marking user as processed');
      processedUsers.add(user.uid);
    }
    return result;
  } catch (error) {
    console.error('❌ User authentication failed:', error.message);
    return null;
  } finally {
    userCreationPromises.delete(user.uid);
  }
};


const handleUserCreation = async (user) => {
  try {
    console.log('🔍 Checking if user exists in Azure DB...');

    const isServerRunning = await checkServerRunning();
    console.log(`🖥️ Server running: ${isServerRunning}`);
    if (!isServerRunning) {
      console.error('❌ Backend server is not running on http://localhost:3001');
      throw new Error('Backend server is not accessible. Please start your server.');
    }

    try {
      const result = await apiService.getUserByUid(user.uid);
      console.log('✅ User already exists in Azure DB:', result.user.email);
      return result.user;
    } catch (error) {
      if (!error.message.includes('User not found')) {
        console.error('❌ Unexpected error checking user:', error.message);
        throw error;
      }
      console.log('👤 User not found, preparing to register user and chat container...');
    }

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString(),
      blocked: [],
      isOnline: true
    };

    console.log('📝 Sending data to registerUserWithChatContainer:', {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName
    });

    const result = await apiService.registerUserWithChatContainer(userData);

    if (result.success && result.user) {
      console.log('✅ User + chat container created successfully');
      console.log(`📁 Chat container name: ${result.chatContainerName}`);
      console.log(`🆕 Container was ${result.containerCreated ? 'newly created' : 'already existing'}`);
      return result.user;
    } else {
      console.error('❌ Failed to create user in Azure DB:', result.error || 'Unknown error');
      throw new Error(result.error || 'Failed to create user in database');
    }

  } catch (error) {
    console.error('❌ Error in handleUserCreation:', error.message);
    throw error;
  }
};


// Update user online status - Enhanced with error handling
export const updateUserOnlineStatus = async (userId, isOnline) => {
  if (!userId) return;
  
  try {
    console.log(`📡 Updating user status: ${userId} - ${isOnline ? 'Online' : 'Offline'}`);
    
    // Check if server is running first
    const isServerRunning = await checkServerRunning();
    if (!isServerRunning) {
      console.warn('⚠️ Cannot update online status - server not running');
      return;
    }
    
    // For now, just log the status change
    // You can implement this endpoint in your backend later if needed
    // await apiService.updateUserStatus(userId, isOnline);
    
  } catch (error) {
    console.warn('⚠️ Failed to update user online status:', error.message);
  }
};

// Search users function - Using backend API with improved error handling
export const searchUsers = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) {
    return { success: false, error: 'Search term too short' };
  }
  
  try {
    console.log('🔍 Searching users with term:', searchTerm);
    
    // Check if server is running
    const isServerRunning = await checkServerRunning();
    if (!isServerRunning) {
      return { success: false, error: 'Backend server is not accessible' };
    }
    
    // Get all users and filter client-side
    const result = await apiService.getAllUsers();
    if (result.success && result.users) {
      const filteredUsers = result.users.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`✅ Found ${filteredUsers.length} matching users`);
      return { success: true, users: filteredUsers };
    }
    return { success: false, error: 'Failed to search users' };
  } catch (error) {
    console.error('❌ Search users error:', error.message);
    return { success: false, error: error.message };
  }
};

// Get all users for chat list
export const getAllUsers = async () => {
  try {
    console.log('📋 Fetching all users for chat list');
    
    // Check if server is running
    const isServerRunning = await checkServerRunning();
    if (!isServerRunning) {
      return { success: false, error: 'Backend server is not accessible' };
    }
    
    const result = await apiService.getAllUsers();
    console.log(`✅ Retrieved ${result.users?.length || 0} users`);
    return result;
  } catch (error) {
    console.error('❌ Get all users error:', error.message);
    return { success: false, error: error.message };
  }
};

// Get specific user
export const getUser = async (userId) => {
  try {
    console.log('👤 Fetching specific user:', userId);
    
    // Check if server is running
    const isServerRunning = await checkServerRunning();
    if (!isServerRunning) {
      return { success: false, error: 'Backend server is not accessible' };
    }
    
    const result = await apiService.getUserByUid(userId);
    console.log('✅ User retrieved successfully');
    return result;
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    return { success: false, error: error.message };
  }
};