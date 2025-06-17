// // src/App.jsx
// import { useEffect, useState } from 'react'
// import { useUserStore } from './lib/useStore'
// import { useChatStore } from './lib/chatStore'
// import { apiService } from './lib/api'
// import Login from './components/login/Login'
// import Chat from './components/chat/Chat'
// import List from './components/list/List'
// import Detail from './components/detail/Detail'
// import Notification from './components/notification/Notification'

// const App = () => {
//   const { currentUser, isLoading, logout } = useUserStore()
//   const [backendError, setBackendError] = useState(false)
//   const { chatId} = useChatStore()
//   // Always log out on app load to force login page
//   useEffect(() => {
//     if (logout) logout()
//     // If you have setCurrentUser, you can use: setCurrentUser(null)
//   }, [])

//   // Test backend API connection on app start
//   useEffect(() => {
//     const testBackendConnection = async () => {
//       try {
//         const response = await apiService.healthCheck()
//         console.log('Backend connection successful:', response)
//         setBackendError(false)
//       } catch (error) {
//         console.error('Backend connection failed:', error)
//         setBackendError(true)
//       }
//     }

//     testBackendConnection()
//   }, [])

//   if (isLoading) {
//     return (
//       <div className="loading-container">
//         <div>Loading...</div>
//       </div>
//     )
//   }

//   if (backendError) {
//     return (
//       <div className="error-container">
//         <div>
//           <h3>Connection Error</h3>
//           <p>Unable to connect to the server. Please make sure the backend is running.</p>
//           <button onClick={() => window.location.reload()}>Retry</button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className='container'>
//       {currentUser ? (
//         <>
//           <List />
//          {chatId && <Chat />}
//           {chatId &&<Detail />}
//         </>
//       ) : (
//         <Login />
//       )}
//       <Notification />
//     </div>
//   )
// }

// export default App

import List from "./components/list/List"
import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import Login from "./components/login/Login"
import Notification from "./components/notification/Notification"
import { UserProvider, useUserStore } from "./lib/useStore"
import { useEffect } from "react"

const App = () => {
  return (
    <UserProvider>
      <div className='container'>
        <MainApp />
        <Notification /> 
      </div>
    </UserProvider>
  )
}

const MainApp = () => {
  const { currentUser, isLoading } = useUserStore()

  // Debug logs
  console.log('MainApp render:', { currentUser: !!currentUser, isLoading });

  if (isLoading) {
    console.log('Showing loading state');
    return <div className="loading">Loading...</div>
  }

  if (!currentUser) {
    console.log('No current user, showing login');
    return <Login />
  }

  console.log('User is logged in, showing main components');
  return (
    <>
      <List />
      <Chat />
      <Detail />
    </>
  )
}

export default App