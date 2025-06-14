// lib/api.js
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Don't log "User not found" errors as they're expected during first login
      if (!error.message.includes('User not found')) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // User management methods
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async getUserByUid(uid) {
    return this.request(`/users/${uid}`);
  }

  // New method with retry logic for user fetching
  async getUserByUidWithRetry(uid, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.getUserByUid(uid);
      } catch (error) {
        if (error.message.includes('User not found') && i < maxRetries - 1) {
          console.log(`User not found, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async updateUser(uid, userData) {
    return this.request(`/users/${uid}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(uid) {
    return this.request(`/users/${uid}`, {
      method: 'DELETE',
    });
  }

  // NEW: Block/Unblock user methods
  async blockUser(currentUserId, userToBlockId) {
    return this.request(`/users/${currentUserId}/block`, {
      method: 'POST',
      body: { userToBlockId },
    });
  }

  async unblockUser(currentUserId, userToUnblockId) {
    return this.request(`/users/${currentUserId}/unblock`, {
      method: 'POST',
      body: { userToUnblockId },
    });
  }

  async getBlockedUsers(userId) {
    return this.request(`/users/${userId}/blocked`);
  }

  // NEW: Chat container/collection methods
  async createChatContainer(containerName) {
    return this.request('/chats/container', {
      method: 'POST',
      body: { containerName },
    });
  }

  async createChatDocument(containerName, chatData) {
    return this.request(`/chats/${containerName}`, {
      method: 'POST',
      body: chatData,
    });
  }

  async getChatMessages(containerName, chatId) {
    return this.request(`/chats/${containerName}/${chatId}`);
  }

  async getAllChatsForUser(containerName) {
    return this.request(`/chats/${containerName}`);
  }

  async updateChatMessage(containerName, chatId, messageData) {
    return this.request(`/chats/${containerName}/${chatId}`, {
      method: 'PUT',
      body: messageData,
    });
  }

  async deleteChatMessage(containerName, chatId) {
    return this.request(`/chats/${containerName}/${chatId}`, {
      method: 'DELETE',
    });
  }

  // NEW: Combined user registration with chat container creation
  async registerUserWithChatContainer(userData) {
    return this.request('/users/register-with-chat', {
      method: 'POST',
      body: userData,
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;