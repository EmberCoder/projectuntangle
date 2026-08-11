import './StressPopup.css';


const StressPopup = ({ scale }) => {
    return (
        <div class="StressSection">
            <h2>You rated your stress a {scale}/5. Would you like to try...</h2>
            <button className="OptionButtons">A Breathing Exercise</button> <br />
            <button className="OptionButtons">Journaling</button> <br />
            <button className="OptionButtons">A Grounding Exercise</button>
        </div>
    );
};

export default StressPopup;