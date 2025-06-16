import React, { useState } from 'react'
import './adduser.css'
import { db } from '../../../../lib/firebase'
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
  getDoc
} from 'firebase/firestore'
import { useUserStore } from '../../../../lib/useStore'

const Adduser = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const { currentUser } = useUserStore()

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const displayName = formData.get('displayName')

    try {
      const userRef = collection(db, "user")
      const q = query(userRef, where("displayName", "==", displayName))
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
          chat.participants.includes(user.uid) && chat.participants.includes(currentUser.uid)
        )
        
        if (existingChat) {
          alert("Chat already exists with this user!")
          setUser(null)
          document.querySelector('input[name="displayName"]').value = ''
          setLoading(false)
          return
        }
      }

      // Create a new chat document
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
      
      console.log("Chat created successfully with ID:", newChatDoc.id)
      
      // Prepare chat data for user_chats
      const chatData = {
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
      
      // Update current user's chat list
      try {
        const currentUserDoc = await getDoc(currentUserChatsRef)
        if (currentUserDoc.exists()) {
          await updateDoc(currentUserChatsRef, {
            chats: arrayUnion(chatData)
          })
        } else {
          await setDoc(currentUserChatsRef, {
            chats: [chatData]
          })
        }
      } catch (updateErr) {
        console.error("Error updating current user chats:", updateErr)
        throw updateErr
      }
      
      // Update other user's chat list
      const otherUserChatsRef = doc(db, "user_chats", user.uid)
      try {
        const otherUserDoc = await getDoc(otherUserChatsRef)
        if (otherUserDoc.exists()) {
          await updateDoc(otherUserChatsRef, {
            chats: arrayUnion(otherUserChatData)
          })
        } else {
          await setDoc(otherUserChatsRef, {
            chats: [otherUserChatData]
          })
        }
      } catch (updateErr) {
        console.error("Error updating other user chats:", updateErr)
        throw updateErr
      }
      
      alert(`Chat created successfully with ${user.displayName}!`)
      setUser(null)
      document.querySelector('input[name="displayName"]').value = ''
      
    } catch (err) {
      console.error("Error creating chat:", err)
      alert("Failed to create chat. Please try again.")
      
      if (err.code) {
        console.error("Error code:", err.code)
        console.error("Error message:", err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='adduser'>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder='Display Name' 
          name='displayName' 
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
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