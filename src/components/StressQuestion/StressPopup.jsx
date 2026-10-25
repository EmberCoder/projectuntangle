import { Link } from 'react-router-dom';
import ExitButton from '../ExitButton';
import './StressPopup.css';

const StressPopup = ({ scale, setShowPopup, setShowQuestion }) => {
    return (
        <div className="StressSection">
            <h2>You rated your stress a {scale}/5. Would you like to try...</h2>
            <ExitButton onClick={() => setShowPopup(false)} />
            <Link className="OptionButtons" to="/breathingexercises">A Breathing Exercise</Link> <br />
            <Link className="OptionButtons" to="/journal">Journaling</Link>
        </div>
    );
};

export default StressPopup;