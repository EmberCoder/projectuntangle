import { CalendarDays, ChevronRight, House } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Breathing from './breathingexercises';
import Calendar from './calendar';
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
import { getLocalDateKey, saveStressLog } from './stressLogs';
import Todo from './todo';

const readStoredEvents = (key) => {
  try {
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
};

const readUpcomingEvent = () => {
  const appEvents = readStoredEvents('projectUntangle.appCalendarEvents');
  const legacyEvents = appEvents.length
    ? []
    : readStoredEvents('projectUntangle.calendarEvents').filter((event) => !event.htmlLink);
  const linkedEmail = localStorage.getItem('projectUntangle.googleCalendarLinkedEmail');
  const googleEvents = linkedEmail
    ? readStoredEvents(`projectUntangle.googleCalendarEvents.${encodeURIComponent(linkedEmail.trim().toLowerCase())}`)
    : [];
  const currentTime = Date.now();

  return [...appEvents, ...legacyEvents, ...googleEvents]
    .map((event) => {
      const startValue = event.start?.dateTime || (event.start?.date && `${event.start.date}T00:00:00`);
      const startDate = startValue ? new Date(startValue) : null;
      return { event, startDate };
    })
    .filter(({ startDate }) => startDate && !Number.isNaN(startDate.getTime()) && startDate.getTime() >= currentTime)
    .sort((first, second) => first.startDate - second.startDate)[0] || null;
};

const formatEventDate = (date) => new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}).format(date);

function Home() {
  const [scale, setScale] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [stressLogged, setStressLogged] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(auth.currentUser));
  const [username, setUsername] = useState('Name');
  const [upcomingEvent] = useState(readUpcomingEvent);

  const location = useLocation();

  const handleStressSubmit = (submittedScale) => {
    saveStressLog(getLocalDateKey(), submittedScale);
  };

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
    if (username === 'Guest') {
      const timer = setTimeout(() => {
        setShowGuestPopup(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [username]);

  return (
    <div>
      <div className="HomepageContent">
        <div className="pageHeaderBar">
          {isLoggedIn ? <ProfileButton /> : <BackButton />}
          <h1 className="Welcome pageTitle">Welcome back {username}!</h1>
        </div>

        <section className="UpcomingEvents" aria-labelledby="upcoming-events-title">
          <div className="UpcomingEventsHeading">
            <CalendarDays size={20} aria-hidden="true" />
            <h2 id="upcoming-events-title">Upcoming Events</h2>
          </div>
          {upcomingEvent ? (
            <div className="UpcomingEventItem">
              <p>{upcomingEvent.event.summary || 'Untitled event'}</p>
              <time dateTime={upcomingEvent.startDate.toISOString()}>
                {formatEventDate(upcomingEvent.startDate)}
              </time>
            </div>
          ) : (
            <p className="UpcomingEventsEmpty">No upcoming events</p>
          )}
          <Link className="UpcomingEventsLink" to="/calendar">
            Open calendar
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </section>

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
            onStressSubmit={handleStressSubmit}
          />
        )}

        {showPopup && (
          <StressPopup
            scale={scale}
            setShowPopup={setShowPopup}
            setShowQuestion={setShowQuestion}
          />
        )}

        {!showQuestion && !showPopup && (
          <button
            type="button"
            className="StressLogAgainButton"
            onClick={() => {
              setScale('');
              setShowQuestion(true);
            }}
          >
            Log stress again
          </button>
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
              backgroundColor: 'var(--palette-navy)',
              color: 'var(--palette-ice)',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontFamily: 'Google Sans Flex, sans-serif',
              display: 'inline-block',
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

function HomeButton() {
  const { pathname } = useLocation();
  const excludedPaths = ['/', '/LogInputs', '/SignUp', '/Onboarding'];

  if (excludedPaths.includes(pathname)) return null;

  return (
    <Link className="AppHomeButton" to="/home" aria-label="Go to homepage" title="Home">
      <House size={20} aria-hidden="true" />
    </Link>
  );
}

function App() {
  return (
    <Router>
      <HomeButton />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/todo" element={<Todo />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/selfcare" element={<SelfCare />} />
        <Route path="/breathingexercises" element={<Breathing />} />
        <Route path="/LogInputs" element={<LogInputs />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Onboarding" element={<Onboarding />} />
        <Route path="/ProfileAndSettings" element={<ProfileAndSettings />} />
      </Routes>
    </Router>
  );
}

export default App;