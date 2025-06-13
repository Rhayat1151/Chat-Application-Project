import './chat.css'
import Emojipicker from "emoji-picker-react"
import { useState, useRef, useEffect } from 'react'
import { useUserStore } from '../../lib/useStore'

const Chat = () => {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const { handleLogout } = useUserStore()

  const endRef = useRef(null);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []) // Added dependency array to prevent infinite re-renders

  const handleEmoji = (e) => {
    setText(prev => prev + e.emoji)
    setOpen(false);
  }

  console.log(text);
  
  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src="avatar.png" alt="" />
          <div className="texts">
            <span>John Doe</span>
            <p>This guy is heck of a person</p>
          </div>
        </div>
        <div className="icons">
          <img src="phone.png" alt="" />
          <img src="video.png" alt="" />
          <img src="info.png" alt="" />
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="center">
        <div className="message">
          <img src="avatar.png" alt="" />
          <div className="text">
            <p>Hello, how are you?</p>
            <span>1 min ago</span>
          </div>
        </div>
        
        <div className="message">
          <img src="avatar.png" alt="" />
          <div className="text">
            <p>Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you?</p>
            <span>1 min ago</span>
          </div>
        </div>
        
        <div className="message own">
          <div className="text">
            <p>Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you?</p>
            <span>1 min ago</span>
          </div>
        </div>
        
        <div className="message own">
          <div className="text">
            <p>Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you? Hello, how are you?</p>
            <span>1 min ago</span>
          </div>
        </div>
        
        <div className="message">
          <img src="avatar.png" alt="" />
          <div className="text">
            <p>Hello, how are you?</p>
            <span>1 min ago</span>
          </div>
        </div>
        
        <div className="message own">
          <div className="text">
            <img src="Screenshot from 2025-06-12 07-36-58.png" alt="" />
            <p>Hello, how are you?</p>
            <span>1 min ago</span>
          </div>
        </div>
        
        <div className="message">
          <img src="avatar.png" alt="" />
          <div className="text">
            <p>Hello, how are you?</p>
            <span>1 min ago</span>
          </div>
        </div>
        
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="img.png" alt="" />
          <img src="camera.png" alt="" />
          <img src="mic.png" alt="" />
        </div>

        <input 
          type="text"
          placeholder='Type a message'
          value={text}
          onChange={(e) => setText(e.target.value)} 
        />

        <div className="emoji">
          <img src="emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
          <div className="picker">
            <Emojipicker open={open} onEmojiClick={handleEmoji}/>
          </div>
        </div>

        <button className='sendbutton'>Send</button>

      </div>
    </div>
  )
}

export default Chat