import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="stage">
      <h1>Welcome back, Name!</h1>

      <h2 className="stressQuestion">How stressed are you feeling today?</h2>   
    </div>
      

      

  )
}

export default App
