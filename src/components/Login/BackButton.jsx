import { Link } from 'react-router-dom';
import './Login.css';

const BackButton = () => {
  return (
    <div>
      <Link className="backButton" 
        onClick={(e) => {
          e.preventDefault();
          window.history.back();
        }}
      >
        &lt; Back
      </Link>
    </div>
  );
};

export default BackButton;