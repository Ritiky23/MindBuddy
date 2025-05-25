// Questionnaire.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Questionnaire.css'; // We'll create/update this
import BgImage from "../assets/bg.jpg"; // Make sure this path is correct

// Define questions with options and weights
const questions = [
  { question: 'How often do you feel anxious?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'Do you find it hard to relax?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'How often do you feel down or sad?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'Do you often feel overwhelmed by stress?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'Do you avoid social situations because of anxiety?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'Do you experience physical symptoms like a racing heart?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'How often do you feel like you can’t control your worries?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'Do you feel tired even after a full night’s sleep?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'Do you have trouble concentrating because of your thoughts?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
  { question: 'Do you often feel hopeless about the future?', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], weight: [0, 1, 2, 3, 4] },
];

// Animation duration should match CSS transition
const TRANSITION_DURATION = 300; // ms

const Questionnaire = () => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isFading, setIsFading] = useState(false); // Manages fade transitions

  const navigate = useNavigate();

  // Handle starting the questionnaire from the welcome screen
  const handleStart = () => {
    setIsFading(true); // Fade out welcome screen
    setTimeout(() => {
      setIsStarted(true);
      setIsFading(false); // Fade in first question
    }, TRANSITION_DURATION);
  };

  // Handle selecting an answer option
  const handleAnswerChange = (selectedOptionIndex) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = selectedOptionIndex;
    setAnswers(updatedAnswers);

    // Auto-advance or submit after answering
    if (currentQuestionIndex < questions.length - 1) {
      setIsFading(true); // Fade out current question
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsFading(false); // Fade in next question
      }, TRANSITION_DURATION);
    } else {
       // Auto-submit on the last question answer
       handleSubmit(updatedAnswers);
    }
  };

  // Handle moving to the previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsFading(true); // Fade out current question
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setIsFading(false); // Fade in previous question
      }, TRANSITION_DURATION);
    }
  };

  // Handle submitting the questionnaire and calculating score
  const handleSubmit = (finalAnswers = answers) => {
    let totalScore = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer !== null) {
        totalScore += questions[index].weight[answer];
      }
    });
    setScore(totalScore);
    setIsFading(true); // Fade out last question/submit state
    setTimeout(() => {
      setShowResults(true);
      setIsFading(false); // Fade in results
    }, TRANSITION_DURATION);
  };

  // Handle retaking the questionnaire
  const handleRetake = () => {
    setIsFading(true); // Fade out results
    setTimeout(() => {
      setAnswers(Array(questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setScore(null);
      setShowResults(false);
      setIsStarted(true); // Stay on questionnaire flow (starts with index 0)
      setIsFading(false); // Fade in first question
    }, TRANSITION_DURATION);
  };

  // Handle navigating back to the home page
  const handleBackToHome = () => {
     setIsFading(true); // Fade out current view (results)
     setTimeout(() => {
        navigate('/');
     }, TRANSITION_DURATION);
  };

  // Calculate visual progress for the progress bar
  const visualProgress = showResults ? 100 : (currentQuestionIndex / questions.length) * 100;

  // --- Conditional Rendering ---

  // Welcome Screen
  if (!isStarted) {
    return (
      <div className="questionnaire-wrapper" style={{ backgroundImage: `url(${BgImage})` }}>
        <div className="questionnaire-overlay">
          <div className={`welcome-screen card ${isFading ? 'fade-out' : 'fade-in'}`}> {/* Added 'card' and fade classes */}
            <h1>Mind Wellness Check-in</h1>
            <p>Take a few moments to reflect on your feelings. This short questionnaire can help you understand your current emotional state.</p>
            <button onClick={handleStart} className="action-button start-button">
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    let resultMessage = '';
    let advice = '';
    // Determine result message and advice based on score ranges
    // (Using score directly for simplicity, adjust ranges as needed)
    if (score <= 10) {
      resultMessage = 'You seem to be doing well.';
      advice = 'Continue practicing self-care and maintaining your healthy habits. If anything changes, don\'t hesitate to check in again.';
    } else if (score <= 20) {
      resultMessage = 'You might be experiencing some mild stress or anxiety.';
      advice = 'Consider exploring mindfulness techniques, ensuring you get enough rest, and talking to a trusted friend or family member. If these feelings persist or worsen, professional guidance could be beneficial.';
    } else if (score <= 30) {
      resultMessage = 'You might be experiencing moderate anxiety or depression.';
      advice = 'It’s important to address these feelings. Reaching out to a mental health professional for support and guidance is highly recommended. You don\'t have to go through this alone.';
    } else { // score > 30
      resultMessage = 'You might be experiencing significant anxiety or depression.';
      advice = 'Please seek professional help as soon as possible. A therapist or counselor can provide you with the support and strategies needed to improve your well-being. Your mental health is important.';
    }

    return (
      <div className="questionnaire-wrapper" style={{ backgroundImage: `url(${BgImage})` }}>
        <div className="questionnaire-overlay">
          <div className={`results-container card ${isFading ? 'fade-out' : 'fade-in'}`}>
            <h2>Assessment Complete</h2>
            <div className="score-display">
              Your Score: <span>{score}</span>
            </div>
            <p className="result-interpretation">{resultMessage}</p>
            <p className="result-advice">{advice}</p>
            <div className="result-actions">
              <button onClick={handleRetake} className="action-button">
                Retake Assessment
              </button>
              <button onClick={handleBackToHome} className="action-button secondary">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire Questions Screen
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="questionnaire-wrapper" style={{ backgroundImage: `url(${BgImage})` }}>
      <div className="questionnaire-overlay">
        <div className={`questionnaire-card card ${isFading ? 'fade-out' : 'fade-in'}`}>
          <div className="progress-bar-container">
            {/* Use visualProgress for smooth transition */}
            <div className="progress-bar" style={{ width: `${visualProgress}%` }}></div>
          </div>
          <div className="question-header">
            <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
          </div>
          <p className="question-text">{currentQuestion.question}</p>
          <div className="options-grid">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                className={`option-button ${answers[currentQuestionIndex] === i ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(i)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="navigation-buttons">
            {/* Show Previous button if not on the first question */}
            {currentQuestionIndex > 0 && (
              <button
                className="action-button secondary prev-button"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}
            {/* Removed explicit Submit button as it auto-submits on last answer */}
            {/* If you prefer a manual submit button:
            {answers[currentQuestionIndex] !== null && currentQuestionIndex === questions.length - 1 && (
              <button className="action-button submit-button" onClick={handleSubmit}>
                View Results
              </button>
            )}
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;