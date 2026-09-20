import { signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getOnboardingStatus, googleProvider, setOnboardingStatus } from '../../firebase';
import './Login.css';

const GoogleLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const firstName = user.displayName ? user.displayName.split(' ')[0] : '';
      const userEmail = user.email?.trim().toLowerCase();
      const isFirstGoogleSignIn = Boolean(result?._tokenResponse?.isNewUser) || user.metadata.creationTime === user.metadata.lastSignInTime;
      const username = firstName || userEmail?.split('@')[0] || 'User';
      const onboardingStatus = userEmail ? getOnboardingStatus(userEmail) : 'complete';

      if (isFirstGoogleSignIn || onboardingStatus !== 'complete') {
        setOnboardingStatus(userEmail, 'incomplete');
        navigate('/Onboarding', { state: { username, email: userEmail } });
        return;
      }

      navigate('/home', { state: { username } });
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  return (
    <div className="googleLoginWrapper">
      <button onClick={handleGoogleSignIn} className="googleLoginButton">
        Sign in with Google
      </button>
      {error && <p className="errorMessage">{error}</p>}
    </div>
  );
};

export default GoogleLogin;