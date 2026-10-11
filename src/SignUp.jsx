import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import EmailLogin from './components/Login/EmailLogin';
import GoogleLogin from './components/Login/GoogleLogin';
import { setOnboardingStatus } from './firebase';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(''); 

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError('Please enter both an email and password.');
            return;
        }

        if (trimmedPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
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
      />
    </div>
  )
}

export default SignUp