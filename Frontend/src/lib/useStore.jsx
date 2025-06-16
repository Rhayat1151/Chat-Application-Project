import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, handleUserAuthentication, updateUserOnlineStatus } from './firebase'
import { toast } from 'react-toastify'

const UserContext = createContext()

export const useUserStore = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserStore must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  
  // Use refs to prevent infinite loops
  const authProcessingRef = useRef(false)
  const currentUserRef = useRef(null)
  const initTimeoutRef = useRef(null)

  // Update refs when state changes
  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  // Fetch user info and sync with backend
// In your fetchUserInfo function, make the user object consistent:

const fetchUserInfo = async (firebaseUser) => {
  if (!firebaseUser) {
    console.log('🚪 No Firebase user, clearing state');
    setCurrentUser(null)
    setIsLoading(false)
    setIsProcessingAuth(false)
    authProcessingRef.current = false
    return
  }

  if (authProcessingRef.current) return;
  authProcessingRef.current = true;
  setIsProcessingAuth(true);

  try {
    const azureUser = await handleUserAuthentication(firebaseUser);
    
    if (azureUser) {
      // Always preserve existing photoURL if Azure doesn't return one
      const finalPhotoURL = (azureUser.photoURL && azureUser.photoURL.trim()) ? azureUser.photoURL : '';
      console.log('azureUser.photoURL:', azureUser.photoURL);
      console.log('currentUserRef.current?.photoURL:', currentUserRef.current?.photoURL);
      console.log('finalPhotoURL:', finalPhotoURL);
      
      // Make user object consistent with both uid and userId
      setCurrentUser({
        ...azureUser,
        uid: firebaseUser.uid,          // Add this for consistency
        userId: azureUser.userId || firebaseUser.uid,  // Keep existing userId
        photoURL: finalPhotoURL
      });
      
      await updateUserOnlineStatus(firebaseUser.uid, true);
    } else {
      // Create fallback user with consistent properties
      const fallbackUser = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,          // Add this for consistency
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        photoURL: currentUserRef.current?.photoURL || '',
        isOnline: true,
        createdAt: new Date().toISOString(),
        blocked: [],
        chatContainerName: `chats_${firebaseUser.uid}`
      };
      
      setCurrentUser(fallbackUser);
    }
  } catch (err) {
    console.error('❌ Error during user authentication:', err);
    
    // Error fallback with consistent properties
    const fallbackUser = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,          // Add this for consistency
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || '',
      photoURL: currentUserRef.current?.photoURL || '',
      isOnline: true,
      createdAt: new Date().toISOString(),
      blocked: [],
      chatContainerName: `chats_${firebaseUser.uid}`
    };
    
    setCurrentUser(fallbackUser);
  } finally {
    setIsLoading(false);
    setIsProcessingAuth(false);
    authProcessingRef.current = false;
  }
}

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process...')
      
      // Set user as offline before logout
      if (currentUserRef.current?.userId) {
        try {
          await updateUserOnlineStatus(currentUserRef.current.userId, false)
        } catch (error) {
          console.warn('⚠️ Failed to update offline status:', error.message)
        }
      }
      
      // Clear state first
      setCurrentUser(null)
      setIsProcessingAuth(false)
      authProcessingRef.current = false
      
      // Then sign out from Firebase
      await signOut(auth)
      
      console.log('✅ Logout completed successfully')
      toast.success("Logged out successfully!")
    } catch (err) {
      console.error('❌ Logout error:', err)
      toast.error("Failed to logout. Please try again")
    }
  }

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      if (hasInitialized) return
      
      console.log('🚀 Initializing app...')
      
      try {
        // Clear any existing timeout
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current)
        }
        
        // Sign out any existing user to ensure fresh start
        await signOut(auth)
        console.log('✅ App initialized - existing user signed out')
      } catch (error) {
        console.log('ℹ️ No existing user to sign out during initialization')
      } finally {
        setHasInitialized(true)
        
        // Set a timeout to ensure loading state is cleared
        initTimeoutRef.current = setTimeout(() => {
          if (!authProcessingRef.current) {
            setIsLoading(false)
          }
        }, 1000)
      }
    }

    initializeApp()
    
    // Cleanup timeout on unmount
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
    }
  }, [])

  // Handle window events for online status
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUserRef.current?.userId) {
        navigator.sendBeacon('/api/user-offline', JSON.stringify({
          userId: currentUserRef.current.userId
        }))
      }
    }

    const handleVisibilityChange = async () => {
      if (currentUserRef.current?.userId) {
        try {
          const isVisible = document.visibilityState === 'visible'
          await updateUserOnlineStatus(currentUserRef.current.userId, isVisible)
        } catch (error) {
          console.warn('⚠️ Failed to update visibility status:', error.message)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Auth state listener
  useEffect(() => {
    if (!hasInitialized) return

    console.log('👂 Setting up auth state listener...')

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔔 Auth state changed:', user ? user.email : 'No user')
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
      
      const timeoutId = setTimeout(() => {
        fetchUserInfo(user)
      }, 300)

      initTimeoutRef.current = timeoutId
    })

    return () => {
      console.log('🔇 Cleaning up auth state listener')
      unsubscribe()
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
    }
  }, [hasInitialized])

  const value = {
    currentUser,
    isLoading,
    fetchUserInfo,
    handleLogout,
    isProcessingAuth,
    hasInitialized,
    setCurrentUser, // Add this function to the context
    refreshUserData: () => {
      if (auth.currentUser && !authProcessingRef.current) {
        console.log('🔄 Manually refreshing user data...')
        fetchUserInfo(auth.currentUser)
      } else {
        console.log('⚠️ Cannot refresh - no user or auth in progress')
      }
    },
    getChatContainerName: () => {
      return currentUser?.chatContainerName || null
    }
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}