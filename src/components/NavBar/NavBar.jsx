import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <div className="navigation">
          <ul>
            <li><Link to="/calendar">C</Link></li>
            <li><Link to="/tasks">T</Link></li>
            <li><Link to="/journal">J</Link></li>
            <li><Link to="/grounding">G</Link></li>
            <li><Link to="/selfcare">R</Link></li>
          </ul>
    </div>
  );
}

export default NavBar
