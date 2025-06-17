

import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    IsCurrentUserBlocked: false,
    IsRecieverBlocked: false,

    changeChat: (chatId, user, currentUser) => {
        if (!currentUser) {
            console.error('No current user provided');
            return;
        }

        // Ensure blocked arrays exist
        const userBlocked = user.blocked || [];
        const currentUserBlocked = currentUser.blocked || [];

        // user blocked
        if (userBlocked.includes(currentUser.uid)) {
            return set({
                chatId,
                user: null,
                IsCurrentUserBlocked: true,
                IsRecieverBlocked: false
            });
        }
        // receiver blocked
        else if (currentUserBlocked.includes(user.uid)) {
            return set({
                chatId,
                user: user,
                IsCurrentUserBlocked: false,
                IsRecieverBlocked: true
            });
        }
        // normal chat
        else {
            return set({
                chatId,
                user: user,
                IsCurrentUserBlocked: false,
                IsRecieverBlocked: false
            });
        }
    },

    changeBlock: () =>{
        set((state)=> ({...state,IsRecieverBlocked: !state.IsRecieverBlocked}));
    },

    // Add a method to reset/clear the current chat
    clearChat: () => {
        set({
            chatId: null,
            user: null,
            IsCurrentUserBlocked: false,
            IsRecieverBlocked: false
        });
    }
}));