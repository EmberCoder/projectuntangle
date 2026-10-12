import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import EmailLogin from './components/Login/EmailLogin';
import GoogleLogin from './components/Login/GoogleLogin';
import { auth, authPersistenceReady } from './firebase';
import { isValidEmailAddress } from './emailValidation';

const LogInputs = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showSignUpLink, setShowSignUpLink] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setShowSignUpLink(false);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!isValidEmailAddress(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    try {
      await authPersistenceReady;
      await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      localStorage.removeItem('guestMode');
      navigate('/home');
    } catch (error) {
      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';

      if (
        errorCode === 'auth/invalid-credential' ||
        errorCode === 'auth/user-not-found' ||
        errorCode === 'auth/wrong-password' ||
        errorMessage.includes('auth/invalid-credential') ||
        errorMessage.includes('auth/user-not-found') ||
        errorMessage.includes('auth/wrong-password')
      ) {
        setError(errorCode === 'auth/user-not-found'
          ? 'No account was found for this email.'
          : 'Email or password is incorrect. If you are new, create an account.');
        setShowSignUpLink(true);
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
        error={error}
        alternatePath={showSignUpLink ? '/SignUp' : null}
        alternateLabel="Go to sign up"
      />
    </div>
  );
};

export default LogInputs;
