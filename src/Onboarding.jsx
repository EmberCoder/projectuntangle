import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import './components/Login/Login.css';
import { auth, setOnboardingStatus } from './firebase';

const goalOptions = [
  'Daily Productivity',
  'Stress & Anxiety Relief',
  'Grounding',
];

const Onboarding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [name, setName] = useState(location.state?.username || '');
  const [goal, setGoal] = useState(goalOptions[0]);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState('');

  const totalPages = 3;
  const pendingEmail = location.state?.email || '';
  const pendingPassword = location.state?.password || '';

  const validateCurrentStep = () => {
    if (currentPage === 0 && !name.trim()) {
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

  const handleNext = () => {
    if (!validateCurrentStep()) return;
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
    if (!validateCurrentStep()) return;

    const trimmedName = name.trim();

    try {
      setError('');

      const finalEmail = pendingEmail || location.state?.email || auth.currentUser?.email || '';

      if (pendingEmail && pendingPassword) {
        const result = await createUserWithEmailAndPassword(auth, pendingEmail, pendingPassword);
        await updateProfile(result.user, { displayName: trimmedName });
      }

      if (finalEmail) {
        setOnboardingStatus(finalEmail, 'complete');
      }

      navigate('/home', { state: { username: trimmedName || 'User' } });
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

      {currentPage === 1 && (
        <div className="onboarding-panel">
          <h2 className="nameQuestion">What do you want to use the app for?</h2>
          <div className="goal-options">
            {goalOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`goal-option ${goal === option ? 'selected' : ''}`}
                onClick={() => setGoal(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentPage === 2 && (
        <div className="onboarding-panel">
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
            <h3>Privacy Policy</h3>
            <p>Privacy policy goes here</p>
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
