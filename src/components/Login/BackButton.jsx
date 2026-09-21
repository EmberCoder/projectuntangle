import { Link } from 'react-router-dom';
import './Login.css';

const BackButton = () => {
  return (
    <div>
      <Link className="backButton" to="/">
        &lt; Back to Login
      </Link>
    </div>
  );
};

export default BackButton;