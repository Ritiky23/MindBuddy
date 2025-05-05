import React, { useState } from "react";
import { login } from "./authServices";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css"; // CSS file for styling both Login and SignUp
import BgImage from "../assets/bg.jpg"
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
    <div style={{
        backgroundImage: `url(${BgImage})`, // Use the imported image here
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}>

<h1 style={{
           position: "absolute",
           top: "80px",
           width: "100%",
           fontFamily:'cursive',
           textAlign: "center",
           fontSize: "4rem",
           color: "#fff",
           textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
      }}>
        MindBuddy
      </h1>
        
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
    <button type="submit" className="login-button">Login</button>
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