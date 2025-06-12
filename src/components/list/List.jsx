import Userinfo from './userinfo/Userinfo'
import Chatlist from './chatlist/Chatlist'

import './list.css'

const List = () => {
  return (
    <div className='list'>
      <Userinfo />
      <Chatlist />
    </div>
  )
}

export default List