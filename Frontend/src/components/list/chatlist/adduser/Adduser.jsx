// import React, { useState } from 'react'
// import './adduser.css'
// import { db } from '../../../../lib/firebase'
// import { 
//   collection, 
//   query, 
//   where, 
//   getDocs, 
//   serverTimestamp, 
//   doc, 
//   setDoc, 
//   addDoc,
//   updateDoc,
//   arrayUnion,
//   getDoc
// } from 'firebase/firestore'
// import { useUserStore } from '../../../../lib/useStore'

// const Adduser = ({ onClose }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const { currentUser } = useUserStore()

//   const handleSearch = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     const formData = new FormData(e.target)
//     const displayName = formData.get('displayName')

//     try {
//       const userRef = collection(db, "user")
//       const q = query(userRef, where("displayName", "==", displayName))
//       const querySnapshot = await getDocs(q)
      
//       if (!querySnapshot.empty) {
//         const foundUser = querySnapshot.docs[0].data()
//         // Don't allow adding yourself
//         if (foundUser.uid === currentUser.uid) {
//           alert("You cannot add yourself!")
//           setUser(null)
//         } else {
//           setUser({ ...foundUser, docId: querySnapshot.docs[0].id })
//         }
//       } else {
//         setUser(null)
//         alert("User not found!")
//       }
//     } catch (err) {
//       console.error("Error searching for user:", err)
//       setUser(null)
//       alert("Error searching for user. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAdd = async () => {
//     if (!user || !currentUser) {
//       alert("Missing user data!")
//       return
//     }
    
//     setLoading(true)
    
//     try {
//       // Check if chat already exists between these users
//       const currentUserChatsRef = doc(db, "user_chats", currentUser.uid)
//       const currentUserChatsDoc = await getDoc(currentUserChatsRef)
      
//       if (currentUserChatsDoc.exists()) {
//         const existingChats = currentUserChatsDoc.data().chats || []
//         const existingChat = existingChats.find(chat => 
//           chat.otherUser?.uid === user.uid
//         )
        
//         if (existingChat) {
//           alert("Chat already exists with this user!")
//           setUser(null)
//           document.querySelector('input[name="displayName"]').value = ''
//           setLoading(false)
//           return
//         }
//       }

//       console.log("🔄 Starting chat creation process...")
      
//       // Create a new chat document in the chats collection
//       const chatRef = collection(db, "chats")
//       const newChatDoc = await addDoc(chatRef, {
//         createdAt: serverTimestamp(),
//         messages: [],
//         participants: [currentUser.uid, user.uid],
//         lastMessage: "",
//         lastMessageTime: serverTimestamp(),
//         chatType: "direct",
//         createdBy: currentUser.uid
//       })
      
//       console.log("✅ Chat document created with ID:", newChatDoc.id)
      
//       // Prepare chat data for current user's user_chats document
//       const currentUserChatData = {
//         chatId: newChatDoc.id,
//         participants: [currentUser.uid, user.uid],
//         lastMessage: "",
//         lastMessageTime: null,
//         unreadCount: 0,
//         otherUser: {
//           uid: user.uid,
//           displayName: user.displayName,
//           avatar: user.avatar || user.photoURL || ""
//         }
//       }
      
//       // Prepare chat data for other user's user_chats document
//       const otherUserChatData = {
//         chatId: newChatDoc.id,
//         participants: [currentUser.uid, user.uid],
//         lastMessage: "",
//         lastMessageTime: null,
//         unreadCount: 0,
//         otherUser: {
//           uid: currentUser.uid,
//           displayName: currentUser.displayName,
//           avatar: currentUser.avatar || currentUser.photoURL || ""
//         }
//       }
      
//       console.log("📝 Chat data prepared for both users")
      
//       // 1. Create/Update current user's user_chats document
//       console.log("🔄 Updating current user document:", currentUser.uid)
      
//       try {
//         const currentUserDoc = await getDoc(currentUserChatsRef)
//         if (currentUserDoc.exists()) {
//           await updateDoc(currentUserChatsRef, {
//             chats: arrayUnion(currentUserChatData)
//           })
//           console.log("✅ Updated current user's chat list")
//         } else {
//           await setDoc(currentUserChatsRef, {
//             chats: [currentUserChatData]
//           })
//           console.log("✅ Created current user's chat list")
//         }
//       } catch (currentUserError) {
//         console.error("❌ Error with current user document:", currentUserError)
//         throw new Error(`Failed to update current user: ${currentUserError.message}`)
//       }
      
//       // 2. Create/Update other user's user_chats document  
//       console.log("🔄 Updating other user document:", user.uid)
//       const otherUserChatsRef = doc(db, "user_chats", user.uid)
      
//       try {
//         const otherUserDoc = await getDoc(otherUserChatsRef)
//         if (otherUserDoc.exists()) {
//           await updateDoc(otherUserChatsRef, {
//             chats: arrayUnion(otherUserChatData)
//           })
//           console.log("✅ Updated other user's chat list")
//         } else {
//           await setDoc(otherUserChatsRef, {
//             chats: [otherUserChatData]
//           })
//           console.log("✅ Created other user's chat list")
//         }
//       } catch (otherUserError) {
//         console.error("❌ Error with other user document:", otherUserError)
//         throw new Error(`Failed to update other user: ${otherUserError.message}`)
//       }
      
//       console.log("🎉 Successfully created both user_chats documents!")
//       alert(`Chat created successfully with ${user.displayName}!`)
//       setUser(null)
//       document.querySelector('input[name="displayName"]').value = ''
      
//       // Close the add user modal if onClose prop is provided
//       if (onClose) {
//         onClose()
//       }
      
//     } catch (err) {
//       console.error("❌ Full error object:", err)
//       console.error("❌ Error message:", err.message)
//       console.error("❌ Error code:", err.code)
//       console.error("❌ Error stack:", err.stack)
      
//       alert(`Failed to create chat: ${err.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className='adduser'>
//       <form onSubmit={handleSearch}>
//         <input 
//           type="text" 
//           placeholder='Display Name' 
//           name='displayName' 
//           disabled={loading}
//           required
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? 'Searching...' : 'Search'}
//         </button>
//       </form>

//       {user && (
//         <div className="user">
//           <div className="detail">
//             <img 
//               src={user.avatar || user.photoURL || "./avatar.png"} 
//               alt={user.displayName || "User Avatar"} 
//             />
//             <span>{user.displayName}</span>
//           </div>
//           <button onClick={handleAdd} disabled={loading}>
//             {loading ? 'Adding...' : 'Add User'}
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Adduser


import React, { useState, useEffect, useRef } from 'react'
import './adduser.css'
import { db, searchUsers } from '../../../../lib/firebase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore'
import { useUserStore } from '../../../../lib/useStore'

const Adduser = ({ onClose }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const { currentUser } = useUserStore()
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Debounce search to avoid too many Firebase calls
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchSuggestions(searchTerm)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // 300ms delay

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchSuggestions = async (term) => {
    if (!term || term.length < 2) return
    
    setSearchLoading(true)
    try {
      // First try to search using your Azure DB integration
      const azureResult = await searchUsers(term)
      
      if (azureResult.success && azureResult.users && azureResult.users.length > 0) {
        console.log("✅ Using Azure DB search results")
        const filteredUsers = azureResult.users
          .filter(userData => userData.uid !== currentUser.uid)
          .slice(0, 10) // Limit to 10 suggestions
        
        setSuggestions(filteredUsers)
        setShowSuggestions(filteredUsers.length > 0)
      } else {
        // Fallback to Firestore search if Azure DB fails
        console.log("⚠️ Azure DB search failed, falling back to Firestore")
        const userRef = collection(db, "user")
        
        // Use case-insensitive search with multiple approaches
        const searches = []
        
        // Search by displayName (case-insensitive prefix matching)
        const displayNameQuery = query(
          userRef,
          where("displayName", ">=", term),
          where("displayName", "<=", term + '\uf8ff'),
          orderBy("displayName"),
          limit(5)
        )
        searches.push(getDocs(displayNameQuery))
        
        // Search by displayName (lowercase)
        const lowerDisplayNameQuery = query(
          userRef,
          where("displayName", ">=", term.toLowerCase()),
          where("displayName", "<=", term.toLowerCase() + '\uf8ff'),
          orderBy("displayName"),
          limit(5)
        )
        searches.push(getDocs(lowerDisplayNameQuery))
        
        const results = await Promise.allSettled(searches)
        const foundUsers = new Map() // Use Map to avoid duplicates
        
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            result.value.forEach((doc) => {
              const userData = doc.data()
              if (userData.uid !== currentUser.uid && 
                  (userData.displayName?.toLowerCase().includes(term.toLowerCase()) ||
                   userData.email?.toLowerCase().includes(term.toLowerCase()))) {
                foundUsers.set(userData.uid, {
                  ...userData,
                  docId: doc.id
                })
              }
            })
          }
        })
        
        const uniqueUsers = Array.from(foundUsers.values()).slice(0, 10)
        setSuggestions(uniqueUsers)
        setShowSuggestions(uniqueUsers.length > 0)
      }
    } catch (err) {
      console.error("Error searching for suggestions:", err)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setUser(null) // Clear selected user when typing
  }

  const handleSuggestionClick = (selectedUser) => {
    setUser(selectedUser)
    setSearchTerm(selectedUser.displayName)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    
    setLoading(true)
    try {
      const userRef = collection(db, "user")
      const q = query(userRef, where("displayName", "==", searchTerm.trim()))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data()
        // Don't allow adding yourself
        if (foundUser.uid === currentUser.uid) {
          alert("You cannot add yourself!")
          setUser(null)
        } else {
          setUser({ ...foundUser, docId: querySnapshot.docs[0].id })
        }
      } else {
        setUser(null)
        alert("User not found!")
      }
    } catch (err) {
      console.error("Error searching for user:", err)
      setUser(null)
      alert("Error searching for user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!user || !currentUser) {
      alert("Missing user data!")
      return
    }
    
    setLoading(true)
    
    try {
      // Check if chat already exists between these users
      const currentUserChatsRef = doc(db, "user_chats", currentUser.uid)
      const currentUserChatsDoc = await getDoc(currentUserChatsRef)
      
      if (currentUserChatsDoc.exists()) {
        const existingChats = currentUserChatsDoc.data().chats || []
        const existingChat = existingChats.find(chat => 
          chat.otherUser?.uid === user.uid
        )
        
        if (existingChat) {
          alert("Chat already exists with this user!")
          setUser(null)
          setSearchTerm('')
          setLoading(false)
          return
        }
      }

      console.log("🔄 Starting chat creation process...")
      
      // Create a new chat document in the chats collection
      const chatRef = collection(db, "chats")
      const newChatDoc = await addDoc(chatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        participants: [currentUser.uid, user.uid],
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        chatType: "direct",
        createdBy: currentUser.uid
      })
      
      console.log("✅ Chat document created with ID:", newChatDoc.id)
      
      // Prepare chat data for current user's user_chats document
      const currentUserChatData = {
        chatId: newChatDoc.id,
        participants: [currentUser.uid, user.uid],
        lastMessage: "",
        lastMessageTime: null,
        unreadCount: 0,
        otherUser: {
          uid: user.uid,
          displayName: user.displayName,
          avatar: user.avatar || user.photoURL || ""
        }
      }
      
      // Prepare chat data for other user's user_chats document
      const otherUserChatData = {
        chatId: newChatDoc.id,
        participants: [currentUser.uid, user.uid],
        lastMessage: "",
        lastMessageTime: null,
        unreadCount: 0,
        otherUser: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar || currentUser.photoURL || ""
        }
      }
      
      console.log("📝 Chat data prepared for both users")
      
      // 1. Create/Update current user's user_chats document
      console.log("🔄 Updating current user document:", currentUser.uid)
      
      try {
        const currentUserDoc = await getDoc(currentUserChatsRef)
        if (currentUserDoc.exists()) {
          await updateDoc(currentUserChatsRef, {
            chats: arrayUnion(currentUserChatData)
          })
          console.log("✅ Updated current user's chat list")
        } else {
          await setDoc(currentUserChatsRef, {
            chats: [currentUserChatData]
          })
          console.log("✅ Created current user's chat list")
        }
      } catch (currentUserError) {
        console.error("❌ Error with current user document:", currentUserError)
        throw new Error(`Failed to update current user: ${currentUserError.message}`)
      }
      
      // 2. Create/Update other user's user_chats document  
      console.log("🔄 Updating other user document:", user.uid)
      const otherUserChatsRef = doc(db, "user_chats", user.uid)
      
      try {
        const otherUserDoc = await getDoc(otherUserChatsRef)
        if (otherUserDoc.exists()) {
          await updateDoc(otherUserChatsRef, {
            chats: arrayUnion(otherUserChatData)
          })
          console.log("✅ Updated other user's chat list")
        } else {
          await setDoc(otherUserChatsRef, {
            chats: [otherUserChatData]
          })
          console.log("✅ Created other user's chat list")
        }
      } catch (otherUserError) {
        console.error("❌ Error with other user document:", otherUserError)
        throw new Error(`Failed to update other user: ${otherUserError.message}`)
      }
      
      console.log("🎉 Successfully created both user_chats documents!")
      alert(`Chat created successfully with ${user.displayName}!`)
      setUser(null)
      setSearchTerm('')
      
      // Close the add user modal if onClose prop is provided
      if (onClose) {
        onClose()
      }
      
    } catch (err) {
      console.error("❌ Full error object:", err)
      console.error("❌ Error message:", err.message)
      console.error("❌ Error code:", err.code)
      console.error("❌ Error stack:", err.stack)
      
      alert(`Failed to create chat: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setUser(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className='adduser'>
      <form onSubmit={handleSearch}>
        <div className="search-container">
          <input 
            ref={inputRef}
            type="text" 
            placeholder='Display Name' 
            value={searchTerm}
            onChange={handleInputChange}
            disabled={loading}
            required
            autoComplete="off"
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-button"
              onClick={clearSearch}
              disabled={loading}
            >
              ✕
            </button>
          )}
          {searchLoading && <div className="search-loading">🔍</div>}
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown" ref={suggestionsRef}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.uid}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <img 
                    src={suggestion.avatar || suggestion.photoURL || "./avatar.png"} 
                    alt={suggestion.displayName || "User Avatar"}
                    className="suggestion-avatar"
                  />
                  <span className="suggestion-name">{suggestion.displayName}</span>
                  {suggestion.email && (
                    <span className="suggestion-email">{suggestion.email}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button type="submit" disabled={loading || !searchTerm.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {user && (
        <div className="user">
          <div className="detail">
            <img 
              src={user.avatar || user.photoURL || "./avatar.png"} 
              alt={user.displayName || "User Avatar"} 
            />
            <span>{user.displayName}</span>
          </div>
          <button onClick={handleAdd} disabled={loading}>
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Adduser