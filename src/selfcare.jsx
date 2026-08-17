import React, { useState } from 'react';
import './selfcareapp.css';
import { MagnifyingGlass } from 'phosphor-react';
import NavBar from './components/NavBar/NavBar';

// Make sure 'export default' is present right here:
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (zipCode.trim() !== '') {
      setLoading(true);
      setHasSearched(true);
      setTimeout(() => {
        setEvents([]);
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="SelfCarePage">
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
          <div>
            {events.map((evt) => (
              <div key={evt.id} className="EventCard">
                <div>
                  <h3 className="EventTitle">{evt.title}</h3>
                  <p className="EventLocation">{evt.location}</p>
                  <p className="EventDate">{evt.date}</p>
                </div>
                <img src={evt.imageUrl} alt={evt.title} className="EventImage" />
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

      <NavBar />
    </div>
  );
}