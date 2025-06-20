


// // import './chat.css'
// // import Emojipicker from "emoji-picker-react"
// // import { useState, useRef, useEffect } from 'react'
// // import { useUserStore } from '../../lib/useStore'
// // import { onSnapshot, updateDoc, arrayUnion, doc as firestoreDoc, serverTimestamp, getDoc } from 'firebase/firestore'
// // import { doc } from 'firebase/firestore'
// // import { db } from '../../lib/firebase'
// // import { useChatStore } from '../../lib/chatStore'

// // const Chat = () => {
// //   const [open, setOpen] = useState(false)
// //   const [text, setText] = useState("")
// //   const { handleLogout, currentUser } = useUserStore()
// //   const [chat, setChat] = useState();

// //   const { chatId, user ,IsCurrentUserBlocked , IsRecieverBlocked, } = useChatStore();

// //   // Debug logs
// //   console.log('Chat component render:', { chatId, user: !!user, currentUser: !!currentUser });

// //   const endRef = useRef(null);
  
// //   useEffect(() => {
// //     endRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [chat])

// //   useEffect(() => {
// //     if (!chatId) {
// //       console.log('No chatId, clearing chat state');
// //       setChat(null);
// //       return;
// //     }

// //     console.log('Setting up chat listener for chatId:', chatId);
// //     const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
// //       console.log('Chat data received:', res.data());
// //       setChat(res.data());
// //     });
    
// //     return () => {
// //       console.log('Cleaning up chat listener');
// //       unSub();
// //     }
// //   }, [chatId]);

// //   const handleSend = async () => {
// //     if (!text.trim() || !chatId || !currentUser) return;
  
// //     try {
// //       await updateDoc(firestoreDoc(db, "chats", chatId), {
// //         messages: arrayUnion({
// //           senderId: currentUser.uid,
// //           text: text.trim(),
// //           createdAt: new Date(),
// //         }),
// //       });
  
// //       const userIds = [currentUser.uid, user.uid];
      
// //       userIds.forEach(async (uid) => {
// //         const userChatsRef = firestoreDoc(db, "user_chats", uid);
// //         const userChatsSnap = await getDoc(userChatsRef);
        
// //         if (userChatsSnap.exists()) {
// //           const userChatsData = userChatsSnap.data();
// //           const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          
// //           if (chatIndex !== -1) {
// //             userChatsData.chats[chatIndex].lastMessage = text.trim();
// //             userChatsData.chats[chatIndex].lastMessageTime = new Date();
// //             userChatsData.chats[chatIndex].isSeen = uid === currentUser.uid ? true : false;
            
// //             await updateDoc(userChatsRef, {
// //               chats: userChatsData.chats,
// //             });
// //           }
// //         }
// //       });
  
// //       setText("");
// //     } catch (error) {
// //       console.error("Error sending message:", error);
// //     }
// //   };

// //   const handleEmoji = (e) => {
// //     setText(prev => prev + e.emoji)
// //     setOpen(false);
// //   }
// //   console.log({user});
// //   return (
// //     <div className='chat'>
// //       <div className="top">
// //         <div className="user">
// //           <img src={user?.ava || "avatar.png"} alt="" />
// //           <div className="texts">
// //             <span>{user?.displayName || "Select a chat"}</span>
// //             <p>{user?.lastSeenAt }</p>
// //           </div>
// //         </div>
// //         <div className="icons">
// //           <img src="phone.png" alt="" />
// //           <img src="video.png" alt="" />
// //           <img src="info.png" alt="" />
// //           {/* <button onClick={handleLogout} className="logout-btn">Logout</button> */}
// //         </div>
// //       </div>

// //       <div className="center">
// //         {chatId ? (
// //           <>
// //             {chat?.messages?.map((message, index) => (
// //               <div className={`message ${message.senderId === currentUser?.uid ? 'own' : ''}`} key={index}>
// //                 {message.senderId !== currentUser?.uid && (
// //                   <img src={user?.avatar || "avatar.png"} alt="" />
// //                 )}
// //                 <div className="text">
// //                   {message.img && <img src={message.img} alt="" />}
// //                   <p>{message.text}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </>
// //         ) : (
// //           <div className="no-chat">
// //             <p>Select a chat to start messaging</p>
// //           </div>
// //         )}
        
// //         <div ref={endRef}></div>
// //       </div>

// //       <div className="bottom">
// //         <div className="icons">
// //           <img src="img.png" alt="" />
// //           <img src="camera.png" alt="" />
// //           <img src="mic.png" alt="" />
// //         </div>

// //         <input 
// //           type="text"
// //           placeholder={IsCurrentUserBlocked || IsRecieverBlocked ? 'You cannot send a message' : 'Type a message...'}
// //           value={text}
// //           onChange={(e) => setText(e.target.value)}
// //           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
// //           disabled={IsCurrentUserBlocked || IsRecieverBlocked}
// //         />

// //         <div className="emoji">
// //           <img src="emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
// //           <div className="picker">
// //             <Emojipicker open={open} onEmojiClick={handleEmoji}/>
// //           </div>
// //         </div>

// //         <button className='sendbutton' onClick={handleSend} disabled={IsCurrentUserBlocked || IsRecieverBlocked}>Send</button>

// //       </div>
// //     </div>
// //   )
// // }

// // export default Chat


// import './chat.css'
// import Emojipicker from "emoji-picker-react"
// import { useState, useRef, useEffect } from 'react'
// import { useUserStore } from '../../lib/useStore'
// import { onSnapshot, updateDoc, arrayUnion, doc as firestoreDoc, serverTimestamp, getDoc } from 'firebase/firestore'
// import { doc } from 'firebase/firestore'
// import { db } from '../../lib/firebase'
// import { useChatStore } from '../../lib/chatStore'

// const Chat = () => {
//   const [open, setOpen] = useState(false)
//   const [text, setText] = useState("")
//   const { handleLogout, currentUser } = useUserStore()
//   const [chat, setChat] = useState();

//   const { chatId, user, IsCurrentUserBlocked, IsRecieverBlocked, resetChatStore } = useChatStore();

//   // Debug logs
//   console.log('Chat component render:', { chatId, user: !!user, currentUser: !!currentUser });

//   const endRef = useRef(null);
  
//   // Reset chat store when user changes or logs out
//   useEffect(() => {
//     // If there's no current user, reset the chat store
//     if (!currentUser) {
//       resetChatStore();
//       setChat(null);
//       return;
//     }
    
//     // If there's a chat selected but it doesn't belong to current user, reset
//     if (chatId && user && currentUser) {
//       // You might want to add additional validation here to ensure
//       // the current chat belongs to the current user
//     }
//   }, [currentUser, resetChatStore]);
  
//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat])

//   useEffect(() => {
//     if (!chatId) {
//       console.log('No chatId, clearing chat state');
//       setChat(null);
//       return;
//     }

//     console.log('Setting up chat listener for chatId:', chatId);
//     const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
//       console.log('Chat data received:', res.data());
//       setChat(res.data());
//     });
    
//     return () => {
//       console.log('Cleaning up chat listener');
//       unSub();
//     }
//   }, [chatId]);

//   const handleSend = async () => {
//     if (!text.trim() || !chatId || !currentUser) return;
  
//     try {
//       await updateDoc(firestoreDoc(db, "chats", chatId), {
//         messages: arrayUnion({
//           senderId: currentUser.uid,
//           text: text.trim(),
//           createdAt: new Date(),
//         }),
//       });
  
//       const userIds = [currentUser.uid, user.uid];
      
//       userIds.forEach(async (uid) => {
//         const userChatsRef = firestoreDoc(db, "user_chats", uid);
//         const userChatsSnap = await getDoc(userChatsRef);
        
//         if (userChatsSnap.exists()) {
//           const userChatsData = userChatsSnap.data();
//           const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          
//           if (chatIndex !== -1) {
//             userChatsData.chats[chatIndex].lastMessage = text.trim();
//             userChatsData.chats[chatIndex].lastMessageTime = new Date();
//             userChatsData.chats[chatIndex].isSeen = uid === currentUser.uid ? true : false;
            
//             await updateDoc(userChatsRef, {
//               chats: userChatsData.chats,
//             });
//           }
//         }
//       });
  
//       setText("");
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };

//   const handleEmoji = (e) => {
//     setText(prev => prev + e.emoji)
//     setOpen(false);
//   }

//   // Enhanced logout handler that resets chat state
//   const handleLogoutWithReset = () => {
//     resetChatStore(); // Reset chat store before logging out
//     handleLogout();
//   };

//   console.log({user});
//   return (
//     <div className='chat'>
//       <div className="top">
//         <div className="user">
//           <img src={user?.ava || "avatar.png"} alt="" />
//           <div className="texts">
//             <span>{user?.displayName || "Select a chat"}</span>
//             <p>{user?.lastSeenAt }</p>
//           </div>
//         </div>
//         <div className="icons">
//           <img src="phone.png" alt="" />
//           <img src="video.png" alt="" />
//           <img src="info.png" alt="" />
//           {/* Uncomment and use the enhanced logout handler if needed */}
//           {/* <button onClick={handleLogoutWithReset} className="logout-btn">Logout</button> */}
//         </div>
//       </div>

//       <div className="center">
//         {chatId ? (
//           <>
//             {chat?.messages?.map((message, index) => (
//               <div className={`message ${message.senderId === currentUser?.uid ? 'own' : ''}`} key={index}>
//                 {message.senderId !== currentUser?.uid && (
//                   <img src={user?.avatar || "avatar.png"} alt="" />
//                 )}
//                 <div className="text">
//                   {message.img && <img src={message.img} alt="" />}
//                   <p>{message.text}</p>
//                 </div>
//               </div>
//             ))}
//           </>
//         ) : (
//           <div className="no-chat">
//             <p>Select a chat to start messaging</p>
//           </div>
//         )}
        
//         <div ref={endRef}></div>
//       </div>

//       <div className="bottom">
//         <div className="icons">
//           <img src="img.png" alt="" />
//           <img src="camera.png" alt="" />
//           <img src="mic.png" alt="" />
//         </div>

//         <input 
//           type="text"
//           placeholder={IsCurrentUserBlocked || IsRecieverBlocked ? 'You cannot send a message' : 'Type a message...'}
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//           disabled={IsCurrentUserBlocked || IsRecieverBlocked}
//         />

//         <div className="emoji">
//           <img src="emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
//           <div className="picker">
//             <Emojipicker open={open} onEmojiClick={handleEmoji}/>
//           </div>
//         </div>

//         <button className='sendbutton' onClick={handleSend} disabled={IsCurrentUserBlocked || IsRecieverBlocked}>Send</button>

//       </div>
//     </div>
//   )
// }

// export default Chat


import './chat.css'
import Emojipicker from "emoji-picker-react"
import { useState, useRef, useEffect } from 'react'
import { useUserStore } from '../../lib/useStore'
import { onSnapshot, updateDoc, arrayUnion, doc as firestoreDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'

const Chat = () => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const { handleLogout, currentUser } = useUserStore()
  const [chat, setChat] = useState();

  const { chatId, user, IsCurrentUserBlocked, IsRecieverBlocked, clearChat } = useChatStore();

  // Debug logs
  console.log('Chat component render:', { chatId, user: !!user, currentUser: !!currentUser });

  const endRef = useRef(null);
  
  // Reset chat when current user changes or becomes null
  useEffect(() => {
    if (!currentUser) {
      console.log('🧹 No current user, clearing chat state in Chat component');
      clearChat();
      setChat(null);
    }
  }, [currentUser, clearChat]);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat])

  useEffect(() => {
    if (!chatId) {
      console.log('No chatId, clearing chat state');
      setChat(null);
      return;
    }

    console.log('Setting up chat listener for chatId:', chatId);
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      console.log('Chat data received:', res.data());
      setChat(res.data());
    });
    
    return () => {
      console.log('Cleaning up chat listener');
      unSub();
    }
  }, [chatId]);

  const handleSend = async () => {
    if (!text.trim() || !chatId || !currentUser) return;
  
    try {
      await updateDoc(firestoreDoc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.uid,
          text: text.trim(),
          createdAt: new Date(),
        }),
      });
  
      const userIds = [currentUser.uid, user.uid];
      
      userIds.forEach(async (uid) => {
        const userChatsRef = firestoreDoc(db, "user_chats", uid);
        const userChatsSnap = await getDoc(userChatsRef);
        
        if (userChatsSnap.exists()) {
          const userChatsData = userChatsSnap.data();
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text.trim();
            userChatsData.chats[chatIndex].lastMessageTime = new Date();
            userChatsData.chats[chatIndex].isSeen = uid === currentUser.uid ? true : false;
            
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
  
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEmoji = (e) => {
    setText(prev => prev + e.emoji)
    setOpen(false);
  }

  console.log({user});
  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || user?.ava || "avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.displayName || "Select a chat"}</span>
            <p>{user?.lastSeenAt}</p>
          </div>
        </div>
        <div className="icons">
          <img src="phone.png" alt="" />
          <img src="video.png" alt="" />
          <img src="info.png" alt="" />
          {/* <button onClick={handleLogout} className="logout-btn">Logout</button> */}
        </div>
      </div>

      <div className="center">
        {chatId && currentUser ? (
          <>
            {chat?.messages?.map((message, index) => (
              <div className={`message ${message.senderId === currentUser?.uid ? 'own' : ''}`} key={index}>
                {message.senderId !== currentUser?.uid && (
                  <img src={user?.avatar || user?.ava || "avatar.png"} alt="" />
                )}
                <div className="text">
                  {message.img && <img src={message.img} alt="" />}
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="no-chat">
            <p>Select a chat to start messaging</p>
          </div>
        )}
        
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="img.png" alt="" />
          <img src="camera.png" alt="" />
          <img src="mic.png" alt="" />
        </div>

        <input 
          type="text"
          placeholder={IsCurrentUserBlocked || IsRecieverBlocked ? 'You cannot send a message' : 'Type a message...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={IsCurrentUserBlocked || IsRecieverBlocked}
        />

        <div className="emoji">
          <img src="emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
          <div className="picker">
            <Emojipicker open={open} onEmojiClick={handleEmoji}/>
          </div>
        </div>

        <button className='sendbutton' onClick={handleSend} disabled={IsCurrentUserBlocked || IsRecieverBlocked}>Send</button>

      </div>
    </div>
  )
}

export default Chat