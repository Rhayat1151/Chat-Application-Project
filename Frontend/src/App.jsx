// src/App.jsx
import { useEffect, useState } from 'react'
import { useUserStore } from './lib/useStore'
import { apiService } from './lib/api'
import Login from './components/login/Login'
import Chat from './components/chat/Chat'
import List from './components/list/List'
import Detail from './components/detail/Detail'
import Notification from './components/notification/Notification'

const App = () => {
  const { currentUser, isLoading, logout } = useUserStore()
  const [backendError, setBackendError] = useState(false)

  // Always log out on app load to force login page
  useEffect(() => {
    if (logout) logout()
    // If you have setCurrentUser, you can use: setCurrentUser(null)
  }, [])

  // Test backend API connection on app start
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await apiService.healthCheck()
        console.log('Backend connection successful:', response)
        setBackendError(false)
      } catch (error) {
        console.error('Backend connection failed:', error)
        setBackendError(true)
      }
    }

    testBackendConnection()
  }, [])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    )
  }

  if (backendError) {
    return (
      <div className="error-container">
        <div>
          <h3>Connection Error</h3>
          <p>Unable to connect to the server. Please make sure the backend is running.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className='container'>
      {currentUser ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  )
}

export default App