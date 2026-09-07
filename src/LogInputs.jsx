import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import EmailLogin from './components/Login/EmailLogin';
import GoogleLogin from './components/Login/GoogleLogin';
import { auth } from './firebase';

const LogInputs = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        navigate('/home', {state: { username: result.user.email }});
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        navigate('/home', {state: { username: result.user.email }});
      }
    } catch (error) {
      setError(error.message);
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
      />
    </div>
  );
};

export default LogInputs;
