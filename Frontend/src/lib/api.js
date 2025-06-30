const API_BASE_URL = `${import.meta.env.VITES_API_BASE_URL}/api`;

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

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      if (config.body && !(config.body instanceof FormData)) {
        console.log('📤 Request body:', JSON.parse(config.body));
      }

      const response = await fetch(url, config);
      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('📄 Non-JSON response:', text);
        data = { message: text };
      }

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`, data);
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      if (!error.message.includes('User not found')) {
        console.error(`❌ API request failed for ${endpoint}:`, error);
      }
      throw error;
    }
  }

  async uploadProfileImage(file) {
    console.log('📸 Uploading profile image:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}/upload-profile-image`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log(`📥 Upload response status: ${response.status}`);
      
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Image upload failed:', data);
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Image uploaded successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw error;
    }
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async getUserByUid(uid) {
    return this.request(`/users/${uid}`);
  }

  async getUserByUidWithRetry(uid, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.getUserByUid(uid);
      } catch (error) {
        if (error.message.includes('User not found') && i < maxRetries - 1) {
          console.log(`🔄 User not found, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
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

  async registerUserWithChatContainer(userData) {
    console.log('🔥 Registering user with chat container:', userData);
    return this.request('/users/register-with-chat', {
      method: 'POST',
      body: userData,
    });
  }

  async registerUserWithImageAndChat(userData, imageFile = null) {
    try {
      let photoURL = userData.photoURL || '';
      
      if (imageFile) {
        console.log('📸 Uploading image first...');
        const imageResponse = await this.uploadProfileImage(imageFile);
        photoURL = imageResponse.imageUrl;
        console.log('✅ Image uploaded, URL:', photoURL);
      }

      const userDataWithImage = {
        ...userData,
        photoURL,
      };

      console.log('👤 Registering user with data:', userDataWithImage);
      return await this.registerUserWithChatContainer(userDataWithImage);
    } catch (error) {
      console.error('❌ Registration with image failed:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      console.log('🏥 Checking API health...');
      const response = await this.request('/health');
      console.log('✅ API is healthy:', response);
      return response;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
