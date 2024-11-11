import React, { useState } from "react";
import { signUp } from "./authServices";
import { useNavigate ,Link} from "react-router-dom";
import "./Auth.css"; // CSS file for styling both Login and SignUp

const SignUp = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      setAuth(true);
      navigate("/home");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={{  background: 'linear-gradient(145deg, #e0d4f7, #f3e9ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',}} >
        <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        Already have account?<Link to="/Login">Login</Link>
      </p>
    </div>
    </div>
    
  );
};

export default SignUp;