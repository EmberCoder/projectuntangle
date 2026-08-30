import { signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase';
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
      navigate('/home', { state: { username: firstName } });
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