import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "../src/component/Login";
import SignUp from "../src/component/SignUp";
import HomeScreen from "../src/component/HomeScreen";
import ChatWhisper from "./component/ChatWhisper";
import Questionnaire from "./component/Questionnaire";
import CommunityScreen from "./component/CommunityScreen";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login setAuth={setIsAuthenticated} />}
        />
        <Route path="/community" element={<CommunityScreen/>} />
          <Route path="/chatwhisper" element={<ChatWhisper/>} />
          <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/signup" element={<SignUp setAuth={setIsAuthenticated} />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/home" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
