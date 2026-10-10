import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import EmailLogin from './components/Login/EmailLogin';
import GoogleLogin from './components/Login/GoogleLogin';
import { auth, setOnboardingStatus } from './firebase';

const LogInputs = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      if (isSignUp) {
        setOnboardingStatus(trimmedEmail, 'incomplete');
        navigate('/Onboarding', {
          state: {
            email: trimmedEmail,
            password: trimmedPassword,
          },
        });
        return;
      }

      await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      localStorage.removeItem('guestMode');
      navigate('/home');
    } catch (error) {
      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';

      if (!isSignUp && (
        errorCode === 'auth/invalid-credential' ||
        errorCode === 'auth/user-not-found' ||
        errorCode === 'auth/wrong-password' ||
        errorMessage.includes('auth/invalid-credential') ||
        errorMessage.includes('auth/user-not-found') ||
        errorMessage.includes('auth/wrong-password')
      )) {
        setError('Invalid username or password');
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div>
      <BackButton />
      <h1>Welcome back!</h1>
      
      <GoogleLogin />
      <EmailLogin 
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        handleEmailAuth={handleEmailAuth}
        isSignUp={isSignUp}
        error={error}
      />
    </div>
  );
};

export default LogInputs;
