import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ChevronLeft, ChevronRight, Clock, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './Calendar.css';
import NavBar from './components/NavBar/NavBar';
import ProfileButton from './components/ProfileButton.jsx';
import { auth, authPersistenceReady } from './firebase';
import { deleteStressLog, getLocalDateKey, readStressLogs, saveStressLog } from './stressLogs';

// Initial default categories
const INITIAL_CATEGORIES = [
  { name: 'School', color: '#EF4444', googleColorId: '11' }, // Red
  { name: 'Self Care', color: '#EC4899', googleColorId: '4' }, // Pink
  { name: 'Work', color: '#3B82F6', googleColorId: '9' },     // Blue
  { name: 'Personal', color: '#10B981', googleColorId: '2' }  // Green
];
const APP_CALENDAR_EVENTS_STORAGE_KEY = 'projectUntangle.appCalendarEvents';
const LEGACY_CALENDAR_EVENTS_STORAGE_KEY = 'projectUntangle.calendarEvents';
const GOOGLE_CALENDAR_LINK_STORAGE_KEY = 'projectUntangle.googleCalendarLinkedEmail';
const STRESS_LEVEL_LABELS = ['Very low', 'Low', 'Moderate', 'High', 'Very stressed'];
const SYMPTOM_OPTIONS_BY_LEVEL = {
  1: ['Calm', 'Relaxed', 'Focused', 'Tired'],
  2: ['Mostly calm', 'Restless', 'Tired', 'Distracted'],
  3: ['Tense', 'Overwhelmed', 'Irritable', 'Hard to focus'],
  4: ['Anxious', 'Racing thoughts', 'Body tension', 'Overwhelmed', 'Hard to focus'],
  5: ['Panic', 'Racing thoughts', 'Body tension', 'Unable to focus', 'Trouble sleeping'],
};

const formatStressLogTime = (loggedAt) => new Date(loggedAt).toLocaleTimeString([], {
  hour: 'numeric',
  minute: '2-digit',
});

const googleEventsStorageKey = (email) => `projectUntangle.googleCalendarEvents.${encodeURIComponent(email.trim().toLowerCase())}`;

const readStoredEvents = (key) => {
  try {
    const savedEvents = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(savedEvents) ? savedEvents : [];
  } catch {
    return [];
  }
};

const readAppEvents = () => {
  const savedAppEvents = readStoredEvents(APP_CALENDAR_EVENTS_STORAGE_KEY);
  if (savedAppEvents.length > 0) return savedAppEvents;

  return readStoredEvents(LEGACY_CALENDAR_EVENTS_STORAGE_KEY).filter((event) => !event.htmlLink);
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [selectedGridDate, setSelectedGridDate] = useState(null);
  const [events, setEvents] = useState(readAppEvents);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [linkedGoogleEmail, setLinkedGoogleEmail] = useState(null);
  const [calendarEmail, setCalendarEmail] = useState(null);
  const [calendarAccessToken, setCalendarAccessToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [stressLogs, setStressLogs] = useState(readStressLogs);
  const [isStressQuizOpen, setIsStressQuizOpen] = useState(false);
  const [stressLevel, setStressLevel] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [editingStressLogId, setEditingStressLogId] = useState(null);
  const [stressSaveError, setStressSaveError] = useState('');
  const stressLogsCarouselRef = useRef(null);

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

  useEffect(() => {
    const cachedEvents = events.map(({ id, summary, colorId, start, end, htmlLink, categoryColor, categoryName, googleAccountEmail }) => ({
      id,
      summary,
      colorId,
      start,
      end,
      htmlLink,
      categoryColor,
      categoryName,
      googleAccountEmail,
    }));

    try {
      localStorage.setItem(
        APP_CALENDAR_EVENTS_STORAGE_KEY,
        JSON.stringify(cachedEvents.filter((event) => !event.htmlLink))
      );
      if (calendarEmail) {
        localStorage.setItem(
          googleEventsStorageKey(calendarEmail),
          JSON.stringify(cachedEvents.filter((event) => event.htmlLink))
        );
      }
    } catch (error) {
      console.error('Could not cache calendar events:', error);
    }
  }, [events, calendarEmail]);

  useEffect(() => {
    if (calendarAccessToken) {
      fetchGoogleEvents();
    }
  }, [currentDate, calendarAccessToken]);

  const handleAuthClick = async () => {
    setIsAuthModalOpen(false);
    setAuthError('');

    try {
      if (isSignedIn) {
        setCalendarAccessToken(null);
        setIsSignedIn(false);
        setUserEmail(null);
        setCalendarEmail(null);
        setLinkedGoogleEmail(null);
        localStorage.removeItem(GOOGLE_CALENDAR_LINK_STORAGE_KEY);
        setEvents((previousEvents) => previousEvents.filter((event) => !event.htmlLink));
      } else {
        await authPersistenceReady;
        const calendarProvider = new GoogleAuthProvider();
        calendarProvider.addScope('https://www.googleapis.com/auth/calendar.events');
        calendarProvider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, calendarProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);

        if (!credential?.accessToken) {
          throw new Error('Google did not provide Calendar access. Please try connecting again.');
        }

        const connectedEmail = result.user.email?.trim().toLowerCase();
        if (!connectedEmail) {
          throw new Error('Google did not provide an email address for this calendar account.');
        }
        const accountEvents = readStoredEvents(googleEventsStorageKey(connectedEmail))
          .map((event) => ({ ...event, googleAccountEmail: connectedEmail }));

        setEvents((previousEvents) => [
          ...previousEvents.filter((event) => !event.htmlLink),
          ...accountEvents,
        ]);
        setCalendarAccessToken(credential.accessToken);
        setCalendarEmail(connectedEmail);
        setUserEmail(connectedEmail);
        setLinkedGoogleEmail(connectedEmail);
        localStorage.setItem(GOOGLE_CALENDAR_LINK_STORAGE_KEY, connectedEmail);
        setIsSignedIn(true);
      }
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error);
      setAuthError(error.message || 'Google could not authorize this calendar connection.');
      setIsAuthModalOpen(true);
    }
  };

  const fetchGoogleEvents = async () => {
    if (!calendarAccessToken) {
      return;
    }

    try {
      const timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString();
      const queryParams = {
        timeMin,
        timeMax,
        showDeleted: 'false',
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '2500',
        fields: 'items(id,summary,colorId,start,end,htmlLink),nextPageToken',
      };
      const syncedEvents = [];
      let pageToken;

      do {
        const query = new URLSearchParams(queryParams);
        if (pageToken) query.set('pageToken', pageToken);

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, {
          headers: { Authorization: `Bearer ${calendarAccessToken}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || 'Could not load Google Calendar events.');
        }

        syncedEvents.push(...(data.items || []).map((event) => ({
          ...event,
          googleAccountEmail: calendarEmail,
        })));
        pageToken = data.nextPageToken;
      } while (pageToken);

      setEvents((previousEvents) => {
        const otherEvents = previousEvents.filter((event) => (
          !event.htmlLink || event.googleAccountEmail !== calendarEmail
        ));
        const eventsById = new Map(otherEvents.map((event) => [event.id, event]));
        syncedEvents.forEach((event) => eventsById.set(event.id, event));
        return Array.from(eventsById.values());
      });
    } catch (err) {
      console.error('Error fetching events', err);
      setAuthError(err.message || 'Could not load Google Calendar events.');
      setIsAuthModalOpen(true);
    }
  };

  const handleDeleteEvent = async (event) => {
    setDeletingEventId(event.id);

    try {
      let accessToken = calendarAccessToken;
      let signedInUserEmail = userEmail;

      if (event.htmlLink && !accessToken) {
        await authPersistenceReady;
        const calendarProvider = new GoogleAuthProvider();
        calendarProvider.addScope('https://www.googleapis.com/auth/calendar.events');
        calendarProvider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, calendarProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        accessToken = credential?.accessToken;
        signedInUserEmail = result.user.email?.trim().toLowerCase() || null;

        if (!accessToken) {
          throw new Error('Google did not provide Calendar access. Please try deleting the event again.');
        }
      }

      if (event.htmlLink && event.googleAccountEmail &&
          event.googleAccountEmail !== (signedInUserEmail || calendarEmail)) {
        throw new Error('This event belongs to a different Google account. Connect that account to delete it.');
      }

      if (event.htmlLink) {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(event.id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok && response.status !== 404) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Could not delete the event from Google Calendar.');
        }
      }

      if (event.htmlLink && !calendarAccessToken) {
        setCalendarAccessToken(accessToken);
        setUserEmail(signedInUserEmail);
        setCalendarEmail(signedInUserEmail);
        setLinkedGoogleEmail(signedInUserEmail);
        if (signedInUserEmail) {
          localStorage.setItem(GOOGLE_CALENDAR_LINK_STORAGE_KEY, signedInUserEmail);
        }
        setIsSignedIn(true);
      }
      setEvents((previousEvents) => previousEvents.filter((item) => item.id !== event.id));
    } catch (error) {
      console.error('Error deleting calendar event', error);
      setAuthError(error.message || 'Could not delete this event.');
      setIsAuthModalOpen(true);
    } finally {
      setDeletingEventId(null);
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

    const [year, month, day] = eventDate.split('-').map(Number);
    const start = new Date(year, month - 1, day, hours, Number(eventMinute));
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const toLocalDateTime = (date) => {
      const datePart = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
      const timePart = [String(date.getHours()).padStart(2, '0'), String(date.getMinutes()).padStart(2, '0')].join(':');
      return `${datePart}T${timePart}:00`;
    };

    const newEvent = {
      summary: `${eventTitle} [${selectedCategory.name}]`,
      colorId: selectedCategory.googleColorId,
      start: { dateTime: toLocalDateTime(start), timeZone },
      end: { dateTime: toLocalDateTime(end), timeZone },
    };

    if (isSignedIn && calendarAccessToken) {
      try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${calendarAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEvent),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || 'Could not add the event to Google Calendar.');
        }
        await fetchGoogleEvents();
      } catch (err) {
        console.error('Error creating event on Google Calendar', err);
        setAuthError(err.message || 'Could not add the event to Google Calendar.');
        setIsAuthModalOpen(true);
        return;
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
  const selectedDayStressLogs = selectedGridDate ? stressLogs[selectedGridDate] || [] : [];

  const openStressQuiz = (logToEdit = null) => {
    setStressLevel(logToEdit ? String(logToEdit.scale) : '');
    setSelectedSymptoms(logToEdit?.symptoms || []);
    setEditingStressLogId(logToEdit?.id || null);
    setStressSaveError('');
    setIsStressQuizOpen(true);
  };

  const handleSaveStressLog = () => {
    if (!selectedGridDate || !stressLevel) {
      setStressSaveError('Choose a stress level before saving.');
      return;
    }

    try {
      setStressLogs(saveStressLog(selectedGridDate, stressLevel, selectedSymptoms, editingStressLogId));
      setIsStressQuizOpen(false);
    } catch (error) {
      console.error('Could not save stress check-in:', error);
      setStressSaveError(`Could not save check-in: ${error.message || 'browser storage is unavailable.'}`);
    }
  };

  const handleDeleteStressLog = () => {
    if (!selectedGridDate || !editingStressLogId) return;

    try {
      setStressLogs(deleteStressLog(selectedGridDate, editingStressLogId));
      setIsStressQuizOpen(false);
    } catch (error) {
      console.error('Could not delete stress check-in:', error);
      setStressSaveError(`Could not delete check-in: ${error.message || 'browser storage is unavailable.'}`);
    }
  };

  const scrollStressLogs = (direction) => {
    const carousel = stressLogsCarouselRef.current;
    if (carousel) {
      carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="CalendarPage">
        {/* Header */}
        <header className="CalendarHeader">
          <div className="pageHeaderBar">
            <ProfileButton />
            <h1 className="CalendarTitle pageTitle">Calendar</h1>
          </div>
        </header>

        {/* Google Sign-In Status Banner */}
        <div className="AuthBar">
          <button className="AuthButton" onClick={handleAuthClick}>
                {isSignedIn
              ? `Disconnect Google (${userEmail})`
              : linkedGoogleEmail
                ? `Sync Google Calendar (${linkedGoogleEmail})`
                : 'Sync Google Calendar'}
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
              const isToday = dateStr === getLocalDateKey();

              return (
                <div 
                  key={index} 
                  className={`CalendarCell ${isSelected ? 'SelectedCell' : ''} ${isToday ? 'TodayCell' : ''}`}
                  style={{
                    border: isToday ? '2px solid rgb(133, 86, 60)' : undefined,
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
                <h3 style={{ marginBottom: '4px', fontSize: '16px', color: '#333' }}>
                  {selectedGridDate}
                </h3>

                <section className="DayCategorySection" aria-labelledby="events-heading">
                  <h4 id="events-heading">Events</h4>
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
                          key={ev.id || idx} 
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontSize: '10px', backgroundColor: bgColor, color: '#fff', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                              {matchedCat.name}
                            </span>
                            <button
                              type="button"
                              className="EventDeleteButton"
                              aria-label={`Delete ${ev.summary || 'event'}`}
                              title={ev.htmlLink ? 'Delete from Google Calendar and app' : 'Delete from app'}
                              disabled={deletingEventId === ev.id}
                              onClick={() => handleDeleteEvent(ev)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                </section>

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

                {selectedDayStressLogs.length > 0 && (
                  <section className="DayCategorySection" aria-labelledby="symptoms-heading">
                    <div className="StressSectionHeader">
                      <h4 id="symptoms-heading">Symptoms</h4>
                      {selectedDayStressLogs.length > 1 && (
                        <div className="StressCarouselControls">
                          <button type="button" aria-label="Previous stress check-in" onClick={() => scrollStressLogs(-1)}>
                            <ChevronLeft size={17} />
                          </button>
                          <button type="button" aria-label="Next stress check-in" onClick={() => scrollStressLogs(1)}>
                            <ChevronRight size={17} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className="StressLogList"
                      ref={stressLogsCarouselRef}
                      role="region"
                      aria-roledescription="carousel"
                      aria-label="Daily stress check-ins"
                      tabIndex={0}
                    >
                      {[...selectedDayStressLogs].reverse().map((log) => (
                        <div className="SymptomEntry" key={log.id}>
                          <div className="StressLogDetails">
                            <strong>{log.scale === 5 ? 'Very stressed' : `${STRESS_LEVEL_LABELS[log.scale - 1]} stress`} · {log.scale}/5</strong>
                            <span>{formatStressLogTime(log.loggedAt)}</span>
                            {log.symptoms?.length > 0 && <span>{log.symptoms.join(', ')}</span>}
                          </div>
                          <button type="button" className="StressEditButton" onClick={() => openStressQuiz(log)}>
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <hr className="Divider" />

                <button 
                  className="ActionButtonSecondary" 
                  onClick={() => alert('To-Do List navigation coming soon!')}
                >
                  Go to To-Do List for this day
                </button>

                {selectedGridDate === getLocalDateKey() && (
                  <button
                    className="ActionButtonSecondary" 
                    onClick={() => openStressQuiz()}
                  >
                    Log symptoms for today
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {isStressQuizOpen && (
          <div className="ModalOverlay StressQuizOverlay">
            <div className="ModalContent StressQuizModal" role="dialog" aria-modal="true" aria-labelledby="stress-quiz-title">
              <button className="CloseButton" onClick={() => setIsStressQuizOpen(false)} aria-label="Close symptom log">
                <X size={18} color="#666" />
              </button>
              <div className="StressQuizContent">
                <span className="StressQuizEyebrow">{selectedGridDate}</span>
                <h3 id="stress-quiz-title">{editingStressLogId ? 'Edit check-in' : 'Stress check-in'}</h3>
                <p>How did your stress feel?</p>

                <fieldset className="StressLevelFieldset">
                  <legend>Choose a level from 1 to 5</legend>
                  <div className="StressLevelOptions">
                    {STRESS_LEVEL_LABELS.map((label, index) => {
                      const level = index + 1;
                      const isSelected = Number(stressLevel) === level;
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`StressLevelChoice ${isSelected ? 'is-selected' : ''}`}
                          key={level}
                          onClick={() => {
                            setStressLevel(String(level));
                            setSelectedSymptoms([]);
                            setStressSaveError('');
                          }}
                        >
                          <span>{level}</span>
                          <small>{label}</small>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {stressLevel && (
                  <fieldset className="SymptomOptionsFieldset">
                    <legend>What did you notice?</legend>
                    <div className="SymptomOptions">
                      {SYMPTOM_OPTIONS_BY_LEVEL[stressLevel].map((symptom) => (
                        <label className="SymptomOption" key={symptom}>
                          <input
                            type="checkbox"
                            checked={selectedSymptoms.includes(symptom)}
                            onChange={(event) => setSelectedSymptoms((current) => (
                              event.target.checked
                                ? [...current, symptom]
                                : current.filter((item) => item !== symptom)
                            ))}
                          />
                          <span>{symptom}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {stressSaveError && <p className="StressSaveError" role="alert">{stressSaveError}</p>}

                <div className="StressQuizActions">
                  {editingStressLogId && (
                    <button
                      type="button"
                      className="StressDeleteButton"
                      aria-label="Delete this check-in"
                      title="Delete this check-in"
                      onClick={handleDeleteStressLog}
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                  <button type="button" className="ActionButtonSecondary" onClick={() => setIsStressQuizOpen(false)}>
                    Cancel
                  </button>
                  <button type="button" className="ActionButtonPrimary" disabled={!stressLevel} onClick={handleSaveStressLog}>
                    {editingStressLogId ? 'Save changes' : 'Log check-in'}
                  </button>
                </div>
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
              <h3>Connect Google Calendar</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: '10px 0' }}>
                Sign in with your Google account to sync events to your Google Calendar.
              </p>
              {authError && (
                <p role="alert" style={{ fontSize: '13px', color: '#a12622', margin: '10px 0' }}>
                  {authError}
                </p>
              )}
              <button 
                className="ActionButtonPrimary" 
                onClick={handleAuthClick}
              >
                Connect Google Account
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