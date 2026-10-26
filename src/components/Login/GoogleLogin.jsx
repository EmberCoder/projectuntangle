import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, authPersistenceReady, getOnboardingStatus, setOnboardingStatus } from '../../firebase';
import './Login.css';

const GoogleLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize for both web and mobile bridge fallback
    GoogleAuth.initialize({
      clientId: '192662279657-4cu85md3airv5ri5e74siq5ciu5vlltq.apps.googleusercontent.com',
      serverClientId: '192662279657-4cu85md3airv5ri5e74siq5ciu5vlltq.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await authPersistenceReady;

      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      const result = await signInWithCredential(auth, credential);

      localStorage.removeItem('guestMode');

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

      navigate('/home');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Failed to sign in with Google');
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