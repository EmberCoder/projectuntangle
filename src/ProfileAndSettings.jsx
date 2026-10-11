import { deleteUser, updateProfile } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar.jsx';
import ProfileButton from './components/ProfileButton.jsx';
import { auth, clearOnboardingStatus, db, getProfilePhotoUrl, saveProfileDisplayName, saveProfilePhoto } from './firebase';
import './ProfileAndSettings.css';

const defaultProfileImage =
  'https://i.pinimg.com/236x/5a/bd/98/5abd985735a8fd4adcb0e795de6a1005.jpg?nii=t';

const avatarOptions = [
  { label: 'Peach', tint: '#f7d5b8', figure: '#865144' },
  { label: 'Mint', tint: '#cfe8d7', figure: '#35604b' },
  { label: 'Lavender', tint: '#d9d1f3', figure: '#5d4c79' },
  { label: 'Sky', tint: '#cfe7f9', figure: '#365c78' },
  { label: 'Sunset', tint: '#f8d6d6', figure: '#874851' },
];

const buildTintedGuestDefaultImage = (tint, figure) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" rx="150" fill="${tint}"/>
    <circle cx="150" cy="150" r="116" fill="#fffaf4" fill-opacity="0.32"/>
    <circle cx="150" cy="108" r="39" fill="${figure}"/>
    <path d="M67 244c7-45 39-75 83-75s76 30 83 75c-23 20-52 31-83 31s-60-11-83-31z" fill="${figure}"/>
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

const preparePhotoForCloud = (photoUrl) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const maxDimension = 256;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Image compression is unavailable on this device.'));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/jpeg', 0.75));
  };
  image.onerror = reject;
  image.src = photoUrl;
});

const ProfileAndSettings = () => {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(defaultProfileImage);
  const [isPhotoLoading, setIsPhotoLoading] = useState(true);
  const [displayName, setDisplayName] = useState('Your Name');
  const [nameInput, setNameInput] = useState('Your Name');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const updateProfileData = async (user = auth.currentUser) => {
      const savedPhoto = localStorage.getItem('profilePhotoUrl');
      const hasPendingPhoto = user &&
        localStorage.getItem(`profilePhotoPendingSync:${user.uid}`) === 'true';
      const nextDisplayName = user?.displayName || 'Your Name';
      const originalPhoto = getOriginalPhotoUrl(user);
      setDisplayName(nextDisplayName);
      setNameInput(nextDisplayName);

      if (!user) {
        setPhotoUrl(savedPhoto || originalPhoto || defaultProfileImage);
        setIsPhotoLoading(false);
        return;
      }

      if (hasPendingPhoto && savedPhoto) {
        setPhotoUrl(savedPhoto);
        setIsPhotoLoading(false);
        return;
      }

      setIsPhotoLoading(true);
      try {
        const cloudPhotoUrl = await getProfilePhotoUrl(user);
        if (auth.currentUser?.uid === user.uid) {
          setPhotoUrl(cloudPhotoUrl || savedPhoto || user.photoURL || originalPhoto || defaultProfileImage);
        }
      } catch {
        if (auth.currentUser?.uid === user.uid) {
          setPhotoUrl(savedPhoto || user.photoURL || originalPhoto || defaultProfileImage);
        }
      } finally {
        if (auth.currentUser?.uid === user.uid) setIsPhotoLoading(false);
      }
    };

    if (auth.currentUser) updateProfileData(auth.currentUser);
    const unsubscribe = auth.onAuthStateChanged(updateProfileData);

    return () => unsubscribe();
  }, []);

  const handlePhotoSelection = async (nextPhotoUrl) => {
    const user = auth.currentUser;
    setPhotoError('');
    setPhotoUrl(nextPhotoUrl);
    setIsPaletteOpen(false);

    try {
      const photoToSave = nextPhotoUrl.startsWith('data:')
        ? await preparePhotoForCloud(nextPhotoUrl)
        : nextPhotoUrl;
      setPhotoUrl(photoToSave);
      localStorage.setItem('profilePhotoUrl', photoToSave);

      if (!user) return;

      const pendingSyncKey = `profilePhotoPendingSync:${user.uid}`;
      localStorage.setItem(pendingSyncKey, 'true');
      const savedPhotoUrl = await saveProfilePhoto(user, photoToSave);
      localStorage.removeItem(pendingSyncKey);
      setPhotoUrl(savedPhotoUrl);
      window.dispatchEvent(new Event('profilePhotoUpdated'));
    } catch {
      if (user) {
        localStorage.setItem(`profilePhotoPendingSync:${user.uid}`, 'true');
      }
      setPhotoError("We couldn't sync your photo right now. It's still saved on this device. Please try again later.");
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

    setPhotoError('');
    setPhotoUrl(originalPhoto);
    setIsPaletteOpen(false);

    if (user) {
      const pendingSyncKey = `profilePhotoPendingSync:${user.uid}`;
      try {
        localStorage.setItem('profilePhotoUrl', originalPhoto);
        localStorage.setItem(pendingSyncKey, 'true');
        await saveProfilePhoto(user, originalPhoto);
        await updateProfile(user, { photoURL: originalPhoto });
        await user.reload();
        localStorage.removeItem(pendingSyncKey);
        window.dispatchEvent(new Event('profilePhotoUpdated'));
      } catch {
        setPhotoError("We couldn't sync your original photo right now. It's still showing on this device. Please try again later.");
      }
    } else {
      localStorage.removeItem('profilePhotoUrl');
    }
  };

  const handleSaveName = async () => {
    const nextName = await saveProfileDisplayName(auth.currentUser, nameInput);
    setDisplayName(nextName);
    setNameInput(nextName);
    setIsEditingName(false);
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete your account and its data?')) return;

    setIsDeletingAccount(true);
    setDeleteError('');

    const profileRef = doc(db, 'users', user.uid);
    const journalRef = collection(db, 'users', user.uid, 'journalEntries');
    let profileData = null;
    let journalEntries = [];

    try {
      const [profileSnapshot, journalSnapshot] = await Promise.all([
        getDoc(profileRef),
        getDocs(journalRef),
      ]);
      profileData = profileSnapshot.exists() ? profileSnapshot.data() : null;
      journalEntries = journalSnapshot.docs.map((entry) => ({ id: entry.id, data: entry.data() }));

      try {
        await Promise.all([
          deleteDoc(profileRef),
          ...journalEntries.map(({ id }) => deleteDoc(doc(journalRef, id))),
        ]);
        await deleteUser(user);
      } catch (error) {
        await Promise.allSettled([
          ...(profileData ? [setDoc(profileRef, profileData)] : []),
          ...journalEntries.map(({ id, data }) => setDoc(doc(journalRef, id), data)),
        ]);
        throw error;
      }

      try {
        const linkedGoogleEmail = localStorage.getItem('projectUntangle.googleCalendarLinkedEmail');
        const emailsToClear = new Set([user.email, linkedGoogleEmail].filter(Boolean));
        const localDataKeys = [
          'guestMode',
          'profilePhotoUrl',
          'profileDisplayName',
          `profilePhotoPendingSync:${user.uid}`,
          'projectUntangle.stressLogs',
          'projectUntangle.appCalendarEvents',
          'projectUntangle.calendarEvents',
          'projectUntangle.googleCalendarLinkedEmail',
        ];

        emailsToClear.forEach((email) => {
          localDataKeys.push(`projectUntangle.googleCalendarEvents.${encodeURIComponent(email.trim().toLowerCase())}`);
        });
        localDataKeys.forEach((key) => localStorage.removeItem(key));
      } catch (cleanupError) {
        console.warn('Could not clear all local account caches:', cleanupError);
      }

      clearOnboardingStatus(user.email);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError('For security, please sign in again, then retry deleting your account.');
      } else {
        setDeleteError(error.message || 'We could not delete your account. Please try again.');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="profile-settings-page">
      <h1 className="profile-settings-title pageTitle">Profile and Settings</h1>
      <ProfileButton />

      <div className="profileContent">
        <div className="profileImageWrapper" onClick={() => setIsPaletteOpen((prev) => !prev)}>
          <img
            src={photoUrl}
            alt="Profile"
            className={`profileImage${isPhotoLoading ? ' is-loading' : ''}`}
          />
          <div className="changeOverlay">Change</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profileImageInput"
            onChange={handleImageUpload}
          />
        </div>
        {photoError && <p className="profilePhotoError" role="alert">{photoError}</p>}

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
            <div className="profileColorOptions" role="group" aria-label="Profile colors">
              {avatarOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className="profileColorOption"
                  aria-label={`Use ${option.label} profile color`}
                  title={option.label}
                  onClick={() => handlePhotoSelection(buildTintedGuestDefaultImage(option.tint, option.figure))}
                  style={{ background: option.tint }}
                />
              ))}
            </div>
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
      <section className="deleteAccountSection" aria-labelledby="delete-account-title">
            <h2 className="deleteAccountTitle">Delete Account</h2>
            <p className="deleteAccountWarning">
              This permanently deletes your account, profile, and journal entries.
            </p>
            {deleteError && <p className="deleteAccountError" role="alert">{deleteError}</p>}
            <button
              type="button"
              className="deleteAccountButton"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? 'Deleting…' : 'Delete Account'}
            </button>
      </section>
      

      <NavBar />
    </div>
  );
};

export default ProfileAndSettings;
