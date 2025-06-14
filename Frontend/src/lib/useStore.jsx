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
  
  // // NEW: Blocked users management
  // const [blockedUsers, setBlockedUsers] = useState([])
  // const [isLoadingBlocked, setIsLoadingBlocked] = useState(false)
  
  // Use refs to prevent infinite loops
  const authProcessingRef = useRef(false)
  const currentUserRef = useRef(null)
  const initTimeoutRef = useRef(null)

  // Update refs when state changes
  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  // // NEW: Load blocked users when current user changes
  // useEffect(() => {
  //   if (currentUser?.userId) {
  //     loadBlockedUsers()
  //   } else {
  //     setBlockedUsers([])
  //   }
  // }, [currentUser])

  // NEW: Load blocked users function
  // const loadBlockedUsers = async () => {
  //   if (!currentUser?.userId) return
  //   setIsLoadingBlocked(true)
  //   try {
  //     console.log('📋 Loading blocked users...')
  //     const result = await getBlockedUsers(currentUser.userId)
  //     if (result.success) {
  //       setBlockedUsers(result.blockedUsers || [])
  //       console.log(`✅ Loaded ${result.blockedUsers?.length || 0} blocked users`)
  //     } else {
  //       console.warn('⚠️ Failed to load blocked users:', result.error)
  //       setBlockedUsers([])
  //     }
  //   } catch (error) {
  //     console.error('❌ Error loading blocked users:', error)
  //     setBlockedUsers([])
  //   } finally {
  //     setIsLoadingBlocked(false)
  //   }
  // }

  // NEW: Block user function
  // const handleBlockUser = async (userToBlockId) => {
  //   if (!currentUser?.userId || !userToBlockId) {
  //     toast.error('Unable to block user')
  //     return { success: false }
  //   }
  //   if (userToBlockId === currentUser.userId) {
  //     toast.error('You cannot block yourself')
  //     return { success: false }
  //   }
  //   if (blockedUsers.some(user => user.userId === userToBlockId)) {
  //     toast.warn('User is already blocked')
  //     return { success: false }
  //   }
  //   try {
  //     console.log('🚫 Blocking user:', userToBlockId)
  //     const result = await blockUser(currentUser.userId, userToBlockId)
  //     if (result.success) {
  //       // Refresh blocked users list
  //       await loadBlockedUsers()
  //       toast.success('User blocked successfully')
  //       return { success: true }
  //     } else {
  //       toast.error(result.error || 'Failed to block user')
  //       return { success: false, error: result.error }
  //     }
  //   } catch (error) {
  //     console.error('❌ Error blocking user:', error)
  //     toast.error('Failed to block user')
  //     return { success: false, error: error.message }
  //   }
  // }

  // NEW: Unblock user function
  // const handleUnblockUser = async (userToUnblockId) => {
  //   if (!currentUser?.userId || !userToUnblockId) {
  //     toast.error('Unable to unblock user')
  //     return { success: false }
  //   }
  //   if (!blockedUsers.some(user => user.userId === userToUnblockId)) {
  //     toast.warn('User is not blocked')
  //     return { success: false }
  //   }
  //   try {
  //     console.log('✅ Unblocking user:', userToUnblockId)
  //     const result = await unblockUser(currentUser.userId, userToUnblockId)
  //     if (result.success) {
  //       // Refresh blocked users list
  //       await loadBlockedUsers()
  //       toast.success('User unblocked successfully')
  //       return { success: true }
  //     } else {
  //       toast.error(result.error || 'Failed to unblock user')
  //       return { success: false, error: result.error }
  //     }
  //   } catch (error) {
  //     console.error('❌ Error unblocking user:', error)
  //     toast.error('Failed to unblock user')
  //     return { success: false, error: error.message }
  //   }
  // }

  // NEW: Check if user is blocked
  // const isUserBlocked = (userId) => {
  //   return blockedUsers.some(user => user.userId === userId)
  // }

  const fetchUserInfo = async (firebaseUser) => {
    if (!firebaseUser) {
      console.log('🚪 No Firebase user, clearing state');
      setCurrentUser(null)
      // setBlockedUsers([]) // Clear blocked users
      setIsLoading(false)
      setIsProcessingAuth(false)
      authProcessingRef.current = false
      return
    }

    // Prevent multiple simultaneous auth processing
    if (authProcessingRef.current) {
      console.log('⏳ Auth already in progress, skipping...')
      return
    }

    authProcessingRef.current = true
    setIsProcessingAuth(true)
    console.log('🔄 Processing user authentication for:', firebaseUser.email)

    try {
      // Handle user authentication and sync with Azure DB
      const azureUser = await handleUserAuthentication(firebaseUser)
      
      if (azureUser) {
        console.log('✅ Azure user data received:', azureUser.email)
        
        // Ensure user has all required fields including blocked array
        // const completeUser = {
        //   ...azureUser,
        //   blocked: azureUser.blocked || [], // Ensure blocked array exists
        //   chatContainerName: azureUser.chatContainerName || `chats_${azureUser.userId}` // Fallback container name
        // }
        
        // setCurrentUser(completeUser)
        setCurrentUser(azureUser)
        
        // Set user as online (optional - currently just logs)
        try {
          await updateUserOnlineStatus(firebaseUser.uid, true)
        } catch (onlineError) {
          console.warn('⚠️ Failed to update online status:', onlineError.message)
        }
        
        console.log('✅ User authentication completed successfully')
        // console.log('📁 Chat container:', completeUser.chatContainerName)
      } else {
        console.log('⚠️ Azure sync failed, using Firebase data as fallback')
        // Fallback to Firebase user data if Azure sync fails
        const fallbackUser = {
          id: firebaseUser.uid,
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          isOnline: true,
          createdAt: new Date().toISOString(),
          blocked: [], // Initialize empty blocked array
          chatContainerName: `chats_${firebaseUser.uid}` // Fallback container name
        }
        setCurrentUser(fallbackUser)
      }
    } catch (err) {
      console.error('❌ Error during user authentication:', err)
      
      // Fallback to Firebase user data
      const fallbackUser = {
        id: firebaseUser.uid,
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        isOnline: true,
        createdAt: new Date().toISOString(),
        blocked: [], // Initialize empty blocked array
        chatContainerName: `chats_${firebaseUser.uid}` // Fallback container name
      }
      setCurrentUser(fallbackUser)
    } finally {
      setIsLoading(false)
      setIsProcessingAuth(false)
      authProcessingRef.current = false
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
      // setBlockedUsers([]) // Clear blocked users
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
  }, []) // Remove hasInitialized dependency to prevent re-runs

  // Handle window events for online status
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUserRef.current?.userId) {
        // Use synchronous approach for beforeunload
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
  }, []) // Empty dependency array since we use refs

  // Auth state listener
  useEffect(() => {
    // Only listen for auth changes after initialization
    if (!hasInitialized) return

    console.log('👂 Setting up auth state listener...')

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔔 Auth state changed:', user ? user.email : 'No user')
      
      // Clear any existing timeout to prevent race conditions
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
      
      // Use a small delay to debounce rapid auth changes
      const timeoutId = setTimeout(() => {
        fetchUserInfo(user)
      }, 300)

      // Store timeout for cleanup
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
    
    // // NEW: Blocked users functionality
    // blockedUsers,
    // isLoadingBlocked,
    // handleBlockUser,
    // handleUnblockUser,
    // isUserBlocked,
    // loadBlockedUsers,
    
    // Additional helper functions
    refreshUserData: () => {
      if (auth.currentUser && !authProcessingRef.current) {
        console.log('🔄 Manually refreshing user data...')
        fetchUserInfo(auth.currentUser)
      } else {
        console.log('⚠️ Cannot refresh - no user or auth in progress')
      }
    },
    
    // NEW: Get chat container name for current user
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