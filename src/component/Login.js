import React, { useState } from "react";
import { login } from "./authServices";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css"; // Styles will be significantly updated
import BgImage from "../assets/bg.jpg";
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      setAuth(true);
      navigate("/home");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    }
    setIsLoading(false); // Ensure this is always called
  };

  return (
    <div className="auth-page-wrapper" style={{ backgroundImage: `url(${BgImage})` }}>
      <div className="auth-overlay">
      <p className="auth-page-brand-title">Mind Buddy</p>
        {/* Animated Background Elements */}
        <div className="animated-shape shape-1"></div>
        <div className="animated-shape shape-2"></div>
        <div className="animated-shape shape-3"></div>
        <div className="animated-shape shape-4"></div>


        <div className="auth-card" data-aos="fade-up" data-aos-delay="100">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to access your Mind Buddy space.</p>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <>
  <style>
    {`
      #email::placeholder {
        color: grey;
        opacity: 1;
      }
    `}
  </style>

  <input
    id="email"
    type="email"
    placeholder="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    aria-label="Email Address"
    style={{color:'white'}}
  />
</>

              <label htmlFor="email" className="input-label">Email Address</label>
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <>
  <style>
    {`
      #password::placeholder {
        color: grey;
        opacity: 1;
      }
    `}
  </style>

  <input
    id="password"
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    aria-label="Password"
    style={{color:'white'}}
  />
</>

              <label htmlFor="password" className="input-label">Password</label>
            </div>
            <div className="form-options">
              {/* <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label> */}
              <Link to="/forgot-password"className="forgot-password-link">Forgot Password?</Link>
            </div>
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Login <FaSignInAlt style={{ marginLeft: '10px' }} />
                </>
              )}
            </button>
          </form>
          <p className="switch-auth-link">
            New to Mind Buddy? <Link to="/signup">Create an Account</Link>
          </p>
        </div>
   
      </div>
    </div>
  );
};

export default Login;