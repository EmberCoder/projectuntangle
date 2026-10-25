import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './Login.css';

const GuestButton = () => {
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Guest sign-out failed:', error);
    }

    localStorage.setItem('guestMode', 'true');
    navigate('/home', { state: { username: 'Guest' } });
  };

  return (
    <div>
      <button className="guestButton" onClick={handleGuestLogin}>Continue as Guest</button>
    </div>
  );
};

export default GuestButton;
