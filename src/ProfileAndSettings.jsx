import { updateProfile } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import NavBar from './components/NavBar/NavBar.jsx';
import ProfileButton from './components/ProfileButton.jsx';
import { auth, saveProfileDisplayName } from './firebase';
import './ProfileAndSettings.css';

const defaultProfileImage =
  'https://i.pinimg.com/236x/5a/bd/98/5abd985735a8fd4adcb0e795de6a1005.jpg?nii=t';

const avatarOptions = [
  { label: 'Peach', tint: '#f7d5b8' },
  { label: 'Mint', tint: '#cfe8d7' },
  { label: 'Lavender', tint: '#d9d1f3' },
  { label: 'Sky', tint: '#cfe7f9' },
  { label: 'Sunset', tint: '#f8d6d6' },
];

const buildTintedGuestDefaultImage = (tint) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <filter id="soften"><feGaussianBlur stdDeviation="0.4"/></filter>
    </defs>
    <rect width="300" height="300" rx="150" fill="${tint}"/>
    <circle cx="150" cy="112" r="46" fill="rgba(255,255,255,0.6)"/>
    <path d="M76 236c16-38 49-57 74-57s58 19 74 57" fill="rgba(255,255,255,0.58)"/>
    <ellipse cx="108" cy="108" rx="8" ry="12" fill="rgba(0,0,0,0.18)" filter="url(#soften)"/>
    <ellipse cx="192" cy="108" rx="8" ry="12" fill="rgba(0,0,0,0.18)" filter="url(#soften)"/>
  </svg>
`)}`;

const getOriginalPhotoUrl = (user) => {
  if (!user) return defaultProfileImage;

  const googleProvider = user.providerData?.find(
    (provider) => provider.providerId === 'google.com'
  );

  if (googleProvider?.photoURL) {
    return googleProvider.photoURL;
  }

  return user.photoURL || defaultProfileImage;
};

const ProfileAndSettings = () => {
  const [photoUrl, setPhotoUrl] = useState(defaultProfileImage);
  const [displayName, setDisplayName] = useState('Your Name');
  const [nameInput, setNameInput] = useState('Your Name');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const updateProfileData = () => {
      const user = auth.currentUser;
      const savedPhoto = localStorage.getItem('profilePhotoUrl');
      const nextDisplayName = user?.displayName || 'Your Name';
      const originalPhoto = getOriginalPhotoUrl(user);
      const nextPhotoUrl = savedPhoto || originalPhoto || defaultProfileImage;
      setPhotoUrl(nextPhotoUrl);
      setDisplayName(nextDisplayName);
      setNameInput(nextDisplayName);
    };

    updateProfileData();
    const unsubscribe = auth.onAuthStateChanged(updateProfileData);

    return () => unsubscribe();
  }, []);

  const handlePhotoSelection = async (nextPhotoUrl) => {
    const user = auth.currentUser;
    setPhotoUrl(nextPhotoUrl);
    localStorage.setItem('profilePhotoUrl', nextPhotoUrl);
    setIsPaletteOpen(false);

    if (user) {
      await updateProfile(user, { photoURL: nextPhotoUrl });
      await user.reload();
      window.dispatchEvent(new Event('profilePhotoUpdated'));
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : defaultProfileImage;
      await handlePhotoSelection(result);
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreOriginalPhoto = async () => {
    const user = auth.currentUser;
    const originalPhoto = getOriginalPhotoUrl(user);

    localStorage.removeItem('profilePhotoUrl');
    setPhotoUrl(originalPhoto);
    setIsPaletteOpen(false);

    if (user) {
      await updateProfile(user, { photoURL: originalPhoto });
      await user.reload();
      window.dispatchEvent(new Event('profilePhotoUpdated'));
    }
  };

  const handleSaveName = async () => {
    const nextName = await saveProfileDisplayName(auth.currentUser, nameInput);
    setDisplayName(nextName);
    setNameInput(nextName);
    setIsEditingName(false);
  };

  return (
    <div className="profile-settings-page">
      <h1 className="profile-settings-title">Profile and Settings</h1>
      <ProfileButton />

      <div className="profileContent">
        <div className="profileImageWrapper" onClick={() => setIsPaletteOpen((prev) => !prev)}>
          <img src={photoUrl} alt="Profile" className="profileImage" />
          <div className="changeOverlay">Change</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profileImageInput"
            onChange={handleImageUpload}
          />
        </div>

        {isPaletteOpen && (
          <div className="profileImageOptions" role="menu" aria-label="Profile photo options">
            <button
              type="button"
              className="profileUploadButton"
              onClick={() => {
                fileInputRef.current?.click();
                setIsPaletteOpen(false);
              }}
            >
              Upload image
            </button>
            {avatarOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                className="profileColorOption"
                aria-label={`Use ${option.label} profile color`}
                title={option.label}
                onClick={() => handlePhotoSelection(buildTintedGuestDefaultImage(option.tint))}
                style={{ background: option.tint }}
              />
            ))}
            <button
              type="button"
              className="profileResetButton"
              onClick={handleRestoreOriginalPhoto}
            >
              Original
            </button>
            <button
              type="button"
              className="profileCloseButton"
              onClick={() => setIsPaletteOpen(false)}
            >
              Close
            </button>
          </div>
        )}

        {isEditingName ? (
          <div className="profileNameEditor">
            <input
              type="text"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSaveName();
                }
              }}
              className="profileNameInput"
              maxLength={40}
            />
            <button type="button" className="saveNameButton" onClick={handleSaveName}>Save</button>
            <button
              type="button"
              className="cancelNameButton"
              onClick={() => {
                setNameInput(displayName);
                setIsEditingName(false);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="profileNameRow">
            <span className="profileDisplayName">
              {displayName} <button type="button" className="editNameButton" aria-label="Edit name" onClick={() => setIsEditingName(true)}><span aria-hidden="true">✎</span></button>
            </span>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  );
};

export default ProfileAndSettings;
