import './App.css';
import NavBar from './components/NavBar/NavBar';

function App() {

  return (
    <div>

      <div className="HomepageContent">
        <h1 className="Welcome">Welcome back, Name!</h1>
        <h2 className="StressQuestion">How stressed are you feeling today?</h2> 

        <NavBar/>

      </div>
    </div>
      
  );
}

export default App