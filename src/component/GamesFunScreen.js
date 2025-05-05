import React, { useState } from 'react';
import './GamesFunScreen.css'; // We'll create this CSS file next
import BreathingGame from './games/BreathingGame';

// --- Placeholder Game Components (Replace with actual games later) ---
const PlaceholderGame = ({ gameTitle, onBack }) => (
  <div className="game-view-container fade-in full-width">
    {/* Back Button positioned within the game area */}
    <button onClick={onBack} className="back-to-menu-button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
      </svg>
      Back to Games
    </button>
    <h2 className="game-title">{gameTitle}</h2>
    <div className="game-placeholder-content">
      <p>✨ Coming Soon! ✨</p>
      <p>This interactive experience is being crafted for your relaxation.</p>
    </div>
  </div>
);

// --- Main Games Screen Component ---
const GamesFunScreen = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  // Data for the game cards
  const games = [
    {
      id: 'breathing',
      title: 'Calm Breathing',
      description: 'Sync your breath with a soothing visual guide to find peace.',
      icon: '🌬️',
      color: '#a0e7e5',
    },
    {
      id: 'zenGarden',
      title: 'Zen Sand Garden',
      description: 'Create calming patterns in virtual sand. No cleanup required!',
      icon: '🏖️',
      color: '#f9d5a7',
    },
    {
      id: 'colorFlow',
      title: 'Color Flow',
      description: 'Relax by tapping to create gentle bursts of flowing colors.',
      icon: '🎨',
      color: '#f8b1cc',
    },
    {
        id: 'soundScape',
        title: 'Nature Sounds',
        description: 'Mix calming nature sounds like rain, birds, and waves.',
        icon: '🎧',
        color: '#b3e5fc',
    },
     {
        id: 'mindfulMatch',
        title: 'Mindful Matching',
        description: 'A gentle memory game with calming nature symbols.',
        icon: '🧩',
        color: '#c8e6c9',
    },
     {
        id: 'gratitudeTree',
        title: 'Gratitude Tree',
        description: 'Add leaves of gratitude to a growing digital tree.',
        icon: '🌳',
        color: '#ffd59e',
    },
  ];

  const handleSelectGame = (gameId) => {
    setSelectedGame(gameId);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  // Function to render the currently selected game component
  const renderSelectedGame = () => {
    switch (selectedGame) {
      case 'breathing':
        return <BreathingGame gameTitle="Zen Sand Garden" onBack={handleBackToMenu} />;
      case 'zenGarden':
        return <PlaceholderGame gameTitle="Zen Sand Garden" onBack={handleBackToMenu} />;
      case 'colorFlow':
        return <PlaceholderGame gameTitle="Color Flow" onBack={handleBackToMenu} />;
      case 'soundScape':
        return <PlaceholderGame gameTitle="Nature Sounds" onBack={handleBackToMenu} />;
      case 'mindfulMatch':
        return <PlaceholderGame gameTitle="Mindful Matching" onBack={handleBackToMenu} />;
      case 'gratitudeTree':
        return <PlaceholderGame gameTitle="Gratitude Tree" onBack={handleBackToMenu} />;
      default:
        return null;
    }
  };

  return (
    <div className="games-fun-screen">
      {/* Conditionally render Menu or Selected Game */}
      {!selectedGame ? (
        <div className="game-selection-menu fade-in">
          <h1 className="menu-title">Mindful Activities</h1>
          <p className="menu-subtitle">
            Choose a gentle activity to relax your mind and lift your spirits.
          </p>
          <div className="game-grid">
            {games.map((game) => (
              <div
                key={game.id}
                className="game-card"
                onClick={() => handleSelectGame(game.id)}
                style={{ '--card-bg-color': game.color }}
              >
                <div className="game-card-icon">{game.icon}</div>
                <div className="game-card-content">
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                </div>
                <div className="game-card-overlay"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        renderSelectedGame()
      )}
    </div>
  );
};

export default GamesFunScreen;
