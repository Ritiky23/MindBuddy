import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Lottie from 'react-lottie';
import animationData from '../assets/voiceloading.json'; // Ensure path is correct
import BgImage from "../assets/bg.jpg"; // Ensure path is correct
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ChatWhisper.css'; // Your existing CSS for internal elements
import { FaMicrophone, FaPaperPlane, FaVolumeMute, FaLanguage } from 'react-icons/fa'; // Added FaLanguage

// --- Language Configuration ---
const langConfig = {
  hi: {
    code: 'hi-IN',
    speechRecLang: 'hi-IN',
    geminiLangInstruction: 'Hindi (in Devanagari script)',
    elevenLabsModel: 'eleven_multilingual_v2', // Or a specific Hindi model if preferred
    ui: {
      title: "MindBuddy Chat",
      quote: "\"The greatest wealth is health.\" — Virgil",
      startChat: "चैट शुरू करें",
      send: "भेजें",
      muteAI: "AI को म्यूट करें",
      ready: "तैयार। चैट शुरू करें या सुनें तो बोलें।",
      listeningSpeakNow: "सुन रहा हूँ... अब बोलें।",
      listeningInProgress: "सुन रहा हूँ...",
      thinking: "माइंडबडी सोच रहा है...",
      preparingAudio: "माइंडबडी ऑडियो तैयार कर रहा है...",
      speaking: "माइंडबडी बोल रहा है...",
      initialGreeting: "नमस्ते! आप कैसे हैं?",
      userLabel: "आप:",
      aiLabel: "माइंडबडी:",
      langSwitchTo: "Switch to English",
      errorGeneral: "माफ़ कीजिए, कुछ गड़बड़ हो गई।",
      errorTTS: "(क्षमा करें, मैं वह नहीं बोल सका।)",
      errorGemini: "माफ़ कीजिए, मुझे आपकी बात समझने में कुछ परेशानी हो रही है।",
      browserNoSupport: "आपका ब्राउज़र वाक् पहचान का समर्थन नहीं करता है।"
    }
  },
  en: {
    code: 'en-US',
    speechRecLang: 'en-US',
    geminiLangInstruction: 'English',
    elevenLabsModel: 'eleven_multilingual_v2', // Or a specific English model
    ui: {
      title: "MindBuddy Chat",
      quote: "\"The greatest wealth is health.\" — Virgil",
      startChat: "Start Chat",
      send: "Send",
      muteAI: "Mute AI",
      ready: "Ready. Press Start Chat or speak if listening.",
      listeningSpeakNow: "Listening... speak now.",
      listeningInProgress: "Listening...",
      thinking: "MindBuddy is thinking...",
      preparingAudio: "MindBuddy is preparing audio...",
      speaking: "MindBuddy is speaking...",
      initialGreeting: "Hello! How are you today?",
      userLabel: "You:",
      aiLabel: "MindBuddy:",
      langSwitchTo: "हिंदी में बदलें",
      errorGeneral: "Sorry, something went wrong.",
      errorTTS: "(Sorry, I couldn't speak that.)",
      errorGemini: "Sorry, I'm having a little trouble understanding you.",
      browserNoSupport: "Your browser doesn't support speech recognition."
    }
  }
};


const ChatWhisper = () => {
  const [currentLanguage, setCurrentLanguage] = useState('hi'); // Default to Hindi
  const [conversation, setConversation] = useState([]);
  const [isTalking, setIsTalking] = useState(false);
  const [isAIOutput, setIsAIOutput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const uiText = langConfig[currentLanguage].ui;

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const silenceTimerRef = useRef(null);
  const audioRef = useRef(null);
  const conversationLogRef = useRef(null);

  const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY || "sk_ab76719c71fcd8a604b15d03771748aad666195590059bf3";
  const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // This voice ID needs to be good for both languages or managed per language
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyAJbDkGkcsmiTlb4a0eEyOnoagVnXICWKA";
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  useEffect(() => {
    if (conversationLogRef.current) {
      conversationLogRef.current.scrollTop = conversationLogRef.current.scrollHeight;
    }
  }, [conversation, transcript]);

  // Set initial greeting when language changes and conversation is empty
  useEffect(() => {
    if (conversation.length === 0 && !listening && !isProcessing && !isAIOutput) {
        addMessageToConversation('ai', uiText.initialGreeting);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, uiText.initialGreeting]); // Only re-run if language or initial greeting text changes


  const addMessageToConversation = (type, text) => {
    setConversation(prev => [...prev, { id: Date.now(), type, text }]);
  };

  const speakWithElevenLabs = async (text) => {
    if (!text) {
      setIsProcessing(false);
      return;
    }
    setIsTalking(true);
    setIsAIOutput(true);
    setIsProcessing(false);
    SpeechRecognition.stopListening();

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY },
        body: JSON.stringify({
          text: text,
          model_id: langConfig[currentLanguage].elevenLabsModel,
          voice_settings: { stability: 0.55, similarity_boost: 0.7 }, // Fine-tune settings
        }),
      });
      if (!response.ok) throw new Error(`${uiText.errorTTS} (ElevenLabs: ${response.statusText})`);
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsTalking(false);
        setIsAIOutput(false);
      };
      audio.play().catch(e => { throw new Error(`${uiText.errorTTS} (Playback)`); });

    } catch (err) {
      console.error("Error using ElevenLabs TTS:", err);
      addMessageToConversation('ai', `${err.message || uiText.errorTTS}`);
      setIsTalking(false);
      setIsAIOutput(false);
      setIsProcessing(false);
    }
  };

  const stopAISpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsTalking(false);
    setIsAIOutput(false);
  };

  const fetchResponseFromGemini = async (userInput) => {
    if (isAIOutput || !userInput.trim()) {
      if(!userInput.trim()) resetTranscript();
      return;
    }
    SpeechRecognition.stopListening();
    setIsProcessing(true);
    addMessageToConversation('user', userInput);
    resetTranscript();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
      You are MindBuddy, a warm, empathetic, and supportive AI companion.
      Respond ONLY in conversational ${langConfig[currentLanguage].geminiLangInstruction}.
      Be comforting and understanding, like a friend.
      Do NOT use emojis or mention emoticons (e.g., "smiling face").
      Keep your tone uplifting but gentle. Make the user feel heard.
      If the user's input is very short or unclear, you can gently ask for more details or offer a general comforting phrase in ${langConfig[currentLanguage].geminiLangInstruction}.
      User's input: ${userInput}`;

      const result = await model.generateContent(prompt);
      const aiText = await result.response.text();
      addMessageToConversation('ai', aiText);
      await speakWithElevenLabs(aiText);
  
    } catch (error) {
      console.error("Error generating response from Gemini:", error);
      addMessageToConversation('ai', `${uiText.errorGemini} (Error: ${error.message || 'API Error'})`);
      setIsProcessing(false);
    }
  };

  const handleStartListening = (clearConv = true) => {
    if (isAIOutput || isProcessing) return;
    stopAISpeech();
    resetTranscript();
    if (clearConv) {
        setConversation([]); // Clears log, useEffect will add new initial greeting
    }
    SpeechRecognition.startListening({ 
        continuous: true, 
        language: langConfig[currentLanguage].speechRecLang 
    });
  };
  
  const handleStopListeningAndProcess = () => {
    clearTimeout(silenceTimerRef.current);
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      fetchResponseFromGemini(transcript);
    }
  };

  useEffect(() => {
    if (listening && transcript.trim() && !isAIOutput && !isProcessing) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if(listening) {
            SpeechRecognition.stopListening();
            fetchResponseFromGemini(transcript);
        }
      }, 2500);
    }
    return () => clearTimeout(silenceTimerRef.current);
  }, [transcript, listening, isAIOutput, isProcessing, currentLanguage]); // Added currentLanguage dependency

  const handleLanguageSwitch = () => {
    stopAISpeech();
    SpeechRecognition.stopListening();
    resetTranscript();
    setConversation([]); // Clear conversation for a fresh start in new language
    setCurrentLanguage(prevLang => (prevLang === 'hi' ? 'en' : 'hi'));
  };


  const lottieIsActuallyActive = listening || isProcessing || isTalking;
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
        <div style={{ backgroundImage: `url(${BgImage})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
            <div style={{ textAlign: "center", borderRadius: "12px", padding: "20px", boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", backgroundColor: 'rgba(40, 40, 70, 0.91)', backdropFilter: 'blur(5px)' }}>
                <p style={{color: 'white', margin: 'auto'}}>{uiText.browserNoSupport || "Browser doesn't support speech recognition."}</p>
            </div>
        </div>
    );
  }

  let statusText = uiText.ready;
  let statusClass = "";
  if (isProcessing) { statusText = uiText.thinking; statusClass = "processing"; }
  else if (isAIOutput && !isTalking) { statusText = uiText.preparingAudio; statusClass = "processing"; }
  else if (isTalking) { statusText = uiText.speaking; statusClass = "speaking"; }
  else if (listening && !transcript.trim()) { statusText = uiText.listeningSpeakNow; statusClass = "listening"; }
  else if (listening && transcript.trim()) { statusText = uiText.listeningInProgress; statusClass = "listening"; }


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
          padding: "20px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Your original shadow
          height: "90vh",
          width: "clamp(350px, 90vw, 600px)",
          position: "relative",
          overflow: "hidden",
          backgroundColor: 'rgba(40, 40, 70, 0.91)', // Your existing background
          backdropFilter: 'blur(5px)',
        }}
      >
        <div className="chat-whisper-content-wrapper">
       
          <header className="chat-header-internal">
            <h1 style={{ fontSize: "2.2rem", color: "white", marginBottom: "5px" }}>{uiText.title}</h1>
            <p className="quote-internal" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.8)"}}>
              {uiText.quote}
            </p>
          </header>

          <div className={`visualizer-area-internal ${lottieIsActuallyActive ? 'active' : ''}`}>
            <Lottie options={defaultLottieOptions} isPaused={!lottieIsActuallyActive} />
          </div>
          
          <div className="conversation-log-internal" ref={conversationLogRef}>
            {/* Initial greeting is now handled by useEffect based on currentLanguage */}
            {conversation.map((msg) => (
              <div key={msg.id} className={`message-bubble-internal ${msg.type}`}>
                <strong>{msg.type === 'user' ? uiText.userLabel : uiText.aiLabel}</strong>
                {msg.text}
              </div>
            ))}
            {listening && transcript && (
              <div className="message-bubble-internal user" style={{opacity: 0.7}}>
                <strong>{uiText.userLabel}</strong>
                <em>{transcript}</em>
              </div>
            )}
          </div>
          
          <div className={`status-indicator-internal ${statusClass}`}>
            {statusText}
          </div>

          <div className="controls-internal">
            <button
              onClick={() => handleStartListening(true)} // Pass true to clear conversation
              className="chat-button-internal"
              disabled={listening || isAIOutput || isProcessing}
            >
              <FaMicrophone className="icon" /> {uiText.startChat}
            </button>
            <button
              onClick={handleStopListeningAndProcess}
              className="chat-button-internal"
              disabled={(!listening && !transcript.trim()) || isAIOutput || isProcessing}
            >
              <FaPaperPlane className="icon" /> {uiText.send}
            </button>
            <button
              onClick={stopAISpeech}
              className="chat-button-internal"
              disabled={!isTalking && !isAIOutput}
            >
              <FaVolumeMute className="icon" /> {uiText.muteAI}
            </button>
            <div className="language-switcher-container">
            <button onClick={handleLanguageSwitch} className="language-switch-button">
              <FaLanguage style={{ marginRight: '5px' }} /> {uiText.langSwitchTo}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWhisper;