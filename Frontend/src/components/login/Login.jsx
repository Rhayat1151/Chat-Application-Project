// // components/login/Login.jsx
// import { useState } from 'react';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// import './login.css';
// import { auth } from '../../lib/firebase';
// import { apiService } from '../../lib/api';
// import { toast } from 'react-toastify';

// const Login = () => {
//   const [avatar, setAvatar] = useState({
//     file: null,
//     url: ""
//   });
//   const [loading, setLoading] = useState(false);

//   const handleAvatar = (e) => {
//     if (e.target.files[0]) {
//       setAvatar({
//         file: e.target.files[0],
//         url: URL.createObjectURL(e.target.files[0])
//       });
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const formData = new FormData(e.target);
//     const { username, email, password } = Object.fromEntries(formData);

//     try {
//       // Create user in Firebase
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Save user to Azure Cosmos DB via backend API
//       const userData = {
//         uid: user.uid,
//         email: user.email,
//         displayName: username,
//         photoURL: avatar.url || '',
//         createdAt: new Date().toISOString()
//       };

//       await apiService.createUser(userData);
      
//       toast.success("Account created successfully!");
      
//     } catch (error) {
//       console.error("Registration error:", error);
//       toast.error(error.message || "Failed to create account");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const formData = new FormData(e.target);
//     const { email, password } = Object.fromEntries(formData);

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Check if user exists in Cosmos DB, if not create them
//       try {
//         await apiService.getUserByUid(user.uid);
//       } catch (error) {
//         if (error.message.includes('User not found')) {
//           // User doesn't exist in Cosmos DB, create them
//           const userData = {
//             uid: user.uid,
//             email: user.email,
//             displayName: user.displayName || '',
//             photoURL: user.photoURL || '',
//             createdAt: new Date().toISOString()
//           };
//           await apiService.createUser(userData);
//         }
//       }

//       toast.success("Logged in successfully!");
      
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error(error.message || "Failed to login");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login">
//       <div className="item">
//         <h2>Welcome back,</h2>
//         <form onSubmit={handleLogin}>
//           <input type="text" placeholder="Email" name="email" required />
//           <input type="password" placeholder="Password" name="password" required />
//           <button disabled={loading} type="submit">
//             {loading ? "Signing In..." : "Sign In"}
//           </button>
//         </form>
//       </div>
//       <div className="separator"></div>
//       <div className="item">
//         <h2>Create an Account</h2>
//         <form onSubmit={handleRegister}>
//           <label htmlFor="file">
//             <img src={avatar.url || "./avatar.png"} alt="" />
//             Upload an image
//           </label>
//           <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
//           <input type="text" placeholder="Username" name="username" required />
//           <input type="text" placeholder="Email" name="email" required />
//           <input type="password" placeholder="Password" name="password" required />
//           <button disabled={loading} type="submit">
//             {loading ? "Creating Account..." : "Sign Up"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;
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
  const [loading, setLoading] = useState(false);

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
    
    // Prevent multiple submissions
    if (loading) return;
    
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const { username, email, password } = Object.fromEntries(formData);

      // Basic validation
      if (!username || !email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      console.log('Starting registration process...');

      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Firebase user created:', user.uid);

      // Save user to Azure Cosmos DB via backend API
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: username,
        photoURL: avatar.url || '',
        createdAt: new Date().toISOString(),
        blocked: []
      };

      console.log('Creating user in Azure DB...');
      const result = await apiService.createUser(userData);
      
      if (result.success) {
        console.log('User created successfully in Azure DB');
        toast.success("Account created successfully!");
        
        // Reset form
        e.target.reset();
        setAvatar({ file: null, url: "" });
      } else {
        console.error('Failed to create user in Azure DB:', result.error);
        toast.error("Account created but failed to sync. Please try logging in.");
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      
      // More specific error handling
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
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);

      // Basic validation
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      console.log('Starting login process...');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Firebase login successful:', user.uid);

      // The user context will handle the Azure DB sync through handleUserAuthentication
      // So we don't need to manually check/create user here
      
      toast.success("Logged in successfully!");
      
      // Reset form
      e.target.reset();
      
    } catch (error) {
      console.error("Login error:", error);
      
      // More specific error handling
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
      setLoading(false);
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
            disabled={loading}
            autoComplete="email"
          />
          <input 
            type="password" 
            placeholder="Password" 
            name="password" 
            required 
            disabled={loading}
            autoComplete="current-password"
          />
          <button disabled={loading} type="submit">
            {loading ? "Signing In..." : "Sign In"}
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
            disabled={loading}
          />
          <input 
            type="text" 
            placeholder="Username" 
            name="username" 
            required 
            disabled={loading}
            autoComplete="username"
          />
          <input 
            type="email" 
            placeholder="Email" 
            name="email" 
            required 
            disabled={loading}
            autoComplete="email"
          />
          <input 
            type="password" 
            placeholder="Password" 
            name="password" 
            required 
            disabled={loading}
            autoComplete="new-password"
            minLength="6"
          />
          <button disabled={loading} type="submit">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;