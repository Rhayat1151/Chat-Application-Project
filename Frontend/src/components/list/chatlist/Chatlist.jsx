

import React, { useState, useEffect } from 'react';
import './chatlist.css';
import Adduser from './adduser/Adduser';
import { useUserStore } from '../../../lib/useStore';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'; // Combined imports
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const Chatlist = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unSub = onSnapshot(doc(db, "user_chats", currentUser.uid), (doc) => {
      if (!doc.exists()) {
        setChats([]);
        return;
      }

      const chatItems = doc.data().chats || [];
      const processedChats = chatItems.map(chat => ({
        ...chat,
        displayName: chat.otherUser?.displayName || "Unknown User",
        photoURL: chat.otherUser?.avatar || "avatar.png",
        lastMessage: chat.lastMessage || "No messages yet",
        lastMessageTime: chat.lastMessageTime?.toDate() || new Date(0),
        isSeen: chat.isSeen || false
      }));

      setChats(
        processedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
      );
    });

    return () => unSub();
  }, [currentUser?.uid]);

  const handleselect = async (chat) => { // Made async
    try {
      // Create updated chats array
      const updatedChats = chats.map(item => {
        if (item.chatId === chat.chatId) {
          return { ...item, isSeen: true };
        }
        return item;
      });

      // Update Firestore
      const userChatsRef = doc(db, "user_chats", currentUser.uid);
      await updateDoc(userChatsRef, {
        chats: updatedChats.map(({ lastMessageTime, ...rest }) => rest) // Remove Date objects
      });

      // Update local state
      setChats(updatedChats);
      
      // Change the active chat
      changeChat(chat.chatId, chat.otherUser, currentUser);
    } catch(err) {
      console.error("Error updating chat status:", err);
    }
  };

  return (
    <div className='chatlist'>
      {/* Rest of your JSX remains the same */}
      <div className="search">
        <div className="searchbar">
          <img src="search.png" alt="Search" />
          <input type="text" placeholder='Search' />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Toggle add user"
          className='add'
          onClick={() => setAddMode(prev => !prev)}
        />
      </div>

      <div className="chat-items">
        {chats.length > 0 ? (
          chats.map(chat => (
            <div 
              className="item" 
              key={chat.chatId} 
              onClick={() => handleselect(chat)} 
              style={{ backgroundColor: chat.isSeen ? "transparent" : "#5183fe" }}
            >
              <img 
                src={chat.photoURL} 
                alt={chat.displayName} 
                onError={(e) => {
                  e.target.src = "avatar.png";
                }}
              />
              <div className="texts">
                <span>{chat.displayName}</span>
                <p>{chat.lastMessage}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="item empty-state">
            <img src="avatar.png" alt="No chats" />
            <div className="texts">
              <span>No Chats</span>
              <p>Start a conversation!</p>
            </div>
          </div>
        )}
      </div>

      {addMode && <Adduser onClose={() => setAddMode(false)} />}
    </div>
  );
};

export default Chatlist;