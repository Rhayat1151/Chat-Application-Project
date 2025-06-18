
// import './detail.css';
// import { useUserStore } from '../../lib/useStore';
// import { useChatStore } from '../../lib/chatStore';
// import { arrayRemove, arrayUnion, updateDoc, doc } from 'firebase/firestore';
// import { db } from '../../lib/firebase'; // Adjust the path based on your project structure

// const Detail = () => {
//   const { chatId, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useUserStore();
//   const { currentUser, handleLogout } = useUserStore();
//   const { user } = useChatStore(); // Get the chat user from chatStore
  
//   const handleBlock = async () => {
//     if(!user) return;

//     const userDocRef = doc(db, "users", user.uid);


//     try
//     {

//       await updateDoc(userDocRef, {
//         blocked: isReceiverBlocked ? arrayRemove(user.uid) : arrayUnion(currentUser.uid),
//       });
//       console.log(currentUser.uid, "blocked" );
//       changeBlock(); // Toggle the block state in the store


//     }catch(err){
//       console.log(err);
//     }
//   };
  
//   const onLogout = async () => {
//     try {
//       await handleLogout();
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   return (
//     <div className='detail'>
//       <div className="user">
//         <img 
//           src={user?.avatar || "./avatar.png"} 
//           alt="User avatar" 
//           onError={(e) => {
//             e.target.src = "./avatar.png";
//           }}
//         />
//         <h2>{user?.displayName || "Unknown User"}</h2>
//         <p>This is heck of a guy.</p>
//       </div>
      
//       <div className="info">
//         <div className="option">
//           <div className="title">
//             <span>Chat Settings</span>
//             <img src="arrowUp.png" alt="Toggle" />
//           </div>
//         </div>

//         <div className="option">
//           <div className="title">
//             <span>Privacy & Help</span>
//             <img src="arrowUp.png" alt="Toggle" />
//           </div>
//         </div>

//         <div className="option">
//           <div className="title">
//             <span>Shared Photos</span>
//             <img src="arrowDown.png" alt="Toggle" />
//           </div>
//           <div className="photos">
//             <div className="photoitem">
//               <div className="photodetail">
//                 <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
//                 <span>Img-5413</span>
//               </div>
//             </div>
//             <div className="photoitem">
//               <div className="photodetail">
//                 <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
//                 <span>Img-5414</span>
//               </div>
//             </div>

//             <div className="photoitem">
//               <div className="photodetail">
//                 <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
//                 <span>Img-5416</span>
//               </div>
//             </div>
//             <img src="download.png" alt="Download all" />
//           </div>
//         </div>

//         <div className="option">
//           <div className="title">
//             <span>Shared Files</span>
//             <img src="arrowUp.png" alt="Toggle" />
//           </div>
//         </div>

//         <button onClick={handleBlock}>
//           {isCurrentUserBlocked ? "You are BLocked" : isReceiverBlocked ? "User Blocked" : "Block User"} 
//           </button>
//         <button className='logout' onClick={onLogout}>Logout</button>
//       </div>
//     </div>
//   );
// };

// export default Detail;

import './detail.css';
import { useUserStore } from '../../lib/useStore';
import { useChatStore } from '../../lib/chatStore';
import { arrayRemove, arrayUnion, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Detail = () => {
  const { currentUser, handleLogout } = useUserStore();
  const { user, chatId, IsCurrentUserBlocked, IsRecieverBlocked, changeBlock } = useChatStore();
  
  const handleBlock = async () => {
    if (!user || !currentUser) {
      console.error('Missing user or currentUser');
      return;
    }

    // Use the correct collection name based on your security rules
    // Your rules show both 'users' and 'user' collections
    const currentUserDocRef = doc(db, "user", currentUser.uid);

    try {
      console.log('Attempting to block/unblock:', {
        currentUserUid: currentUser.uid,
        targetUserUid: user.uid,
        isReceiverBlocked: IsRecieverBlocked, // Fixed: use the correct variable name
        action: IsRecieverBlocked ? 'unblock' : 'block'
      });

      await updateDoc(currentUserDocRef, {
        blocked: IsRecieverBlocked 
          ? arrayRemove(user.uid)  // Unblock: remove other user's UID
          : arrayUnion(user.uid),  // Block: add other user's UID
      });
      
      console.log(`User ${user.uid} ${IsRecieverBlocked ? 'unblocked' : 'blocked'} by ${currentUser.uid}`);
      changeBlock(); // Toggle the block state in the store
    } catch (err) {
      console.error('Error blocking/unblocking user:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        currentUserUid: currentUser.uid,
        targetUserUid: user.uid
      });
    }
  };
  
  const onLogout = async () => {
    try {
      await handleLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className='detail'>
      <div className="user">
        <img 
          src={user?.avatar || "./avatar.png"} 
          alt="User avatar" 
          onError={(e) => {
            e.target.src = "./avatar.png";
          }}
        />
        <h2>{user?.displayName || "Unknown User"}</h2>
        <p>This is heck of a guy.</p>
      </div>
      
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="arrowUp.png" alt="Toggle" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="arrowUp.png" alt="Toggle" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="arrowDown.png" alt="Toggle" />
          </div>
          <div className="photos">
            <div className="photoitem">
              <div className="photodetail">
                <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
                <span>Img-5413</span>
              </div>
            </div>
            <div className="photoitem">
              <div className="photodetail">
                <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
                <span>Img-5414</span>
              </div>
            </div>
            <div className="photoitem">
              <div className="photodetail">
                <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
                <span>Img-5416</span>
              </div>
            </div>
            <img src="download.png" alt="Download all" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="arrowUp.png" alt="Toggle" />
          </div>
        </div>

        <button onClick={handleBlock}>
          {IsCurrentUserBlocked ? "You are Blocked" : IsRecieverBlocked ? "User Blocked" : "Block User"} 
        </button>
        <button className='logout' onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;

