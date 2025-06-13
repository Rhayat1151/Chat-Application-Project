// import List from "./components/list/List"
// import Chat from "./components/chat/Chat"
// import Detail from "./components/detail/Detail"
// import Login from "./components/login/Login"
// import Notification from "./components/notification/Notification"

// const user = false


// const App = () => {
//   return (


//     <div className='container'>

//       {user ? (
//         <>
//               <List />
//               <Chat />
//               <Detail />
//         </>

//       ) : <Login />}
  
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

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <>
      {currentUser ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        <Login />
      )}
    </>
  )
}

export default App