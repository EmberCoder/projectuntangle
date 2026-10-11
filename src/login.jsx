import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuestButton from './components/Login/GuestButton';
import LoginButton from './components/Login/LoginButton';
import RegisterButton from './components/Login/RegisterButton';
import { auth, authPersistenceReady } from './firebase';

const Login = () => {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isActive = true;
    let unsubscribe;

    authPersistenceReady
      .then(() => {
        if (!isActive) return;

        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            localStorage.removeItem('guestMode');
            navigate('/home', { replace: true });
          } else {
            setIsCheckingSession(false);
          }
        });
      })
      .catch((error) => {
        console.error('Failed to restore sign-in session:', error);
        if (isActive) setIsCheckingSession(false);
      });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [navigate]);

  if (isCheckingSession) return null;

  return (
    <div>
      <h1>Welcome to Serenity</h1>
      <Link to="/LogInputs">
        <LoginButton />
      </Link>

      <Link to="/SignUp">
        <RegisterButton />
      </Link>

      <Link to="/home" state={{ username: "Guest" }}>
        <GuestButton />
      </Link>
    </div>
  )
}

export default Login
