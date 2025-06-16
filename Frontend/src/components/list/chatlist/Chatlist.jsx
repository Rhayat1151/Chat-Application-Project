// import React, { useState, useEffect } from 'react'
// import './chatlist.css'
// import Adduser from './adduser/Adduser'
// import { useUserStore } from '../../../lib/useStore'
// import { doc, onSnapshot, getDoc } from 'firebase/firestore'
// import { db } from '../../../lib/firebase'

// const Chatlist = () => {
//   const [chats, setChats] = useState([])
//   const [addMode, setAddMode] = useState(false)
//   const { currentUser } = useUserStore()

//   useEffect(() => {
//     if (!currentUser?.uid) return

//     const unSub = onSnapshot(doc(db, "user_chats", currentUser.uid), async (res) => {
//       const items = res.data()?.chats || []

//       const promises = items.map(async (item) => {
//         const userdocRef = doc(db, "user_chats", item.recieverId)
//         const userdocSnap = await getDoc(userdocRef)
//         const user = userdocSnap.exists() ? userdocSnap.data() : {}
//         return { ...item, ...user }
//       })

//       const chatsData = await Promise.all(promises)
//       setChats(chatsData.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)))
//     })

//     return () => {
//       unSub()
//     }
//   }, [currentUser?.uid])

//   return (
//     <div className='chatlist'>
//       <div className="search">
//         <div className="searchbar">
//           <img src="search.png" alt="" />
//           <input type="text" placeholder='Search' />
//         </div>
//         <img
//           src={addMode ? "./minus.png" : "./plus.png"}
//           alt=""
//           className='add'
//           onClick={() => setAddMode(prev => !prev)}
//         />
//       </div>

//       {Array.isArray(chats) && chats.length > 0 ? (
//         chats.map((chat, idx) => {
//           if (!chat || typeof chat !== 'object') return null;
//           // Optionally, check for required fields:
//           // if (!chat.displayName && !chat.lastMessage) return null;
//           return (
//             <div className="item" key={chat.id || idx}>
//               <img src={chat.photoURL || "avatar.png"} alt="" />
//               <div className="texts">
//                 <span>{chat.displayName || "Unknown User"}</span>
//                 <p>{chat.lastMessage || "No messages yet"}</p>
//               </div>
//             </div>
//           );
//         })
//       ) : (
//         <div className="item">
//           <img src="avatar.png" alt="" />
//           <div className="texts">
//             <span>No Chats</span>
//             <p>Start a conversation!</p>
//           </div>
//         </div>
//       )}

//       {addMode && <Adduser />}
//     </div>
//   )
// }

// export default Chatlist

import React, { useState, useEffect } from 'react';
import './chatlist.css';
import Adduser from './adduser/Adduser';
import { useUserStore } from '../../../lib/useStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const Chatlist = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();

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
        lastMessageTime: chat.lastMessageTime?.toDate() || new Date(0)
      }));

      setChats(
        processedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime)
      );
    });

    return () => unSub();
  }, [currentUser?.uid]);

  return (
    <div className='chatlist'>
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
            <div className="item" key={chat.chatId}>
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