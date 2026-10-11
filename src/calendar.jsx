import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import './Calendar.css';
import NavBar from './components/NavBar/NavBar';

// Initial default categories
const INITIAL_CATEGORIES = [
  { name: 'School', color: '#EF4444', googleColorId: '11' }, // Red
  { name: 'Self Care', color: '#EC4899', googleColorId: '4' }, // Pink
  { name: 'Work', color: '#3B82F6', googleColorId: '9' },     // Blue
  { name: 'Personal', color: '#10B981', googleColorId: '2' }  // Green
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [selectedGridDate, setSelectedGridDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Categories state (editable/extensible)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(INITIAL_CATEGORIES[0]);

  // Custom Category Creator state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');

  // Form state for creating a Google Calendar event
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventHour, setEventHour] = useState('12');
  const [eventMinute, setEventMinute] = useState('00');
  const [eventAmPm, setEventAmPm] = useState('PM');

  // Google API Client Setup
  useEffect(() => {
    /* global gapi */
    const loadGapi = () => {
      if (typeof gapi !== 'undefined') {
        gapi.load('client:auth2', initGapiClient);
      } else {
        setTimeout(loadGapi, 300);
      }
    };
    loadGapi();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchGoogleEvents();
    }
  }, [currentDate, isSignedIn]);

  const initGapiClient = async () => {
    try {
      await gapi.client.init({
        apiKey: 'AIzaSyAweTv9HK6OqncBM5kg3OkMJFJ0f3gOLl8',
        clientId: '167839438143-oqi3l734kls7ptmtitp0rur85ur84a2j.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events',
      });

      const authInstance = gapi.auth2.getAuthInstance();
      const signedIn = authInstance.isSignedIn.get();
      setIsSignedIn(signedIn);

      if (signedIn) {
        const currentUser = authInstance.currentUser.get();
        setUserEmail(currentUser.getBasicProfile().getEmail());
        fetchGoogleEvents();
      }

      authInstance.isSignedIn.listen((val) => {
        setIsSignedIn(val);
        if (val) {
          const currentUser = authInstance.currentUser.get();
          setUserEmail(currentUser.getBasicProfile().getEmail());
          fetchGoogleEvents();
        } else {
          setUserEmail(null);
        }
      });
    } catch (err) {
      console.error('Error initializing Google API Client', err);
    }
  };

  const handleAuthClick = () => {
    if (!userEmail && !isSignedIn) {
      setIsAuthModalOpen(true);
      return;
    }

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

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCategoryObj = {
      name: newCatName.trim(),
      color: newCatColor,
      googleColorId: '1' // Fallback Google color ID
    };

    setCategories([...categories, newCategoryObj]);
    setSelectedCategory(newCategoryObj);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle) return;

    let hours = parseInt(eventHour, 10);
    if (eventAmPm === 'PM' && hours < 12) hours += 12;
    if (eventAmPm === 'AM' && hours === 12) hours = 0;

    const formattedHour = String(hours).padStart(2, '0');
    const startDateTime = `${eventDate}T${formattedHour}:${eventMinute}:00`;
    
    const endHourNum = (hours + 1) % 24;
    const endDateTime = `${eventDate}T${String(endHourNum).padStart(2, '0')}:${eventMinute}:00`;

    const newEvent = {
      summary: `${eventTitle} [${selectedCategory.name}]`,
      colorId: selectedCategory.googleColorId,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
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
      setEvents((prev) => [
        ...prev, 
        { 
          ...newEvent, 
          id: Date.now().toString(), 
          categoryColor: selectedCategory.color,
          categoryName: selectedCategory.name 
        }
      ]);
    }

    setEventTitle('');
    setIsPopupOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNumber = i - firstDayIndex + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  const selectedDayEvents = selectedGridDate ? events.filter(ev => {
    const evDate = ev.start?.date || ev.start?.dateTime?.split('T')[0];
    return evDate === selectedGridDate;
  }) : [];

  return (
    <>
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
            {isSignedIn ? `Disconnect Google (${userEmail})` : 'Sync Google Calendar'}
          </button>
        </div>

        {/* Calendar Grid Frame */}
        <div className="CalendarCard">
          <div className="CalendarNavHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button className="MonthNavButton" onClick={handlePrevMonth} aria-label="Previous Month">
              <ChevronLeft size={20} />
            </button>
            <div className="MonthLabel">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button className="MonthNavButton" onClick={handleNextMonth} aria-label="Next Month">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="DaysHeader">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span key={idx}>{day}</span>
            ))}
          </div>
          <div className="CalendarGrid">
            {calendarDays.map((day, index) => {
              const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              
              const dayEvents = events.filter(ev => {
                const evDate = ev.start?.date || ev.start?.dateTime?.split('T')[0];
                return evDate === dateStr;
              });

              const isSelected = selectedGridDate === dateStr;

              return (
                <div 
                  key={index} 
                  className={`CalendarCell ${isSelected ? 'SelectedCell' : ''}`}
                  style={{
                    border: isSelected ? '2px solid rgb(133, 86, 60)' : undefined,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  onClick={() => {
                    if (day) {
                      setSelectedGridDate(dateStr);
                      setIsDayDetailOpen(true);
                    }
                  }}
                >
                  {day && <span className="DayNumber">{day}</span>}
                  
                  <div className="CellEventsList" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', maxHeight: '42px', overflow: 'hidden' }}>
                    {dayEvents.map((ev, evIdx) => {
                      const matchedCat = categories.find(c => c.googleColorId === ev.colorId) || categories[2];
                      const bgColor = ev.categoryColor || matchedCat.color;
                      return (
                        <div 
                          key={evIdx} 
                          className="EventPill" 
                          style={{ 
                            backgroundColor: bgColor, 
                            color: '#fff', 
                            fontSize: '9px', 
                            padding: '1px 4px', 
                            borderRadius: '3px', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            width: '100%'
                          }}
                        >
                          {ev.summary}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plus Trigger Button */}
        <div className="PlusButtonWrapper">
          <button 
            className="PlusButton" 
            onClick={() => {
              setEventDate(selectedGridDate || new Date().toISOString().split('T')[0]);
              setIsPopupOpen(true);
            }} 
            aria-label="Add Event / Log Options"
          >
            <Plus size={30} color="#FFF" />
          </button>
        </div>

        {/* Day Details Modal */}
        {isDayDetailOpen && selectedGridDate && (
          <div className="ModalOverlay">
            <div className="ModalContent">
              <button className="CloseButton" onClick={() => setIsDayDetailOpen(false)}>
                <X size={18} color="#666" />
              </button>

              <div className="ModalBody">
                <h3 style={{ marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                  Events for {selectedGridDate}
                </h3>

                {selectedDayEvents.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#777', marginBottom: '15px' }}>No events scheduled for this day.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedDayEvents.map((ev, idx) => {
                      const matchedCat = categories.find(c => c.googleColorId === ev.colorId) || categories[2];
                      const bgColor = ev.categoryColor || matchedCat.color;
                      
                      let timeDisplay = '';
                      if (ev.start?.dateTime) {
                        const timePart = ev.start.dateTime.split('T')[1];
                        if (timePart) {
                          const [hStr, mStr] = timePart.split(':');
                          let hNum = parseInt(hStr, 10);
                          const ampm = hNum >= 12 ? 'PM' : 'AM';
                          hNum = hNum % 12 || 12;
                          timeDisplay = `${hNum}:${mStr} ${ampm}`;
                        }
                      }

                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            backgroundColor: '#f9f9f9', 
                            borderLeft: `4px solid ${bgColor}`, 
                            padding: '8px 10px', 
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', marginRight: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500', color: '#222', wordBreak: 'break-word' }}>
                              {ev.summary}
                            </span>
                            {timeDisplay && (
                              <span style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                <Clock size={11} /> {timeDisplay}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '10px', backgroundColor: bgColor, color: '#fff', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {matchedCat.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button 
                  className="ActionButtonPrimary" 
                  onClick={() => {
                    setIsDayDetailOpen(false);
                    setEventDate(selectedGridDate);
                    setIsPopupOpen(true);
                  }}
                >
                  Add Event to this Day
                </button>

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

        {/* Popup Modal for Event Creation */}
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
                  
                  <div style={{ margin: '10px 0' }}>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Event Date:</label>
                    <input 
                      type="date" 
                      value={eventDate} 
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>

                  {/* Time Picker */}
                  <div style={{ margin: '10px 0' }}>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Event Time:</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select 
                        value={eventHour} 
                        onChange={(e) => setEventHour(e.target.value)}
                        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hr) => (
                          <option key={hr} value={String(hr).padStart(2, '0')}>
                            {hr}
                          </option>
                        ))}
                      </select>
                      <span>:</span>
                      <select 
                        value={eventMinute} 
                        onChange={(e) => setEventMinute(e.target.value)}
                        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        {['00', '15', '30', '45'].map((min) => (
                          <option key={min} value={min}>
                            {min}
                          </option>
                        ))}
                      </select>
                      <select 
                        value={eventAmPm} 
                        onChange={(e) => setEventAmPm(e.target.value)}
                        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Editable Extended Pill Category Picker */}
                  <div style={{ margin: '12px 0' }}>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>Category / Group:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      {categories.map((cat) => {
                        const isSelected = selectedCategory.name === cat.name;
                        return (
                          <button
                            type="button"
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                              backgroundColor: cat.color,
                              color: '#fff',
                              border: isSelected ? '2.5px solid #333' : '2px solid transparent',
                              borderRadius: '16px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              boxShadow: isSelected ? '0 0 0 1px #fff' : 'none'
                            }}
                          >
                            {cat.name}
                          </button>
                        );
                      })}

                      {/* Plus button to add custom group/category */}
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(true)}
                        style={{
                          backgroundColor: '#e5e7eb',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          marginLeft: '4px'
                        }}
                        title="Add Custom Group"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Sub-modal or inline form for adding new group */}
                  {isAddingCategory && (
                    <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Create New Group</div>
                      <input 
                        type="text" 
                        placeholder="Group name..." 
                        value={newCatName} 
                        onChange={(e) => setNewCatName(e.target.value)}
                        style={{ width: '100%', padding: '5px', marginBottom: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#666' }}>Color:</span>
                        <input 
                          type="color" 
                          value={newCatColor} 
                          onChange={(e) => setNewCatColor(e.target.value)}
                          style={{ border: 'none', width: '30px', height: '24px', cursor: 'pointer', background: 'transparent' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={handleAddCategory} className="ActionButtonPrimary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Save Group
                        </button>
                        <button type="button" onClick={() => setIsAddingCategory(false)} className="ActionButtonSecondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="ActionButtonPrimary" style={{ marginTop: '10px' }}>
                    {isSignedIn ? 'Add to Google Calendar' : 'Add to App Calendar'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Auth Required Popup */}
        {isAuthModalOpen && (
          <div className="ModalOverlay">
            <div className="ModalContent" style={{ textAlign: 'center', padding: '20px' }}>
              <h3>No Profile Email Connected</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: '10px 0' }}>
                Please sign in with Google through your Profile/Settings section to sync your calendar events.
              </p>
              <button 
                className="ActionButtonPrimary" 
                onClick={() => {
                  setIsAuthModalOpen(false);
                  alert('Redirecting to Profile Sign-In Section...');
                }}
              >
                Go to Sign-In Section
              </button>
              <button 
                className="ActionButtonSecondary" 
                style={{ marginTop: '10px' }}
                onClick={() => setIsAuthModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Bar Fixed Outside Page Scroll Flow */}
      <div className="FixedNavBarWrapper">
        <NavBar />
      </div>
    </>
  );
}