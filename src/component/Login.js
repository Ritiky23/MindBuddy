import React, { useState } from "react";
import { login } from "./authServices";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css"; // CSS file for styling both Login and SignUp

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
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
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        Don’t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
    </div>
  );
};

export default Login;