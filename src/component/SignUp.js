import React, { useState } from "react";
import { signUp } from "./authServices"; // Assuming this path is correct
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css"; // Reusing the same enhanced CSS file
import BgImage from "../assets/bg.jpg"; // Ensure this path is correct
import { FaEnvelope, FaLock, FaUserPlus, FaUser } from 'react-icons/fa'; // Added FaUser for a potential name field

const SignUp = ({ setAuth }) => {
  // Optional: Add a name field for a more complete signup
  // const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Corrected variable name
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) { // Basic password length validation
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    try {
      // If you add a name field, pass it to your signUp service:
      // await signUp(name, email, password);
      await signUp(email, password); // Assuming signUp service handles actual auth
      setAuth(true); // Update auth state in App.js
      navigate("/home"); // Or to a dashboard or profile setup
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Sign up failed. Please try again.";
      setError(errorMessage);
    }
    setIsLoading(false); // Ensure this is always called
  };

  return (
    <div className="auth-page-wrapper" style={{ backgroundImage: `url(${BgImage})` }}>
      <div className="auth-overlay">
        {/* Animated Background Elements (same as Login) */}
        <div className="animated-shape shape-1"></div>
        <div className="animated-shape shape-2"></div>
        <div className="animated-shape shape-3"></div>
        <div className="animated-shape shape-4"></div>

        <div className="auth-card" data-aos="fade-up" data-aos-delay="100">
          <div className="auth-header">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Join Mind Buddy and start your wellness journey today.</p>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="auth-form">
            {/* Optional: Name Field
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                id="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Full Name"
              />
              <label htmlFor="name" className="input-label">Full Name</label>
            </div>
            */}
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <>
  <style>
    {`
      #email-signup::placeholder {
        color: grey;
        opacity: 1;
      }
    `}
  </style>

  <input
    id="email-signup" // Use unique IDs if Login and SignUp could ever be on the same page (unlikely but good practice)
    type="email"
    placeholder="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    aria-label="Email Address"
    style={{color:'white'}}
  />
</>

              <label htmlFor="email-signup" className="input-label">Email Address</label>
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <>
  <style>
    {`
      #password-signup::placeholder {
        color: grey;
        opacity: 1;
      }
    `}
  </style>

  <input
    id="password-signup"
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    aria-label="Password"
    style={{color:'white'}}
  />
</>

              <label htmlFor="password-signup" className="input-label">Password</label>
            </div>
            <div className="input-group">
              <FaLock className="input-icon" /> {/* You can use a different icon for confirm password if desired */}

              <>
  <style>
    {`
      #confirm-password-signup::placeholder {
        color: grey;
        opacity: 1;
      }
    `}
  </style>

  <input
    id="confirm-password-signup"
    type="password"
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    aria-label="Confirm Password"
    style={{color:'white'}}
  />
</>

              <label htmlFor="confirm-password-signup" className="input-label">Confirm Password</label>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <FaUserPlus style={{ marginRight: '8px' }} /> Sign Up
                </>
              )}
            </button>
          </form>
          <p className="switch-auth-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
        <p className="auth-page-brand-title">Mind Buddy</p>
      </div>
    </div>
  );
};

export default SignUp;