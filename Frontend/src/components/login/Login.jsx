// components/login/Login.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import './login.css';
import { auth } from '../../lib/firebase';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerLoading) return;
    setRegisterLoading(true);

    try {
      const formData = new FormData(e.target);
      const { username, email, password } = Object.fromEntries(formData);

      if (!username || !email || !password) {
        toast.error("Please fill in all fields");
        setRegisterLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setRegisterLoading(false);
        return;
      }

      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user to Azure Cosmos DB via backend API
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: username,
        photoURL: avatar.url || '',
        createdAt: new Date().toISOString(),
        blocked: []
      };

      const result = await apiService.createUser(userData);

      if (result.success) {
        toast.success("Account created successfully!");
        e.target.reset();
        setAvatar({ file: null, url: "" });
      } else {
        toast.error("Account created but failed to sync. Please try logging in.");
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email is already registered. Please use a different email or try logging in.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password is too weak. Please use a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address. Please check your email.");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginLoading) return;
    setLoginLoading(true);

    try {
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);

      if (!email || !password) {
        toast.error("Please fill in all fields");
        setLoginLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast.success("Logged in successfully!");
      e.target.reset();
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email. Please check your email or create an account.");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address. Please check your email.");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many failed attempts. Please wait a moment before trying again.");
      } else {
        toast.error(error.message || "Failed to login. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            name="email" 
            required 
            disabled={loginLoading}
            autoComplete="email"
          />
          <input 
            type="password" 
            placeholder="Password" 
            name="password" 
            required 
            disabled={loginLoading}
            autoComplete="current-password"
          />
          <button disabled={loginLoading} type="submit">
            {loginLoading ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="Avatar preview" />
            Upload an image
          </label>
          <input 
            type="file" 
            id="file" 
            style={{ display: "none" }} 
            onChange={handleAvatar}
            accept="image/*"
            disabled={registerLoading}
          />
          <input 
            type="text" 
            placeholder="Username" 
            name="username" 
            required 
            disabled={registerLoading}
            autoComplete="username"
          />
          <input 
            type="email" 
            placeholder="Email" 
            name="email" 
            required 
            disabled={registerLoading}
            autoComplete="email"
          />
          <input 
            type="password" 
            placeholder="Password" 
            name="password" 
            required 
            disabled={registerLoading}
            autoComplete="new-password"
            minLength="6"
          />
          <button disabled={registerLoading} type="submit">
            {registerLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;