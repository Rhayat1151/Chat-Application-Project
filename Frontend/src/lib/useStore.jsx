// import React, { createContext, useContext, useState, useEffect } from 'react'
// import { onAuthStateChanged, signOut } from 'firebase/auth'
// import { auth, handleUserAuthentication, updateUserOnlineStatus } from './firebase'
// import { toast } from 'react-toastify'

// const UserContext = createContext()

// export const useUserStore = () => {
//   const context = useContext(UserContext)
//   if (!context) {
//     throw new Error('useUserStore must be used within a UserProvider')
//   }
//   return context
// }

// export const UserProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [hasInitialized, setHasInitialized] = useState(false)
//   const [isProcessingAuth, setIsProcessingAuth] = useState(false)

//   const fetchUserInfo = async (firebaseUser) => {
//     if (!firebaseUser) {
//       setCurrentUser(null)
//       setIsLoading(false)
//       setIsProcessingAuth(false)
//       return
//     }

//     // Prevent multiple simultaneous auth processing
//     if (isProcessingAuth) {
//       console.log('Auth already in progress, skipping...')
//       return
//     }

//     setIsProcessingAuth(true)
//     console.log('🔄 Processing user authentication...')

//     try {
//       // Handle user authentication and sync with Azure DB
//       const azureUser = await handleUserAuthentication(firebaseUser)
      
//       if (azureUser) {
//         setCurrentUser(azureUser)
//         // Set user as online
//         await updateUserOnlineStatus(firebaseUser.uid, true)
//         console.log('✅ User authentication completed successfully')
//       } else {
//         console.log('⚠️ Azure sync failed, using Firebase data as fallback')
//         // Fallback to Firebase user data if Azure sync fails
//         setCurrentUser({
//           id: firebaseUser.uid,
//           userId: firebaseUser.uid,
//           email: firebaseUser.email,
//           displayName: firebaseUser.displayName,
//           photoURL: firebaseUser.photoURL,
//           isOnline: true
//         })
//       }
//     } catch (err) {
//       console.error('Error fetching user info:', err)
//       // Fallback to Firebase user data
//       setCurrentUser({
//         id: firebaseUser.uid,
//         userId: firebaseUser.uid,
//         email: firebaseUser.email,
//         displayName: firebaseUser.displayName,
//         photoURL: firebaseUser.photoURL,
//         isOnline: true
//       })
//     } finally {
//       setIsLoading(false)
//       setIsProcessingAuth(false)
//     }
//   }

//   const handleLogout = async () => {
//     try {
//       // Set user as offline before logout
//       if (currentUser?.userId) {
//         await updateUserOnlineStatus(currentUser.userId, false)
//       }
      
//       await signOut(auth)
//       setCurrentUser(null)
//       setIsProcessingAuth(false)
//       toast.success("Logged out successfully!")
//     } catch (err) {
//       console.error('Logout error:', err)
//       toast.error("Failed to logout. Please try again")
//     }
//   }

//   // Initialize app by signing out any existing user
//   useEffect(() => {
//     const initializeApp = async () => {
//       if (!hasInitialized) {
//         try {
//           // Sign out any existing user to ensure fresh start
//           await signOut(auth)
//           console.log('App initialized - user signed out')
//         } catch (error) {
//           console.log('No user to sign out on initialization')
//         } finally {
//           setHasInitialized(true)
//           setIsLoading(false)
//         }
//       }
//     }

//     initializeApp()
//   }, [hasInitialized])

//   // Update user online status when window closes/refreshes
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (currentUser?.userId) {
//         updateUserOnlineStatus(currentUser.userId, false)
//       }
//     }

//     const handleVisibilityChange = () => {
//       if (currentUser?.userId) {
//         if (document.visibilityState === 'visible') {
//           updateUserOnlineStatus(currentUser.userId, true)
//         } else {
//           updateUserOnlineStatus(currentUser.userId, false)
//         }
//       }
//     }

//     window.addEventListener('beforeunload', handleBeforeUnload)
//     document.addEventListener('visibilitychange', handleVisibilityChange)

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload)
//       document.removeEventListener('visibilitychange', handleVisibilityChange)
//     }
//   }, [currentUser])

//   useEffect(() => {
//     // Only listen for auth changes after initialization
//     if (!hasInitialized) return

//     const unSub = onAuthStateChanged(auth, (user) => {
//       // Add debounce to prevent rapid fire auth changes
//       const timeoutId = setTimeout(() => {
//         if (user) {
//           fetchUserInfo(user)
//         } else {
//           setCurrentUser(null)
//           setIsLoading(false)
//           setIsProcessingAuth(false)
//         }
//       }, 100) // Small delay to debounce rapid auth changes

//       return () => clearTimeout(timeoutId)
//     })

//     return () => {
//       unSub()
//     }
//   }, [hasInitialized, isProcessingAuth])

//   const value = {
//     currentUser,
//     isLoading,
//     fetchUserInfo,
//     handleLogout,
//     isProcessingAuth,
//     // Additional helper functions
//     refreshUserData: () => {
//       if (auth.currentUser && !isProcessingAuth) {
//         fetchUserInfo(auth.currentUser)
//       }
//     }
//   }

//   return (
//     <UserContext.Provider value={value}>
//       {children}
//     </UserContext.Provider>
//   )
// }
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

  const fetchUserInfo = async (firebaseUser) => {
    if (!firebaseUser) {
      console.log('🚪 No Firebase user, clearing state');
      setCurrentUser(null)
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
        setCurrentUser(azureUser)
        
        // Set user as online (optional - currently just logs)
        try {
          await updateUserOnlineStatus(firebaseUser.uid, true)
        } catch (onlineError) {
          console.warn('⚠️ Failed to update online status:', onlineError.message)
        }
        
        console.log('✅ User authentication completed successfully')
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
          createdAt: new Date().toISOString()
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
        createdAt: new Date().toISOString()
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
    // Additional helper functions
    refreshUserData: () => {
      if (auth.currentUser && !authProcessingRef.current) {
        console.log('🔄 Manually refreshing user data...')
        fetchUserInfo(auth.currentUser)
      } else {
        console.log('⚠️ Cannot refresh - no user or auth in progress')
      }
    }
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}