import './NavBar.css';

const NavBar = () => {
  return (
    <div className="navigation">
          <ul>
            <li><a href="./calendar.jsx">C</a></li>
            <li><a href="./todo.jsx">T</a></li>
            <li><a href="./journal.jsx">J</a></li>
            <li><a href="./grounding.jsx">G</a></li>
            <li><a href="./resources.jsx">R</a></li>
          </ul>
    </div>
  );
}

export default NavBar
