import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Lottie from 'react-lottie';
import animationData from '../assets/voiceloading.json';
import BgImage from "../assets/bg.jpg";
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatWhisper = () => {
  const [response, setResponse] = useState("");
  const [isTalking, setIsTalking] = useState(false);
  const [isAIOutput, setIsAIOutput] = useState(false);  // Track if AI is talking
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const silenceTimerRef = useRef(null);

  const ELEVENLABS_API_KEY = "sk_db34e522fee623d6f46a1f701d1b0adf70a8942c790f86de";
  const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Example: "21m00Tcm4TlvDq8ikWAM"
  const genAI = new GoogleGenerativeAI("AIzaSyAJbDkGkcsmiTlb4a0eEyOnoagVnXICWKA"); // Replace with your API key

  const audioRef = useRef(null); // Ref to store the audio object

  const speakWithElevenLabs = async (text) => {
    if (!text) return;
    setIsTalking(true);
    setIsAIOutput(true);  // AI is now talking
    SpeechRecognition.stopListening(); // Stop listening while AI is speaking

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Store audio in the ref for later manipulation
      audioRef.current = audio;

      audio.onended = () => {
        setIsTalking(false);
        setIsAIOutput(false);  // AI has finished talking
        SpeechRecognition.startListening({ continuous: true, language: 'hi-IN' });  // Resume listening
      };

      audio.play();
    } catch (err) {
      console.error("Error using ElevenLabs TTS:", err);
      setIsTalking(false);
      setIsAIOutput(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();  // Pause the audio
      audioRef.current.currentTime = 0;  // Reset to the beginning
    }
    setIsTalking(false);
    setIsAIOutput(false);
    SpeechRecognition.startListening({ continuous: true, language: 'hi-IN' }); // Resume listening
  };


  const fetchResponse = async (userInput) => {
    if (isAIOutput) return;  // Don't process input while AI is talking
    SpeechRecognition.stopListening();  // Stop listening while processing

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const prompt = `
      I am going to give you some prompts, and you need to respond in a warm, conversational, and friendly manner in Hindi. Please ensure that your responses are comforting and supportive, as if you are having a genuine conversation with a friend. Also, kindly refrain from using emojis or mentioning any emoticons in your text. Keep the tone uplifting but gentle, making the person feel heard and understood. Avoid phrases like 'smiling face' or 'smiling eyes,' as these refer to emojis. Respond only with kind and thoughtful words in Hindi.
      
      My input text starts from here:-: ${userInput}`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      console.log('Gemini response:', text);
      setResponse(text);
      speakWithElevenLabs(text);
  
    } catch (error) {
      console.error("Error generating response from Gemini:", error);
      setResponse("There was an error processing your request.");
    }
  };

  const handleStartListening = () => {
    if (!isAIOutput) {
      stopAudio(); // Stop the AI voice when starting listening
      SpeechRecognition.startListening({ continuous: true, language: 'hi-IN' });
    }
  };
  

  const handleStopListening = () => {
    clearTimeout(silenceTimerRef.current);
    fetchResponse(transcript);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  useEffect(() => {
    if (transcript && !isAIOutput) {  // Don't process input if AI is talking
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        fetchResponse(transcript);
        resetTranscript();
      }, 3000);
    }
    return () => clearTimeout(silenceTimerRef.current);
  }, [transcript]);

  const stopSpeaking = () => {
    stopAudio(); 
  };

  return (
    <div
      style={{
        backgroundImage: `url(${BgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div
        style={{
          textAlign: "center",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          height: "90vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", color: "white", marginBottom: "20px" }}>MindBuddy Chat</h1>

        <p
          style={{
            fontSize: "1.2rem",
            fontStyle: "italic",
            color: "white",
            marginBottom: "20px",
          }}
        >
          "The greatest wealth is health." — Virgil
        </p>

        <div style={{ marginTop: "30px" }}>
          <Lottie
            options={{
              speed: 1,
              isPaused: !isTalking,
              animationData: animationData,
            }}
            height={400}
            width={400}
          />
        </div>

        {listening && !isAIOutput && (
          <div
            style={{
              position: "absolute",
              bottom: '20px',
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

        <div
          style={{
            position: "absolute",
            top: "80%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "10px",
            borderRadius: "12px",
            fontSize: "1.2rem",
          }}
        >
          {transcript && <strong>User: </strong>}
          {transcript}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <button
            onClick={handleStartListening}
            style={btnStyle}
          >
            🎤 Start Listening
          </button>
          <button
            onClick={handleStopListening}
            style={btnStyle}
          >
            🛑 Stop Listening
          </button>
          <button
            onClick={stopSpeaking}
            style={btnStyle}
          >
            ❌ Stop Speaking
          </button>
        </div>
      </div>
    </div>
  );
};

const btnStyle = {
  background: "linear-gradient(145deg, #9c27b0, #7a1b9c)",
  color: "white",
  border: "none",
  borderRadius: "50px",
  padding: "1rem 1rem",
  fontSize: "1.2rem",
  cursor: "pointer",
  transition: "0.3s",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

export default ChatWhisper;
