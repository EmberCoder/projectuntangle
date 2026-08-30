import { getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase';
import './Login.css';

const GoogleLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          navigate('/home', { state: { username: result.user.displayName } });
        }
      })
      .catch((error) => {
        console.error(error.message);
        setError(error.message);
      });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        navigate('/home', { state: { username: user.displayName } });
      }
    } catch (error) {
  
    }
  };

  return (
    <div className="googleLoginWrapper">
      
      <button onClick={handleGoogleSignIn} className="googleLoginButton">
        Sign in with Google</button>

    </div>
  );
};

export default GoogleLogin;