import './Login.css';

const EmailLogin = ({ email, password, setEmail, setPassword, handleEmailAuth, isSignUp }) => {
  return (
       <div className="emailLogin">
        <form onSubmit={handleEmailAuth}>
          <div className="inputField">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="inputField">
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
      </div>
  )
}

export default EmailLogin
