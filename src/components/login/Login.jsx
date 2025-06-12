import React, { useState } from 'react'
import './login.css'
import { toast } from 'react-toastify'

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: '',
  })

  const handleAvatar = (e) => {
    if(e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar({
        file: file,
        url: URL.createObjectURL(file)
      })
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // Add your login logic here
    toast.warn('Login form submitted')
    console.log('Login form submitted')
  }

  const handleRegister = (e) => {
    e.preventDefault()
    // Add your registration logic here
    toast.warn('Login form submitted')
    console.log('Register form submitted')
  }

  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder='Email' required />
          <input type="password" placeholder='Password' required />
          <button type="submit">Sign In</button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <img 
            src={avatar.url || "avatar.png"} 
            alt="Profile" 
            onClick={() => document.getElementById('file').click()}
          />
          <label htmlFor="file">Upload Profile Image</label>
          <input 
            type="file" 
            id="file" 
            style={{display:'none'}} 
            onChange={handleAvatar}
            accept="image/*"
          />
          <input type="text" placeholder='Username' required />
          <input type="email" placeholder='Email' required />
          <input type="password" placeholder='Password' required />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  )
}

export default Login