import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Questionnaire.css';

const Questionnaire = () => {
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(null);
  
  const navigate = useNavigate(); // Initialize the navigate function

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

  const handleAnswerChange = (questionIndex, selectedOption) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = selectedOption;
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    answers.forEach((answer, index) => {
      if (answer !== null) {
        totalScore += questions[index].weight[answer];
      }
    });
    setScore(totalScore);
  };

  const handleBackToHome = () => {
    navigate('/'); // Navigate to the home screen
  };

  return (
    <div className="questionnaire-container">
      <h1>Questionnaire on Anxiety & Depression</h1>
      
      {/* Back Button */}
      
      <div className="question-box">
        <p className="question-text">{questions[currentQuestionIndex].question}</p>
        <div className="options">
          {questions[currentQuestionIndex].options.map((option, i) => (
            <label
              key={i}
              className={`option-label ${answers[currentQuestionIndex] === i ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={`question${currentQuestionIndex}`}
                value={i}
                checked={answers[currentQuestionIndex] === i}
                onChange={() => handleAnswerChange(currentQuestionIndex, i)}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="navigation-buttons">
          {currentQuestionIndex < questions.length - 1 && (
            <button className="next-btn" onClick={handleNextQuestion}>Next</button>
          )}
          {currentQuestionIndex === questions.length - 1 && (
            <button className="submit-btn" onClick={calculateScore}>Submit</button>
          )}
        </div>
      </div>

      {score !== null && (
        <div className="result-box">
          <h2>Your Anxiety Score: {score}</h2>
          <p>{score <= 10 ? 'You seem to be doing well.' : score <= 20 ? 'You might be experiencing some anxiety or stress.' : 'You might be experiencing significant anxiety or depression. It is recommended to consult a professional.'}</p>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
