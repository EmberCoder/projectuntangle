
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './ProfileButton.css';

const defaultProfileImage =
  'https://i.pinimg.com/236x/5a/bd/98/5abd985735a8fd4adcb0e795de6a1005.jpg?nii=t';

const ProfileButton = () => {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(defaultProfileImage);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(auth.currentUser));

  useEffect(() => {
    const updateAuthState = (user) => {
      const nextLoggedIn = Boolean(user);
      setIsLoggedIn(nextLoggedIn);

      if (!nextLoggedIn) {
        setPhotoUrl(defaultProfileImage);
        return;
      }

      const isGoogleUser = user.providerData?.some(
        (provider) => provider.providerId === 'google.com'
      );

      setPhotoUrl(isGoogleUser && user.photoURL ? user.photoURL : defaultProfileImage);
    };

    updateAuthState(auth.currentUser);
    const unsubscribe = auth.onAuthStateChanged(updateAuthState);

    return () => unsubscribe();
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
        className="profile-button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img src={photoUrl} alt="Profile" />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <button type="button" className="profile-dropdown-button">
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
