
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getProfilePhotoUrl } from '../firebase';
import './ProfileButton.css';

const defaultProfileImage =
  'https://i.pinimg.com/236x/5a/bd/98/5abd985735a8fd4adcb0e795de6a1005.jpg?nii=t';

const ProfileButton = () => {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(defaultProfileImage);
  const [isPhotoLoading, setIsPhotoLoading] = useState(Boolean(auth.currentUser));
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(auth.currentUser));

  useEffect(() => {
    const updateAuthState = async (user) => {
      const nextLoggedIn = Boolean(user);
      setIsLoggedIn(nextLoggedIn);

      if (!nextLoggedIn) {
        setPhotoUrl(defaultProfileImage);
        setIsPhotoLoading(false);
        return;
      }

      const storedPhotoUrl = localStorage.getItem('profilePhotoUrl');
      const hasPendingPhoto = localStorage.getItem(`profilePhotoPendingSync:${user.uid}`) === 'true';
      if (hasPendingPhoto && storedPhotoUrl) {
        setPhotoUrl(storedPhotoUrl);
        setIsPhotoLoading(false);
        return;
      }

      setIsPhotoLoading(true);
      try {
        const cloudPhotoUrl = await getProfilePhotoUrl(user);
        if (auth.currentUser?.uid === user.uid) {
          setPhotoUrl(cloudPhotoUrl || storedPhotoUrl || user.photoURL || defaultProfileImage);
        }
      } catch (error) {
        console.error('Failed to load profile photo:', error);
        if (auth.currentUser?.uid === user.uid) {
          setPhotoUrl(storedPhotoUrl || user.photoURL || defaultProfileImage);
        }
      } finally {
        if (auth.currentUser?.uid === user.uid) setIsPhotoLoading(false);
      }
    };

    const handleProfilePhotoUpdated = () => {
      updateAuthState(auth.currentUser);
    };

    updateAuthState(auth.currentUser);
    const unsubscribe = auth.onAuthStateChanged(updateAuthState);
    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('guestMode');
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="profile-menu-wrapper">
      <button
        type="button"
        aria-label="Profile"
        className={`profile-button${isPhotoLoading ? ' is-loading' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img src={photoUrl} alt="Profile" />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <button type="button" className="profile-dropdown-button" onClick={() => navigate('/ProfileAndSettings')}>
            Profile & Settings
          </button>
          <button type="button" className="profile-logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
