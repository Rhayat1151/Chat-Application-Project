import React, { useEffect } from 'react'
import { useUserStore } from '../../../lib/useStore'
import './userinfo.css'

const Userinfo = () => {
  const { currentUser, isLoading } = useUserStore()

  useEffect(() => {
    console.log('=== USERSTORE DEBUG ===');
    console.log('useUserStore result:', { currentUser, isLoading });
    console.log('currentUser object:', currentUser);
    console.log('currentUser.photoURL:', currentUser?.photoURL);
    console.log('Is currentUser null/undefined?', currentUser == null);
  }, [currentUser, isLoading]);

  useEffect(() => {
    if (currentUser?.photoURL) {
      const testCORS = async () => {
        try {
          console.log('Testing CORS for URL:', currentUser.photoURL);
          const response = await fetch(currentUser.photoURL, { method: 'GET', mode: 'cors' });
          console.log('✅ CORS test successful:', response.status);
        } catch (error) {
          console.error('❌ CORS test failed:', error);
        }
      };
      testCORS();
    }
  }, [currentUser?.photoURL]);

  if (isLoading) {
    return (
      <div className='userinfo'>
        <div className='user'>
          <div className='loading-avatar'></div>
          <h2>Loading...</h2>
        </div>
        <div className='icons'>
          <img src="more.png" alt="" />
          <img src="edit.png" alt="" />
          <img src="video.png" alt="" />
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className='userinfo'>
        <div className='user'>
          <img src="avatar.png" alt="Default Avatar" />
          <h2>Guest User</h2>
        </div>
        <div className='icons'>
          <img src="more.png" alt="" />
          <img src="edit.png" alt="" />
          <img src="video.png" alt="" />
        </div>
      </div>
    )
  }

  const displayName = currentUser.displayName ||
    currentUser.email?.split('@')[0] ||
    'User'

  const getProfileImage = () => {
    if (!currentUser?.photoURL) return './avatar.png';
    try {
      new URL(currentUser.photoURL);
      return currentUser.photoURL;
    } catch {
      return './avatar.png';
    }
  };

  const handleImageError = (e) => {
    if (!e.target.src.includes('avatar.png')) {
      e.target.src = './avatar.png';
    }
  }

  return (
    <div className='userinfo'>
      <div className='user'>
        <img
          src={getProfileImage()}
          alt={`${displayName}'s profile`}
          onError={handleImageError}
          className='profile-image'
        />
        <h2>{displayName}</h2>
        {currentUser.isOnline && <span className='online-indicator'></span>}
      </div>
      <div className='icons'>
        <img src="more.png" alt="More options" />
        <img src="edit.png" alt="Edit profile" />
        <img src="video.png" alt="Video call" />
      </div>
    </div>
  )
}

export default Userinfo
