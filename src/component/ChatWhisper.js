import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { GoogleGenerativeAI } from '@google/generative-ai';
import Lottie from 'react-lottie'; // Import the Lottie component
import animationData from '../assets/voiceloading.json'; // Import the Lottie JSON animation

const ChatWhisper = () => {
  const [response, setResponse] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const genAI = new GoogleGenerativeAI("AIzaSyAJbDkGkcsmiTlb4a0eEyOnoagVnXICWKA"); // Replace with your API key
  const silenceTimerRef = useRef(null);
  const voicesRef = useRef([]);
  const [isTalking, setIsTalking] = useState(false); // Track AI's talking state

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = speechSynthesis.getVoices();
      setSelectedVoice(voicesRef.current[0] || null); // Set default to first available voice
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices; // Update when voices change
  }, []);

  const pop = "बिल्कुल! आपसे हिंदी में बात करना अच्छा लगेगा। बताइए, आप क्या जानना या चर्चा करना चाहते हैं?";

  // Function to handle the response in a chosen voice
  const speakResponse = (text) => {
    if (!text) return;

    window.responsiveVoice.speak(
      text,
      "Hindi Female", // Use Hindi Female voice
      {
        rate: 0.9,
        pitch: 1,
        volume: 0.8,
        onstart: () => setIsTalking(true), // Set AI talking state to true
        onend: () => {
          setIsTalking(false); // Stop talking animation
          SpeechRecognition.startListening({ continuous: true }); // Resume listening
        },
      }
    );
  };

  // Fetch response and stop listening when AI is talking
  const fetchResponse = async (userInput) => {
    SpeechRecognition.stopListening();
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Respond in a conversational and friendly way and don't write emojis in response This is UserInput:-: ${userInput}`;
      const result = await model.generateContent(prompt);

      const text = await result.response.text();
      console.log('texst',text);
      setResponse(text);
      speakResponse(text); // Speak out the response
    } catch (error) {
      console.error("Something went wrong:", error);
      setResponse("There was an error processing your request.");
    }
  };

  // Handle start and stop listening
  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStopListening = () => {
    clearTimeout(silenceTimerRef.current);
    fetchResponse(transcript);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  // Detect silence and fetch response after 3 seconds of inactivity
  useEffect(() => {
    if (transcript) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        fetchResponse(transcript);
        resetTranscript();
      }, 3000); // 3 seconds of silence
    }
    return () => clearTimeout(silenceTimerRef.current);
  }, [transcript]);

  // Change the selected voice based on user choice
  const handleVoiceChange = (event) => {
    const selectedVoiceIndex = event.target.value;
    setSelectedVoice(voicesRef.current[selectedVoiceIndex]);
  };

  return (
    <div
      style={{
        textAlign: "center",
        background: "linear-gradient(145deg, #f3e9ff, #e0d4f7)",
        borderRadius: "12px",
        padding: "30px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        height: "90vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background cliparts/stickers */}
      <img
        src="https://path/to/clipart1.png"
        alt="Background Sticker 1"
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          opacity: 0.2,
          zIndex: -1,
        }}
      />
      <img
        src="https://path/to/clipart2.png"
        alt="Background Sticker 2"
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          opacity: 0.2,
          zIndex: -1,
        }}
      />

      <h1 style={{ fontSize: "2.5rem", color: "#6a0dad", marginBottom: "20px" }}>MindBuddy Chat</h1>
      
      {/* Stylish quote */}
      <p
        style={{
          fontSize: "1.2rem",
          fontStyle: "italic",
          color: "#9c27b0",
          marginBottom: "20px",
        }}
      >
        "The greatest wealth is health." — Virgil
      </p>

      {/* Lottie Animation */}
      <div style={{ marginTop: "30px" }}>
        <Lottie
          options={{
            speed: 1,
            isPaused: !isTalking, // Pause animation when AI is not talking
            animationData: animationData, // Lottie JSON animation data
          }}
          height={400} // Increased size
          width={400}  // Increased size
        />
      </div>

      {/* Visual indicator for AI listening */}
      {listening && (
        <div
          style={{
            position: "absolute",
            bottom:'20px',
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 255, 0, 0.6)",
            color: "white",
            padding: "10px",
            borderRadius: "12px",
            fontSize: "1.2rem",
          }}
        >
          AI is Listening...
        </div>
      )}

      {/* Buttons for listening */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button
          onClick={handleStartListening}
          style={{
            background: "linear-gradient(145deg, #9c27b0, #7a1b9c)",
            color: "white",
            border: "none",
            borderRadius: "1000px",
            padding: "1rem 1rem",
            fontSize: "1.2rem",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
        🎤 Start Listening
        </button>
        <button
          onClick={handleStopListening}
          style={{
            background: "linear-gradient(145deg, #9c27b0, #7a1b9c)",
            color: "white",
            border: "none",
            borderRadius: "50px",
            padding: "1rem 1rem",
            fontSize: "1.2rem",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          🛑 Stop Listening
        </button>
      </div>
    </div>
  );
};

export default ChatWhisper;
