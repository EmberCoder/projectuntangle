import ExitButton from '../ExitButton';
import './GuestPopup.css';

const GuestPopup = ({ setShowGuestPopup }) => {
    const handleClose = () => {
        setShowGuestPopup(false);
    };
    
    return (
         <div className="guestPopup">
            <h2 className="guestPopupTitle">You are in Guest Mode</h2>
            <p>Your data will not be saved or accessible on other devices. If you would like to access the full features of Serenity, please log in or create an account!</p>
             <ExitButton onClick={handleClose} />
        </div>

    );
};

export default GuestPopup;