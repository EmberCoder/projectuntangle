import ExitButton from '../ExitButton';
import './StressPopup.css';

const StressPopup = ({ scale, setShowPopup, setShowQuestion }) => {
    const handleClose = () => {
        setShowPopup(false);
        setShowQuestion(false);
    }
    
    return (
        <div className="StressSection">
            <h2>You rated your stress a {scale}/5. Would you like to try...</h2>
            <ExitButton onClick={() => setShowPopup(false)} />
            <button className="OptionButtons">A Breathing Exercise</button> <br />
            <button className="OptionButtons">Journaling</button> <br />
            <button className="OptionButtons">A Grounding Exercise</button>
        </div>
    );
};

export default StressPopup;