import List from "./components/list/List"
import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import Login from "./components/login/Login"

const user = true


const App = () => {
  return (


    <div className='container'>

      {user ? (
        <>
              <List />
              <Chat />
              <Detail />
        </>

      ) : <Login />}
  

    </div>
  )
}

export default App