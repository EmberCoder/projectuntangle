import './NavBar.css';

const NavBar = () => {
  return (
    <div className="navigation">
      <ul>
        <li><a href="/calendar">C</a></li>
        <li><a href="/todo">T</a></li>
        <li><a href="/journal">J</a></li>
        <li><a href="/grounding">G</a></li>
        <li><a href="/selfcare">R</a></li>
      </ul>
    </div>
  );
}

export default NavBar;

