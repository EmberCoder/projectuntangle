import { useState } from 'react';
import ExitButton from '../ExitButton';
import './StressQuestion.css';

const StressQuestion = ({setScale, setShowPopup, scale, setShowQuestion, showQuestion}) => {
    const [errorMessage, setErrorMessage] = useState(false);
    const onOptionChange = (e) => {
        setScale(e.target.value);
        setErrorMessage(false);
    }
    const handleSubmit = () => {
        if (scale === '') {
            setErrorMessage(true); 
            return;
        }
        
        if (Number(scale) >= 3) {
            setShowPopup(true);
        }
    }
    return (
        <div className="viewport">
            <div className="QuestionText">
                <h2>How stressed are you feeling today?</h2>
                <ExitButton onClick={() => setShowQuestion(false)} />

                <div className="scale">
                    <label htmlFor="scale-1">Not at all</label>
                    <input type="radio" id="scale-1" name="scale" value="1" onChange={onOptionChange}/>

                    <input type="radio" id="scale-2" name="scale" value="2" onChange={onOptionChange}/>
                    <input type="radio" id="scale-3" name="scale" value="3" onChange={onOptionChange}/>
                    <input type="radio" id="scale-4" name="scale" value="4" onChange={onOptionChange}/>

                    <input type="radio" id="scale-5" name="scale" value="5" onChange={onOptionChange}/>
                    <label htmlFor="scale-5">Very</label>

                </div>

            <div className="submit">
                <button className="SubmitButton" onClick={handleSubmit}>Submit</button>
            </div>
            
            <div className="ErrorMessage">
                {errorMessage && (
                    <p>Please select a stress level before submitting.</p>
                )}
            </div>
        </div>
    </div>
    );
};

export default StressQuestion;