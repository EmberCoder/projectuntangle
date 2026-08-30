import React, { useState, useEffect } from 'react';
import { Plus, X, Settings } from 'lucide-react';
import './calendar.css';
import NavBar from './components/NavBar/NavBar';

// Categories matching Google Calendar color IDs
const CATEGORIES = [
  { name: 'School', color: '#EF4444', googleColorId: '11' }, // Red
  { name: 'Self Care', color: '#EC4899', googleColorId: '4' }, // Pink
  { name: 'Work', color: '#3B82F6', googleColorId: '9' },     // Blue
  { name: 'Personal', color: '#10B981', googleColorId: '2' }  // Green
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Form state for creating a Google Calendar event
  const [eventTitle, setEventTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  // Google API Client Setup
 useEffect(() => {
  const initGapi = async () => {
    /* global gapi */
    if (typeof gapi !== 'undefined' && gapi.client) {
      try {
        await gapi.client.init({
          apiKey: 'AIzaSyAweTv9HK6OqncBM5kg3OkMJFJ0f3gOLl8',
          clientId: '167839438143-oqi3l734kls7ptmtitp0rur85ur84a2j.apps.googleusercontent.com',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar.events',
        });

        if (gapi.auth2) {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
        }
      } catch (err) {
        console.error('Google API Init Error:', err);
      }
    }
  };

  // Wait for gapi script tag to be ready
  if (window.gapi) {
    window.gapi.load('client:auth2', initGapi);
  }
}, []);

  const initGapiClient = async () => {
    try {
      await gapi.client.init({
        apiKey: 'AIzaSyAweTv9HK6OqncBM5kg3OkMJFJ0f3gOLl8',
        clientId: '167839438143-oqi3l734kls7ptmtitp0rur85ur84a2j.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events',
      });

      const authInstance = gapi.auth2.getAuthInstance();
      setIsSignedIn(authInstance.isSignedIn.get());
      authInstance.isSignedIn.listen(setIsSignedIn);

      if (authInstance.isSignedIn.get()) {
        fetchGoogleEvents();
      }
    } catch (err) {
      console.error('Error initializing Google API Client', err);
    }
  };

  const handleAuthClick = () => {
    /* global gapi */
    if (typeof gapi !== 'undefined' && gapi.auth2) {
      const authInstance = gapi.auth2.getAuthInstance();
      if (isSignedIn) {
        authInstance.signOut();
      } else {
        authInstance.signIn();
      }
    }
  };

  const fetchGoogleEvents = async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
        timeMax: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString(),
        showDeleted: false,
        singleEvents: true,
      });
      setEvents(response.result.items || []);
    } catch (err) {
      console.error('Error fetching events', err);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle) return;

    const newEvent = {
      summary: eventTitle,
      colorId: selectedCategory.googleColorId,
      start: { date: new Date().toISOString().split('T')[0] },
      end: { date: new Date().toISOString().split('T')[0] },
    };

    if (isSignedIn) {
      try {
        await gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: newEvent,
        });
        fetchGoogleEvents();
      } catch (err) {
        console.error('Error creating event on Google Calendar', err);
      }
    } else {
      setEvents((prev) => [...prev, { ...newEvent, id: Date.now().toString() }]);
    }

    setEventTitle('');
    setIsPopupOpen(false);
  };

  // Calendar Grid Days Calculation
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNumber = i - firstDayIndex + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  return (
    <div className="CalendarPage">
      {/* Header */}
      <header className="CalendarHeader">
        <h1 className="CalendarTitle">Calendar</h1>
        <button className="IconButton" aria-label="Settings">
          <Settings size={26} color="rgb(133, 86, 60)" />
        </button>
      </header>

      {/* Google Sign-In Status Banner */}
      <div className="AuthBar">
        <button className="AuthButton" onClick={handleAuthClick}>
          {isSignedIn ? 'Disconnect Google Calendar' : 'Sync Google Calendar'}
        </button>
      </div>

      {/* Calendar Grid Frame */}
      <div className="CalendarCard">
        <div className="MonthLabel">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <div className="DaysHeader">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <span key={idx}>{day}</span>
          ))}
        </div>
        <div className="CalendarGrid">
          {calendarDays.map((day, index) => (
            <div key={index} className="CalendarCell">
              {day && <span className="DayNumber">{day}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Pink Plus Trigger Button */}
      <div className="PlusButtonWrapper">
        <button 
          className="PlusButton" 
          onClick={() => setIsPopupOpen(true)}
          aria-label="Add Event / Log Options"
        >
          <Plus size={30} color="#FFF" />
        </button>
      </div>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="ModalOverlay">
          <div className="ModalContent">
            <button className="CloseButton" onClick={() => setIsPopupOpen(false)}>
              <X size={18} color="#666" />
            </button>

            <div className="ModalBody">
              <form onSubmit={handleAddEvent} className="EventForm">
                <input
                  type="text"
                  placeholder="New Event Title..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="EventInput"
                />
                
                <div className="CategoryPicker">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat)}
                      className="ColorBadge"
                      style={{
                        backgroundColor: cat.color,
                        border: selectedCategory.name === cat.name ? '2.5px solid rgb(133, 86, 60)' : 'none'
                      }}
                    />
                  ))}
                </div>

                <button type="submit" className="ActionButtonPrimary">
                  Add to Google Calendar
                </button>
              </form>

              <hr className="Divider" />

              <button 
                className="ActionButtonSecondary" 
                onClick={() => alert('To-Do List navigation coming soon!')}
              >
                Go to To-Do List for this day
              </button>

              <button 
                className="ActionButtonSecondary" 
                onClick={() => alert('Symptom logging coming soon!')}
              >
                Log symptoms for this day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#ffffff',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <NavBar />
      </div>
    </div>
  );
}