import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import EmailLogin from './components/Login/EmailLogin';
import GoogleLogin from './components/Login/GoogleLogin';
import { auth, authPersistenceReady, setOnboardingStatus } from './firebase';
import { isValidEmailAddress } from './emailValidation';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(''); 
    const [showLoginLink, setShowLoginLink] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setShowLoginLink(false);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError('Please enter both an email and password.');
            return;
        }

        if (!isValidEmailAddress(trimmedEmail)) {
          setError('Enter a valid email address.');
          return;
        }

        if (trimmedPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
          await authPersistenceReady;
          const signInMethods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
          if (signInMethods.length > 0) {
            setError('An account already uses this email. Log in instead.');
            setShowLoginLink(true);
            return;
          }
        } catch (error) {
          setError(error.message || 'We could not verify this email right now. Please try again.');
          return;
        }

        setOnboardingStatus(trimmedEmail, 'incomplete');

        navigate('/Onboarding', {
            state: {
                email: trimmedEmail,
                password: trimmedPassword,
            },
        });
    }
  return (
    <div>
      <BackButton />
      <h1>Create an Account</h1>

      <GoogleLogin />

      <EmailLogin 
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        handleEmailAuth={handleSignUp}
        isSignUp={true}
        error={error}
        alternatePath={showLoginLink ? '/LogInputs' : null}
        alternateLabel="Go to log in"
      />
    </div>
  )
}

export default SignUp