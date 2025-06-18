

// import { doc, getDoc } from "firebase/firestore";
// import { create } from "zustand";
// import { db } from "./firebase";

// export const useChatStore = create((set) => ({
//     chatId: null,
//     user: null,
//     IsCurrentUserBlocked: false,
//     IsRecieverBlocked: false,

//     changeChat: (chatId, user, currentUser) => {
//         if (!currentUser) {
//             console.error('No current user provided');
//             return;
//         }

//         // Ensure blocked arrays exist
//         const userBlocked = user.blocked || [];
//         const currentUserBlocked = currentUser.blocked || [];

//         // user blocked
//         if (userBlocked.includes(currentUser.uid)) {
//             return set({
//                 chatId,
//                 user: null,
//                 IsCurrentUserBlocked: true,
//                 IsRecieverBlocked: false
//             });
//         }
//         // receiver blocked
//         else if (currentUserBlocked.includes(user.uid)) {
//             return set({
//                 chatId,
//                 user: user,
//                 IsCurrentUserBlocked: false,
//                 IsRecieverBlocked: true
//             });
//         }
//         // normal chat
//         else {
//             return set({
//                 chatId,
//                 user: user,
//                 IsCurrentUserBlocked: false,
//                 IsRecieverBlocked: false
//             });
//         }
//     },

//     changeBlock: () =>{
//         set((state)=> ({...state,IsRecieverBlocked: !state.IsRecieverBlocked}));
//     },

//     // Add a method to reset/clear the current chat
//     clearChat: () => {
//         set({
//             chatId: null,
//             user: null,
//             IsCurrentUserBlocked: false,
//             IsRecieverBlocked: false
//         });
//     }
// }));

// import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
// import { create } from "zustand";
// import { db } from "./firebase";

// export const useChatStore = create((set, get) => ({
//     chatId: null,
//     user: null,
//     IsCurrentUserBlocked: false,
//     IsRecieverBlocked: false,

//     changeChat: (chatId, user, currentUser) => {
//         if (!currentUser) {
//             console.error('No current user provided');
//             return;
//         }

//         console.log('changeChat called with:', {
//             chatId,
//             user: user?.displayName,
//             currentUser: currentUser?.displayName,
//             userBlocked: user?.blocked,
//             currentUserBlocked: currentUser?.blocked
//         });

//         // Ensure blocked arrays exist
//         const userBlocked = user.blocked || [];
//         const currentUserBlocked = currentUser.blocked || [];

//         // Check if current user is blocked by the other user
//         if (userBlocked.includes(currentUser.uid)) {
//             return set({
//                 chatId,
//                 user: null,
//                 IsCurrentUserBlocked: true,
//                 IsRecieverBlocked: false
//             });
//         }
//         // Check if current user has blocked the other user
//         else if (currentUserBlocked.includes(user.uid)) {
//             return set({
//                 chatId,
//                 user: user,
//                 IsCurrentUserBlocked: false,
//                 IsRecieverBlocked: true
//             });
//         }
//         // Normal chat - no blocking
//         else {
//             return set({
//                 chatId,
//                 user: user,
//                 IsCurrentUserBlocked: false,
//                 IsRecieverBlocked: false
//             });
//         }
//     },

//     changeBlock: () => {
//         set((state) => ({
//             ...state,
//             IsRecieverBlocked: !state.IsRecieverBlocked
//         }));
//     },

//     // Method to update blocking status after Firebase operation
//     updateBlockingStatus: (currentUser) => {
//         const state = get();
//         if (!state.user || !currentUser) return;

//         const currentUserBlocked = currentUser.blocked || [];
//         const userBlocked = state.user.blocked || [];

//         set({
//             IsCurrentUserBlocked: userBlocked.includes(currentUser.uid),
//             IsRecieverBlocked: currentUserBlocked.includes(state.user.uid)
//         });
//     },

//     // Add a method to reset/clear the current chat
//     clearChat: () => {
//         set({
//             chatId: null,
//             user: null,
//             IsCurrentUserBlocked: false,
//             IsRecieverBlocked: false
//         });
//     }
// }));

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export const useChatStore = create((set, get) => ({
    chatId: null,
    user: null,
    IsCurrentUserBlocked: false,
    IsRecieverBlocked: false,

    changeChat: (chatId, user, currentUser) => {
        if (!currentUser) {
            console.error('No current user provided');
            return;
        }

        console.log('changeChat called with:', {
            chatId,
            user: user?.displayName,
            currentUser: currentUser?.displayName,
            userBlocked: user?.blocked,
            currentUserBlocked: currentUser?.blocked
        });

        // Ensure blocked arrays exist
        const userBlocked = user.blocked || [];
        const currentUserBlocked = currentUser.blocked || [];

        // Check if current user is blocked by the other user
        if (userBlocked.includes(currentUser.uid)) {
            return set({
                chatId,
                user: null,
                IsCurrentUserBlocked: true,
                IsRecieverBlocked: false
            });
        }
        // Check if current user has blocked the other user
        else if (currentUserBlocked.includes(user.uid)) {
            return set({
                chatId,
                user: user,
                IsCurrentUserBlocked: false,
                IsRecieverBlocked: true
            });
        }
        // Normal chat - no blocking
        else {
            return set({
                chatId,
                user: user,
                IsCurrentUserBlocked: false,
                IsRecieverBlocked: false
            });
        }
    },

    changeBlock: () => {
        set((state) => ({
            ...state,
            IsRecieverBlocked: !state.IsRecieverBlocked
        }));
    },

    // Method to update blocking status after Firebase operation
    updateBlockingStatus: (currentUser) => {
        const state = get();
        if (!state.user || !currentUser) return;

        const currentUserBlocked = currentUser.blocked || [];
        const userBlocked = state.user.blocked || [];

        set({
            IsCurrentUserBlocked: userBlocked.includes(currentUser.uid),
            IsRecieverBlocked: currentUserBlocked.includes(state.user.uid)
        });
    },

    // Enhanced method to reset/clear the current chat
    clearChat: () => {
        console.log('🧹 Clearing chat store...');
        set({
            chatId: null,
            user: null,
            IsCurrentUserBlocked: false,
            IsRecieverBlocked: false
        });
    },

    // Alternative name for the same function (for consistency with your previous code)
    resetChatStore: () => {
        const { clearChat } = get();
        clearChat();
    }
}));