import React, { useState } from "react";
import { signUp } from "./authServices";
import { useNavigate ,Link} from "react-router-dom";
import "./Auth.css"; // CSS file for styling both Login and SignUp
import BgImage from "../assets/bg.jpg"
const SignUp = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cnfpassword, setcnfPassword] = useState("");
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={cnfpassword}
          onChange={(e) => setcnfPassword(e.target.value)}
          required
        />
               <button
  type="submit"
  style={{
    backgroundColor: "#6a5acd", // Soft purple color
    color: "#fff",               // White text color
    padding: "10px 20px",        // Padding for a nice size
    border: "none",              // Removes the default border
    borderRadius: "5px",         // Rounded corners
    cursor: "pointer",           // Pointer cursor on hover
    fontSize: "1rem",            // Font size
    fontWeight: "bold",          // Bold text
    transition: "background-color 0.3s ease", // Smooth transition for hover effect
  }}
  onMouseOver={(e) => e.target.style.backgroundColor = "#483d8b"} // Darker purple on hover
  onMouseOut={(e) => e.target.style.backgroundColor = "#6a5acd"} // Original color when not hovering
>
  Sign Up
</button>
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