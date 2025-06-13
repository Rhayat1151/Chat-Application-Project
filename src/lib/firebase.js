// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// // Your web app's Firebase configuration
// // You'll get these values from your Firebase console
// const firebaseConfig = {
//     apiKey: "AIzaSyAaRS_NOexD1-IeXHf3xqQcGRr9dyBTb0k",
//     authDomain: "chat-application-5d1a4.firebaseapp.com",
//     projectId: "chat-application-5d1a4",
//     storageBucket: "chat-application-5d1a4.firebasestorage.app",
//     messagingSenderId: "119430505192",
//     appId: "1:119430505192:web:782132aedf94047f149f5d"
//   };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Authentication and get a reference to the service
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);
// export default app;
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAaRS_NOexD1-IeXHf3xqQcGRr9dyBTb0k",
  authDomain: "chat-application-5d1a4.firebaseapp.com",
  projectId: "chat-application-5d1a4",
  storageBucket: "chat-application-5d1a4.firebasestorage.app",
  messagingSenderId: "119430505192",
  appId: "1:119430505192:web:782132aedf94047f149f5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
