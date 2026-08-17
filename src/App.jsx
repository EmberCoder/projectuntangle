import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar/NavBar';
import SelfCare from './selfcare';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <div>
              <div className="HomepageContent">
                <h1 className="Welcome">Welcome back, Name!</h1>
                <h2 className="StressQuestion">How stressed are you feeling today?</h2> 

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

                <NavBar/>
              </div>
            </div>
          } 
        />
        <Route path="/selfcare" element={<SelfCare />} />
      </Routes>
    </Router>
  );
}

export default App;