import React, { useState } from 'react'
import './login.css'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase' // Adjust the path as needed

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
    e.preventDefault();
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    console.log(email, password);
    toast.warn('Login form submitted');
    console.log(email, password);
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try{
        const res = await createUserWithEmailAndPassword(auth, email, password);
        
    }catch(err) {
      console.log(err);
      toast.error('Failed to register. Please try again');
      return;
    }
    // console.log(username, email, password);
    // // Add your registration logic here
    // toast.warn('Login form submitted')
    // console.log('Register form submitted')
  }

  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder='Email' required name="email" />
          <input type="password" placeholder='Password' required name="password" />
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
            name="avatar"
          />
          <input type="text" placeholder='Username' required name="username" />
          <input type="email" placeholder='Email' required name="email" />
          <input type="password" placeholder='Password' required name="password" />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  )
}

export default Login
