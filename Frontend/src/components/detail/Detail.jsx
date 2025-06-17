// import './detail.css'
// import { useUserStore } from '../../lib/useStore'




// const Detail = () => {

//   const {chatId, user,isCUrrentUSerBlocked,isRecieverBlocked,changeBlock} = useUserStore();
//   const {currentUser} = useUserStore();
//   const handleBLock = () => {

//   }
  
//   const { handleLogout } = useUserStore()

//   const onLogout = async () => {
//     try {
//       await handleLogout()
//       // The App component will automatically show Login when currentUser becomes null
//     } catch (error) {
//       console.error('Logout failed:', error)
//     }
//   }
//   console.log("this is userr",{user});
//   return (
//     <div className='detail'>
//       <div className="user">
//         <img src={"./avatar.png"} alt="User avatar" />
        
//         <h2>{currentUser?.displayName}</h2>
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

//         <button onClick={handleBLock}>Block User</button>
//         <button className='logout' onClick={onLogout}>Logout</button>
//       </div>
//     </div>
//   )
// }

// export default Detail;

// // import './detail.css'
// // import { useUserStore } from '../../lib/useStore'
// // import { useChatStore } from '../../lib/chatStore' // Add this import

// // const Detail = () => {
// //   // Get user from useChatStore, not useUserStore
// //   const { user } = useChatStore();
// //   const { currentUser, handleLogout } = useUserStore();
  
// //   const handleBLock = () => {
// //     // Block user logic here
// //   }

// //   const onLogout = async () => {
// //     try {
// //       await handleLogout()
// //       // The App component will automatically show Login when currentUser becomes null
// //     } catch (error) {
// //       console.error('Logout failed:', error)
// //     }
// //   }
  
// //   console.log("this is user", { user });
  
// //   return (
// //     <div className='detail'>
// //       <div className="user">
// //         <img src={"./avatar.png"} alt="User avatar" />
// //         <h2>{user?.displayName}</h2>
// //         <p>This is heck of a guy.</p>
// //       </div>
      
// //       <div className="info">
// //         <div className="option">
// //           <div className="title">
// //             <span>Chat Settings</span>
// //             <img src="arrowUp.png" alt="Toggle" />
// //           </div>
// //         </div>

// //         <div className="option">
// //           <div className="title">
// //             <span>Privacy & Help</span>
// //             <img src="arrowUp.png" alt="Toggle" />
// //           </div>
// //         </div>

// //         <div className="option">
// //           <div className="title">
// //             <span>Shared Photos</span>
// //             <img src="arrowDown.png" alt="Toggle" />
// //           </div>
// //           <div className="photos">
// //             <div className="photoitem">
// //               <div className="photodetail">
// //                 <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
// //                 <span>Img-5413</span>
// //               </div>
// //             </div>
// //             <div className="photoitem">
// //               <div className="photodetail">
// //                 <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
// //                 <span>Img-5414</span>
// //               </div>
// //             </div>

// //             <div className="photoitem">
// //               <div className="photodetail">
// //                 <img src="Screenshot from 2025-06-12 07-36-58.png" alt="Shared photo" />
// //                 <span>Img-5416</span>
// //               </div>
// //             </div>
// //             <img src="download.png" alt="Download all" />
// //           </div>
// //         </div>

// //         <div className="option">
// //           <div className="title">
// //             <span>Shared Files</span>
// //             <img src="arrowUp.png" alt="Toggle" />
// //           </div>
// //         </div>

// //         <button onClick={handleBLock}>Block User</button>
// //         <button className='logout' onClick={onLogout}>Logout</button>
// //       </div>
// //     </div>
// //   )
// // }

// // export default Detail;
import './detail.css';
import { useUserStore } from '../../lib/useStore';
import { useChatStore } from '../../lib/chatStore';
import { arrayRemove, arrayUnion, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Adjust the path based on your project structure

const Detail = () => {
  const { chatId, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useUserStore();
  const { currentUser, handleLogout } = useUserStore();
  const { user } = useChatStore(); // Get the chat user from chatStore
  
  const handleBlock = async () => {
    if(!user) return;

    const userDocRef = doc(db, "users", user.uid);


    try
    {

      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.uid) : arrayUnion(currentUser.uid),
      });
      console.log(currentUser.uid, "blocked" );
      changeBlock(); // Toggle the block state in the store


    }catch(err){
      console.log(err);
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
          {isCurrentUserBlocked ? "You are BLocked" : isReceiverBlocked ? "User Blocked" : "Block User"} 
          </button>
        <button className='logout' onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;