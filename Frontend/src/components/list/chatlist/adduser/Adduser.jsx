
import './adduser.css';

const Adduser = () => {
  return (
    <div className='adduser'>

      
      <form action="">
        <input type="text"placeholder='Username' name='username' />
        <button>Search</button>
      </form>


      <div className="user">
        <div className="detail">
          <img src="./avatar.png" alt="" />
          <span>John Doe</span>
        </div>
        <button>
          Adduser
        </button>
      </div>
    </div>
  )
}

export default Adduser
