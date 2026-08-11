import { useState } from 'react';
import './App.css';
import NavBar from './components/NavBar/NavBar';
import StressPopup from './components/StressQuestion/StressPopup';
import StressQuestion from './components/StressQuestion/StressQuestion';

function App() {
  const [scale, setScale] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  return (
    <div>

      <div className="HomepageContent">
        <h1 className="Welcome">Welcome back, Name!</h1>

        { showPopup ? (
          <StressPopup scale={scale} />
        ) : (
          <StressQuestion setScale={setScale} setShowPopup={setShowPopup} scale={scale} />
        )}

        

        <NavBar />

      </div>
      
    </div>
      
  );
}

export default App;