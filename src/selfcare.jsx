import React, { useState } from 'react';
import './selfcareapp.css';
import { MagnifyingGlass } from 'phosphor-react';
import NavBar from './components/NavBar/NavBar';

export default function SelfCare() {
  const [zipCode, setZipCode] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
    const cleanedZip = zipCode.trim();

    if (cleanedZip !== '') {
      setLoading(true);
      setHasSearched(true);

      try {
        // Fetch events from your Node/Express backend (Option B)
        const response = await fetch(`/api/events?zipCode=${encodeURIComponent(cleanedZip)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch events from server');
        }

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Eventbrite API Fetch Error:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="SelfCarePage"
      style={{
        paddingBottom: '80px', // Ensures content isn't covered by fixed bottom NavBar
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <h1 className="SelfCareHeader">Self Care Zone</h1>
      <p className="SelfCareSubheading">
        Want to check out mental health events near you?
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
            placeholder="e.g. 78717"
            className="ZipInput"
          />
          <button type="submit" className="SearchButton" aria-label="Submit search">
            <MagnifyingGlass size={18} weight="bold" />
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="ResultsSection">
        {!hasSearched ? (
          <p style={{ color: 'rgb(181, 155, 127)' }}>
            search results...
          </p>
        ) : loading ? (
          <p style={{ color: 'rgb(133, 86, 60)' }}>
            Loading nearby places...
          </p>
        ) : events.length === 0 ? (
          <p style={{ color: 'rgb(133, 86, 60)' }}>
            No events found in this zip code.
          </p>
        ) : (
          <div
            className="EventsGrid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            {events.map((evt) => (
              <div
                key={evt.id}
                className="EventCard"
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid rgb(133, 86, 60)',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  textAlign: 'left',
                }}
              >
                <h3
                  className="EventTitle"
                  style={{
                    color: 'rgb(133, 86, 60)',
                    fontSize: '1.2rem',
                    margin: '0 0 0.5rem 0',
                    fontWeight: 'bold',
                  }}
                >
                  {evt.title}
                </h3>
                <p style={{ margin: '0.25rem 0', color: '#4a4a4a', fontSize: '0.95rem' }}>
                  <strong>Location:</strong> {evt.location}
                </p>
                <p style={{ margin: '0.25rem 0', color: '#4a4a4a', fontSize: '0.95rem' }}>
                  <strong>Date:</strong> {evt.date}
                </p>
                <p style={{ margin: '0.25rem 0', color: '#4a4a4a', fontSize: '0.95rem' }}>
                  <strong>Time:</strong> {evt.time}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: 'rgb(133, 86, 60)', fontWeight: 'bold' }}>
                  <strong>Cost:</strong> {evt.cost}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Therapy Support Resource */}
      <div className="ResourceCard">
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