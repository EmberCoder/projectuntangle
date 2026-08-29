import { Link } from 'react-router-dom';
import GuestButton from './components/Login/GuestButton';
import LoginButton from './components/Login/LoginButton';
import RegisterButton from './components/Login/RegisterButton';
import './login.css';


const Login = () => {
  return (
    <div>
      <h1>Welcome to Serenity</h1>
      <LoginButton />

      <RegisterButton />

      <Link to="/home" state={{ username: "Guest" }}>
        <GuestButton />
      </Link>
    </div>
  )
}

export default Login
