// components/login/Login.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import './login.css';
import { auth } from '../../lib/firebase';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';
import { useUserStore } from '../../lib/useStore';

const Login = () => {
  // Move the hook call INSIDE the component
  const { setCurrentUser } = useUserStore();
  
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      setAvatar({
        file: file,
        url: URL.createObjectURL(file)
      });
      
      console.log('📸 Image selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerLoading) return;
    setRegisterLoading(true);
  
    try {
      const formData = new FormData(e.target);
      const { username, email, password } = Object.fromEntries(formData);

      console.log('🚀 Starting registration process...');
      
      // Validate inputs
      if (!username.trim()) {
        toast.error("Username is required");
        return;
      }
      if (!email.trim()) {
        toast.error("Email is required");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
  
      // 1. Create Firebase user
      console.log('🔐 Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase user created:', user.uid);
  
      // 2. Use the combined registration method
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: username.trim(),
        photoURL: '', // Will be set by the upload if file exists
        createdAt: new Date().toISOString()
      };

      console.log('👤 Registering with backend...');
      const registerResponse = await apiService.registerUserWithImageAndChat(userData, avatar.file);
  
      // 3. Update currentUser state with the complete response
      if (registerResponse && registerResponse.user) {
        console.log('🔥 Full registration response:', registerResponse);
        setCurrentUser(registerResponse.user);
        toast.success("Account created successfully!");
        
        // Reset form and avatar
        e.target.reset();
        setAvatar({ file: null, url: "" });
      } else {
        console.error('❌ Invalid registration response:', registerResponse);
        toast.error("Registration completed but response was invalid");
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Provide specific error messages
      if (error.code === 'auth/email-already-in-use') {
        toast.error("An account with this email already exists. Please use a different email or try logging in.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address. Please check your email.");
      } else if (error.message.includes('Network')) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
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

      console.log('🔐 Logging in user...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('✅ Login successful:', user.uid);
      toast.success("Welcome back! 👋");
      e.target.reset();
    } catch (error) {
      console.error('❌ Login error:', error);
      
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
          <label htmlFor="file" className={registerLoading ? 'disabled' : ''}>
            <img src={avatar.url || "./avatar.png"} alt="Avatar preview" />
            <span className="upload-text">
              {avatar.file ? `✅ ${avatar.file.name}` : "📸 Upload Profile Image"}
            </span>
            {avatar.file && (
              <small className="file-info">
                Size: {(avatar.file.size / 1024 / 1024).toFixed(2)}MB
              </small>
            )}
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
            {registerLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
          {registerLoading && (
            <div className="registration-status">
              <small>🔄 Setting up your account and uploading profile image...</small>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;

// components/login/Login.jsx
// components/login/Login.jsx
// import { useState } from 'react';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// import './login.css';
// import { auth } from '../../lib/firebase';
// import { apiService } from '../../lib/api';
// import { toast } from 'react-toastify';
// import { useUserStore } from '../../lib/useStore';

// const Login = () => {
//   const { setCurrentUser, fetchUserInfo } = useUserStore();

//   const [avatar, setAvatar] = useState({ file: null, url: "" });
//   const [loginLoading, setLoginLoading] = useState(false);
//   const [registerLoading, setRegisterLoading] = useState(false);

//   const handleAvatar = (e) => {
//     if (e.target.files[0]) {
//       const file = e.target.files[0];

//       if (!file.type.startsWith('image/')) {
//         toast.error("Please select an image file");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("Image size should be less than 5MB");
//         return;
//       }

//       setAvatar({ file: file, url: URL.createObjectURL(file) });
//       console.log('📸 Image selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (registerLoading) return;
//     setRegisterLoading(true);

//     try {
//       const formData = new FormData(e.target);
//       const { username, email, password } = Object.fromEntries(formData);

//       if (!username.trim()) {
//         toast.error("Username is required");
//         return;
//       }
//       if (!email.trim()) {
//         toast.error("Email is required");
//         return;
//       }
//       if (password.length < 6) {
//         toast.error("Password must be at least 6 characters");
//         return;
//       }

//       if (!avatar.file) {
//         toast.error("Please upload a profile image");
//         return;
//       }

//       console.log('🔐 Creating Firebase user...');
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
//       console.log('✅ Firebase user created:', user.uid);

//       const userData = {
//         uid: user.uid,
//         email: user.email,
//         displayName: username.trim(),
//         photoURL: '',
//         createdAt: new Date().toISOString()
//       };

//       console.log('👤 Registering with backend...');
//       const registerResponse = await apiService.registerUserWithImageAndChat(userData, avatar.file);

//       // ✅ FIXED: Remove duplicate code and only set user once
//       if (registerResponse && registerResponse.user) {
//         console.log('🔥 Registration successful:', registerResponse);
//         setCurrentUser(registerResponse.user); // Set user in context once
//         toast.success("Account created successfully!");
        
//         // Reset form and avatar
//         e.target.reset();
//         setAvatar({ file: null, url: "" });
//       } else {
//         console.error('❌ Invalid registration response:', registerResponse);
//         toast.error("Registration completed but response was invalid");
//       }
//     } catch (error) {
//       console.error('❌ Registration error:', error);
//       if (error.code === 'auth/email-already-in-use') {
//         toast.error("An account with this email already exists.");
//       } else if (error.code === 'auth/weak-password') {
//         toast.error("Password is too weak.");
//       } else if (error.code === 'auth/invalid-email') {
//         toast.error("Invalid email address.");
//       } else if (error.message.includes('Network')) {
//         toast.error("Network error. Please try again.");
//       } else {
//         toast.error(error.message || "Registration failed. Please try again.");
//       }
//     } finally {
//       setRegisterLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (loginLoading) return;
//     setLoginLoading(true);

//     try {
//       const formData = new FormData(e.target);
//       const { email, password } = Object.fromEntries(formData);

//       if (!email || !password) {
//         toast.error("Please fill in all fields");
//         setLoginLoading(false);
//         return;
//       }

//       console.log('🔐 Logging in user...');
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
//       console.log('✅ Login successful:', user.uid);

//       await fetchUserInfo(user); // Ensures Firestore sync & currentUser update
//       toast.success("Welcome back! 👋");
//       e.target.reset();
//     } catch (error) {
//       console.error('❌ Login error:', error);
//       if (error.code === 'auth/user-not-found') {
//         toast.error("No account found with this email.");
//       } else if (error.code === 'auth/wrong-password') {
//         toast.error("Incorrect password.");
//       } else if (error.code === 'auth/invalid-email') {
//         toast.error("Invalid email address.");
//       } else if (error.code === 'auth/too-many-requests') {
//         toast.error("Too many failed attempts. Please wait.");
//       } else {
//         toast.error(error.message || "Failed to login. Please try again.");
//       }
//     } finally {
//       setLoginLoading(false);
//     }
//   };

//   return (
//     <div className="login">
//       <div className="item">
//         <h2>Welcome back,</h2>
//         <form onSubmit={handleLogin}>
//           <input type="email" placeholder="Email" name="email" required disabled={loginLoading} autoComplete="email" />
//           <input type="password" placeholder="Password" name="password" required disabled={loginLoading} autoComplete="current-password" />
//           <button disabled={loginLoading} type="submit">
//             {loginLoading ? "Logging In..." : "Log In"}
//           </button>
//         </form>
//       </div>
//       <div className="separator"></div>
//       <div className="item">
//         <h2>Create an Account</h2>
//         <form onSubmit={handleRegister}>
//           <label htmlFor="file" className={registerLoading ? 'disabled' : ''}>
//             <img src={avatar.url || "./avatar.png"} alt="Avatar preview" />
//             <span className="upload-text">
//               {avatar.file ? `✅ ${avatar.file.name}` : "📸 Upload Profile Image"}
//             </span>
//             {avatar.file && (
//               <small className="file-info">
//                 Size: {(avatar.file.size / 1024 / 1024).toFixed(2)}MB
//               </small>
//             )}
//           </label>
//           <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} accept="image/*" disabled={registerLoading} />
//           <input type="text" placeholder="Username" name="username" required disabled={registerLoading} autoComplete="username" />
//           <input type="email" placeholder="Email" name="email" required disabled={registerLoading} autoComplete="email" />
//           <input type="password" placeholder="Password" name="password" required disabled={registerLoading} autoComplete="new-password" minLength="6" />
//           <button disabled={registerLoading} type="submit">
//             {registerLoading ? (
//               <>
//                 <span className="loading-spinner">⏳</span>
//                 Creating Account...
//               </>
//             ) : (
//               "Sign Up"
//             )}
//           </button>
//           {registerLoading && (
//             <div className="registration-status">
//               <small>🔄 Setting up your account and uploading profile image...</small>
//             </div>
//             )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;