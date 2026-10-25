import { createUserWithEmailAndPassword, deleteUser, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import './components/Login/Login.css';
import PrivacyPolicy from './components/PrivacyPolicy';
import { auth, authPersistenceReady, db, setOnboardingStatus } from './firebase';

const Onboarding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [birthMonth, setBirthMonth] = useState(location.state?.birthMonth || '');
  const [birthYear, setBirthYear] = useState(location.state?.birthYear || '');
  const [name, setName] = useState(location.state?.username || '');
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState('');

  const totalPages = 3;
  const pendingEmail = location.state?.email || '';
  const pendingPassword = location.state?.password || '';

  const validateCurrentStep = async () => {
    if (!birthMonth || !birthYear) {
      setError('Please enter your birth month and year to continue.');
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - Number(birthYear) - (
      today.getMonth() + 1 < Number(birthMonth) ? 1 : 0
    );

    if (age < 13) {
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch (deleteError) {
          console.error('Could not remove underage Google account:', deleteError);
          setError('We could not complete account setup. Please contact support.');
          return false;
        }
      }

      setError('We can’t create an account with the information provided.');
      return false;
    }

    if (currentPage === 1 && !name.trim()) {
      setError('Please enter your name before continuing.');
      return false;
    }

    if (currentPage === 2 && !agreePrivacy) {
      setError('Please agree to the privacy policy before continuing.');
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = async () => {
    if (!await validateCurrentStep()) return;
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    setError('');
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!await validateCurrentStep()) return;

    const trimmedName = name.trim();

    try {
      setError('');

      const finalEmail = pendingEmail || location.state?.email || auth.currentUser?.email || '';

      if (pendingEmail && pendingPassword) {
        await authPersistenceReady;
        const result = await createUserWithEmailAndPassword(auth, pendingEmail, pendingPassword);
        await updateProfile(result.user, { displayName: trimmedName });
      }

      if (auth.currentUser) {
        localStorage.removeItem('guestMode');
        await updateProfile(auth.currentUser, { displayName: trimmedName });
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          email: finalEmail,
          displayName: trimmedName,
        }, { merge: true });
      }

      if (finalEmail) {
        setOnboardingStatus(finalEmail, 'complete');
      }

      navigate('/home');
    } catch (error) {
      const errorCode = error?.code || '';

      if (errorCode === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(error.message || 'Something went wrong while finishing signup.');
      }
    }
  };

  const handlePrimaryAction = async () => {
    if (currentPage === totalPages - 1) {
      await handleFinishOnboarding();
      return;
    }

    handleNext();
  };

  return (
    <div className="onboarding-page">
      <BackButton />
      <h1>Welcome</h1>

      {currentPage === 0 && (
        <div className="onboarding-panel">
          <h2 className="nameQuestion">When were you born?</h2>
          <div className="birthDateFields">
            <label>
              <span>Birth month</span>
              <select value={birthMonth} onChange={(event) => setBirthMonth(event.target.value)}>
                <option value="">Select month</option>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={String(index + 1)}>
                    {new Date(2000, index).toLocaleString('en', { month: 'long' })}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Birth year</span>
              <select value={birthYear} onChange={(event) => setBirthYear(event.target.value)}>
                <option value="">Select year</option>
                {Array.from({ length: 121 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                  <option key={year} value={String(year)}>{year}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {currentPage === 1 && (
        <div className="onboarding-panel">
          <h2 className="nameQuestion">What should we call you?</h2>
          <input
            type="text"
            placeholder="Enter your name"
            className="nameInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      {currentPage === 2 && (
        <div className="onboarding-panel privacy-onboarding-panel">
          <h2 className="nameQuestion">Notifications & privacy</h2>

          <div className="toggle-row">
            <span>Allow notifications</span>
            <button
              type="button"
              className={`toggle ${allowNotifications ? 'on' : ''}`}
              onClick={() => setAllowNotifications((prev) => !prev)}
              aria-label="Toggle notifications"
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          <div className="privacy-box">
            <h3 className="privacy-box-title">Privacy Policy</h3>
            <PrivacyPolicy />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
            />
            <span>I agree to the privacy policy.</span>
          </label>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="onboarding-footer">
        <button
          type="button"
          className={`secondary-btn ${currentPage === 0 ? 'secondary-btn--hidden' : ''}`}
          onClick={handlePrev}
          disabled={currentPage === 0}
        >
          Back
        </button>

        <div className="dots-container">
          {[...Array(totalPages)].map((_, index) => (
            <span
              key={index}
              className={`dot ${currentPage === index ? 'active' : ''}`}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>

        <button type="button" className="primary-btn" onClick={handlePrimaryAction}>
          {currentPage === totalPages - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
