import { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import GuestPopup from './components/GuestPopup/GuestPopup';
import BackButton from './components/Login/BackButton';
import NavBar from './components/NavBar/NavBar';
import ProfileButton from './components/ProfileButton.jsx';
import StressPopup from './components/StressQuestion/StressPopup';
import StressQuestion from './components/StressQuestion/StressQuestion';
import { auth, getCurrentUserDisplayName } from './firebase';
import Journal from './journal';
import Login from './login';
import LogInputs from './LogInputs';
import Onboarding from './Onboarding';
import ProfileAndSettings from './ProfileAndSettings.jsx';
import SelfCare from './selfcare';
import SignUp from './SignUp';
import Todo from './todo';


function Home() {
  const [scale, setScale] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [stressLogged, setStressLogged] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(auth.currentUser));
  const [username, setUsername] = useState('Name');

  const location = useLocation();

  useEffect(() => {
    const updateUsername = () => {
      const guestMode = localStorage.getItem('guestMode') === 'true';
      const user = auth.currentUser;

      if (user && !guestMode) {
        setUsername(user.displayName || getCurrentUserDisplayName());
        return;
      }

      setUsername(location.state?.username || 'Guest');
    };

    updateUsername();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      const guestMode = localStorage.getItem('guestMode') === 'true';

      if (user) {
        localStorage.removeItem('guestMode');
      }

      const nextLoggedIn = Boolean(user) && !guestMode;
      setIsLoggedIn(nextLoggedIn);

      if (user && !guestMode) {
        setUsername(user.displayName || getCurrentUserDisplayName());
        return;
      }

      setUsername(location.state?.username || 'Guest');
    });

    return () => unsubscribe();
  }, [location.state?.username]);

  useEffect(() => {
    if (username === "Guest") {
      setTimeout(() => {
        setShowGuestPopup(true);
      }, 1000);
    }
  }, [username]);

  return (
    <div>
      <div className="HomepageContent">

        {isLoggedIn ? <ProfileButton /> : <BackButton />}

        <h1 className="Welcome">Welcome back {username}!</h1>

        {showGuestPopup && (
          <GuestPopup setShowGuestPopup={setShowGuestPopup} />
        )}

        {showQuestion && (
          <StressQuestion
            scale={scale}
            setScale={setScale}
            setShowPopup={setShowPopup}
            setShowQuestion={setShowQuestion}
            setStressLogged={setStressLogged}
          />
        )}

        {showPopup && (
          <StressPopup 
            scale={scale} 
            setShowPopup={setShowPopup} 
            setShowQuestion={setShowQuestion} 
          />
        )}

        {stressLogged && (
          <div className="StressLogged">
            <h3 className="logged">Logged!</h3>
          </div>
        )}

        <div style={{ margin: '1rem' }}>
          <Link 
            to="/selfcare" 
            style={{
              backgroundColor: 'rgb(133, 86, 60)',
              color: '#ffffff',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontFamily: 'Fredoka, sans-serif',
              display: 'inline-block'
            }}
          >
            Go to Self Care Zone →
          </Link>
        </div>

        <NavBar />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/todo" element={<Todo />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/selfcare" element={<SelfCare />} />
        <Route path="/LogInputs" element={<LogInputs />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Onboarding" element={<Onboarding />} />
        <Route path="/ProfileAndSettings" element={<ProfileAndSettings />} />
      </Routes>
    </Router>
  );
}

export default App;