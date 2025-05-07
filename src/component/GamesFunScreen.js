import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate
import './GamesFunScreen.css';
import BreathingGame from './games/BreathingGame';
import ZenSandGarden from './games/ZenSandGame';

// --- Placeholder Game Components (Replace with actual games later) ---
const PlaceholderGame = ({ gameTitle, onBack }) => (
  <div className="game-view-container fade-in">
    <button onClick={onBack} className="back-to-menu-button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
      </svg>
      Back to Games
    </button>
    <div className="game-content-area">
      <h2 className="game-title">{gameTitle}</h2>
      <div className="game-placeholder-content">
        <span className="placeholder-icon">✨</span>
        <h3>Coming Soon!</h3>
        <p>This interactive experience is being lovingly crafted for your relaxation and enjoyment.</p>
        <div className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Games Screen Component ---
const GamesFunScreen = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate(); // ✅ Initialize navigate
  // Data for the game cards
  const games = [
    {
      id: 'breathing',
      title: 'Calm Breathing',
      description: 'Sync your breath with a soothing visual guide to find peace.',
      icon: '🌬️', // You could replace these with SVG icons for more control
      color: '#a0e7e5', // Base color
      gradient: 'linear-gradient(135deg, #a0e7e5 0%, #81c7d4 100%)', // Optional gradient
    },
    {
      id: 'zenGarden',
      title: 'Zen Sand Garden',
      description: 'Create calming patterns in virtual sand. No cleanup required!',
      icon: '🏖️',
      color: '#f9d5a7',
      gradient: 'linear-gradient(135deg, #f9d5a7 0%, #e8c089 100%)',
    },
    {
      id: 'colorFlow',
      title: 'Color Flow',
      description: 'Relax by tapping to create gentle bursts of flowing colors.',
      icon: '🎨',
      color: '#f8b1cc',
      gradient: 'linear-gradient(135deg, #f8b1cc 0%, #e89cb2 100%)',
    },
    {
      id: 'soundScape',
      title: 'Nature Sounds',
      description: 'Mix calming nature sounds like rain, birds, and waves.',
      icon: '🎧',
      color: '#b3e5fc',
      gradient: 'linear-gradient(135deg, #b3e5fc 0%, #93d5fc 100%)',
    },
    {
      id: 'mindfulMatch',
      title: 'Mindful Matching',
      description: 'A gentle memory game with calming nature symbols.',
      icon: '🧩',
      color: '#c8e6c9',
      gradient: 'linear-gradient(135deg, #c8e6c9 0%, #a8d6a9 100%)',
    },
    {
      id: 'gratitudeTree',
      title: 'Gratitude Tree',
      description: 'Add leaves of gratitude to a growing digital tree.',
      icon: '🌳',
      color: '#ffd59e',
      gradient: 'linear-gradient(135deg, #ffd59e 0%, #ffc07e 100%)',
    },
  ];

  const handleSelectGame = (gameId) => setSelectedGame(gameId);
  const handleBackToMenu = () => setSelectedGame(null);

  const renderSelectedGame = () => {
    const gameData = games.find(g => g.id === selectedGame);
    const gameTitle = gameData ? gameData.title : 'Game';
    console.log('selected i get---',selectedGame);
    switch (selectedGame) {
    
      case 'breathing':
        return <BreathingGame gameTitle={gameTitle} onBack={handleBackToMenu} />;
      case 'zenGarden':
        return <ZenSandGarden gameTitle={gameTitle} onBack={handleBackToMenu} />;
      case 'colorFlow':
      case 'soundScape':
      case 'mindfulMatch':
      case 'gratitudeTree':
        return <PlaceholderGame gameTitle={gameTitle} onBack={handleBackToMenu} />;
      default:
        return null;
    }
  };

  return (
    <div className="games-fun-screen">
      {!selectedGame ? (
        <div className="game-selection-menu-wrapper">
          <div className="game-selection-menu fade-in">
            <header className="menu-header">
              <h1 className="menu-title">Mindful Activities</h1>
              <p className="menu-subtitle">
                Choose a gentle activity to relax your mind and lift your spirits.
              </p>
              <button
                className="back-to-previous-page-button"
                onClick={() => navigate(-1)} // ✅ Back to previous page
                style={{ marginBottom: '20px' }}
              >
                ← Back
              </button>
            </header>
            <div className="game-grid">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => handleSelectGame(game.id)}
                  style={{ background: game.gradient || game.color }}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleSelectGame(game.id)}
                >
                  <div className="game-card-icon-wrapper">
                    <span className="game-card-icon">{game.icon}</span>
                  </div>
                  <div className="game-card-content">
                    <h3>{game.title}</h3>
                    <p>{game.description}</p>
                  </div>
                  <div className="game-card-play-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                    </svg>
                    <span>Play</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        renderSelectedGame()
      )}
    </div>
  );
};

export default GamesFunScreen;
