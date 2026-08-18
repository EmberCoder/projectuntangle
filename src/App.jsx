import { useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar/NavBar';
import StressPopup from './components/StressQuestion/StressPopup';
import StressQuestion from './components/StressQuestion/StressQuestion';
import SelfCare from './selfcare';

function App() {
  const [scale, setScale] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <div>
              <div className="HomepageContent">
                <h1 className="Welcome">Welcome back, Name!</h1>

                {showQuestion && (
                  <StressQuestion
                    scale={scale}
                    setScale={setScale}
                    setShowPopup={setShowPopup}
                    setShowQuestion={setShowQuestion}
                  />
                )}

                {showPopup && (
                  <StressPopup 
                    scale={scale} 
                    setShowPopup={setShowPopup} 
                    setShowQuestion={setShowQuestion} 
                  />
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
          } 
        />
        <Route path="/selfcare" element={<SelfCare />} />
      </Routes>
    </Router>
  );
}

export default App;