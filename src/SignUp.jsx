import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './components/Login/BackButton';
import EmailLogin from './components/Login/EmailLogin';
import GoogleLogin from './components/Login/GoogleLogin';
import { auth } from './firebase';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(''); 

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            navigate('/home', { state: { username: result.user.email } });
        } catch (error) {
            setError(error.message);
        }
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
      />
    </div>
  )
}

export default SignUp