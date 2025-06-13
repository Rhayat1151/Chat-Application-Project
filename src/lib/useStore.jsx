import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
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

  const fetchUserInfo = async (uid) => {
    if (!uid) {
      setCurrentUser(null)
      setIsLoading(false)
      return
    }

    try {
      const docRef = doc(db, "users", uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setCurrentUser(docSnap.data())
      } else {
        setCurrentUser(null)
      }
    } catch (err) {
      console.log(err)
      setCurrentUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully!")
    } catch (err) {
      console.log(err)
      toast.error("Failed to logout. Please try again")
    }
  }

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid)
      } else {
        setCurrentUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      unSub()
    }
  }, [])

  return (
    <UserContext.Provider value={{ currentUser, isLoading, fetchUserInfo, handleLogout }}>
      {children}
    </UserContext.Provider>
  )
}