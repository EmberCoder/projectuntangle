import './Login.css';

const EmailLogin = ({ email, password, setEmail, setPassword, handleEmailAuth, isSignUp }) => {
  return (
       <div>
        <form onSubmit={handleEmailAuth}>
          <div>
            <input className="inputField"
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <input className="inputField"
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="emailLoginButton">
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
      </div>
  )
}

export default EmailLogin
