import { useEffect, useState } from 'react';
import './selfcareapp.css';
import { MagnifyingGlass, ArrowSquareOut } from 'phosphor-react';
import NavBar from './components/NavBar/NavBar';
import BackButton from './components/Login/BackButton';
import ProfileButton from './components/ProfileButton.jsx';
import { auth } from './firebase';

export default function SelfCare() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(auth.currentUser));
  const [zipCode, setZipCode] = useState('');
  const [activeZip, setActiveZip] = useState('');
  const [cityName, setCityName] = useState('Austin');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(Boolean(user));
    });

    return unsubscribe;
  }, []);

  const hotlines = [
    { title: 'Suicide & Crisis Hotline', number: '988' },
    { title: 'SAMHSA National Helpline', number: '800-662-HELP' },
    { title: 'Teen Helpline', number: '800-852-8336' },
    { title: 'National Eating Disorders Helpline', number: '800-931-2237' },
    { title: 'NAMI Helpline', number: '1-800-950-6264' },
    { title: 'Crisis Support Services', number: '800-273-8255' },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanZip = zipCode.trim();
    if (!/^\d{5}$/.test(cleanZip)) return;

    setLoading(true);
    setHasSearched(false);

    try {
      const response = await fetch(
        `https://api.zippopotam.us/us/${encodeURIComponent(cleanZip)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.places && data.places.length > 0) {
          setCityName(data.places[0]['place name']);
        } else {
          setCityName('Local Area');
        }
      } else {
        setCityName('Local Area');
      }
    } catch (err) {
      console.error('Error fetching zip data:', err);
      setCityName('Local Area');
    } finally {
      setActiveZip(cleanZip);
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div
      className="SelfCarePage"
      style={{
        paddingBottom: '12rem',
        minHeight: '100vh',
        boxSizing: 'border-box',
        maxWidth: '800px',
        margin: '0 auto',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      }}
    >
      {isLoggedIn ? <ProfileButton /> : <BackButton />}
      <h1 className="SelfCareHeader">Self Care Zone</h1>
      <p className="SelfCareSubheading">
        Find live meditation, breathing classes, yoga sessions, and mental health forums near you.
      </p>

      {/* Zip Code Search Form */}
      <form onSubmit={handleSearch} className="ZipForm">
        <label htmlFor="zip-input" className="ZipLabel">
          Enter zip code:
        </label>
        <div className="ZipInputWrapper">
          <input
            id="zip-input"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g. 78681"
            inputMode="numeric"
            maxLength={5}
            pattern="[0-9]{5}"
            title="Enter a 5-digit US ZIP code"
            className="ZipInput"
          />
          <button type="submit" className="SearchButton" aria-label="Submit search">
            <MagnifyingGlass size={18} weight="bold" />
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="ResultsSection" style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <p style={{ color: 'rgb(133, 86, 60)', textAlign: 'center' }}>
            Looking up location...
          </p>
        ) : !hasSearched ? (
          <p style={{ color: 'rgb(181, 155, 127)', textAlign: 'center' }}>
            Enter your zip code above to explore live local sessions...
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'rgb(133, 86, 60)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Live Wellness & Events for {cityName} ({activeZip})
            </p>

            {/* Eventbrite Link Card with 'yoga' search query and dynamic city location */}
            <a
              href={`https://www.eventbrite.com/d/--${cityName.toLowerCase().replace(/\s+/g, '-')}/yoga--events/?q=yoga`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgb(133, 86, 60)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(133, 86, 60, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                }}
              >
                <div>
                  <h3 style={{ color: 'rgb(133, 86, 60)', fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                    Browse Local Yoga & Wellness Classes on Eventbrite
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                    View real-time schedules, dates, and ticket bookings near {cityName} ({activeZip}).
                  </p>
                </div>
                <ArrowSquareOut size={24} color="rgb(133, 86, 60)" />
              </div>
            </a>

            {/* NAMI Support Groups Link Card */}
            <a
              href="https://www.nami.org/findsupport"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgb(133, 86, 60)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(133, 86, 60, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                }}
              >
                <div>
                  <h3 style={{ color: 'rgb(133, 86, 60)', fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                    Find NAMI Mental Health Support Forums & Peer Meetings
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                    Connect with community mental health circles and discussion groups.
                  </p>
                </div>
                <ArrowSquareOut size={24} color="rgb(133, 86, 60)" />
              </div>
            </a>
          </div>
        )}
      </div>

      {/* Therapy Support Resource */}
      <div className="ResourceCard" style={{ marginTop: '2rem' }}>
        <p>
          Looking for extra support?{' '}
          <a
            href="https://www.psychologytoday.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Psychology Today
          </a>{' '}
          can help you find local therapists based on your needs.
        </p>
      </div>

      {/* Hotlines Section */}
      <section style={{ marginTop: '2.5rem', marginBottom: '3rem' }}>
        <h2 style={{ color: 'rgb(133, 86, 60)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Hotlines & Help
        </h2>
        <p className="SelfCareSubheading">
          Need to talk to someone as soon as possible?
        </p>

        <div className="HotlinesGrid">
          {hotlines.map((item, idx) => (
            <div key={idx} className="HotlineCard">
              <div className="HotlineTitle">{item.title}</div>
              <a href={`tel:${item.number}`} className="HotlineLink">
                {item.number}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Perfectly Centered & Sticky Bottom Navigation Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '1rem',
          paddingTop: '0.75rem',
          backgroundColor: 'rgba(253, 246, 238, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center' }}>
          <NavBar />
        </div>
      </div>
    </div>
  );
}