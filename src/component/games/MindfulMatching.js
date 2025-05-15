import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './MindfulMatching.css';



// --- Helper: Icon Components (Place inside MindfulMatching.js or import) ---
// Replace with your preferred icons or react-icons library
const LeafIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.5 17.5 9 21M15 13C15 13 17 10.5 17 8M9 21a7.5 7.5 0 0011.727-4.273"></path></svg>;
const WaveIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6c3 0 6-3 9-3s6 3 9 3M3 12c3 0 6-3 9-3s6 3 9 3M3 18c3 0 6-3 9-3s6 3 9 3"></path></svg>;
const MountainIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18L12 4 3 20zm4.5-5l3.5-6 3.5 6h-7zm9 0l-2-3.5 2-3.5h0z"></path></svg>;
const MoonIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>;
const SunIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const StarIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const HeartIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>;
const LotusIcon = () => <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2.5 3.5-5 4-5 4s-1 6 5 12c6-6 5-12 5-12s-2.5-.5-5-4z"></path><path d="M8 14s1 4 4 4 4-4 4-4M6 18h12"></path></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"> <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /> </svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M15.312 11.342a1.25 1.25 0 01.884.884l1.296 1.296a1.25 1.25 0 11-1.768 1.768l-1.296-1.296a1.25 1.25 0 01-.884-.884 6.25 6.25 0 114.307-6.06l.75-.75a.75.75 0 111.06 1.06l-1.5 1.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.75.75a7.75 7.75 0 10-5.307 7.304 1.25 1.25 0 01-.884.884l-1.296 1.296a1.25 1.25 0 11-1.768-1.768l1.296-1.296a1.25 1.25 0 01.884-.884A6.25 6.25 0 0115.312 11.342z" clipRule="evenodd" /></svg>;

// Add more pairs as needed
const iconPairs = [
    { pairId: 'leaf', icon: <LeafIcon /> },
    { pairId: 'wave', icon: <WaveIcon /> },
    { pairId: 'mountain', icon: <MountainIcon /> },
    { pairId: 'moon', icon: <MoonIcon /> },
    { pairId: 'sun', icon: <SunIcon /> },
    { pairId: 'star', icon: <StarIcon /> },
    { pairId: 'heart', icon: <HeartIcon /> },
    { pairId: 'lotus', icon: <LotusIcon /> },
];

const CARD_FLIP_DELAY = 750; // ms delay before flipping non-matches back

// --- Utility: Fisher-Yates Shuffle ---
// --- Icon Components (Paste or import the SVGs from above here) ---
// LeafIcon, WaveIcon, MountainIcon, MoonIcon, SunIcon, StarIcon, HeartIcon, LotusIcon, BackIcon, RefreshIcon



// --- Utility: Fisher-Yates Shuffle ---
function shuffleArray(array) { /* ... copy from above ... */
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- Card Component (Inline for simplicity) ---
const Card = React.memo(({ card, onClick, isChecking }) => {
    const handleClick = () => {
        // Prevent clicking if checking, already flipped, or already matched
        if (isChecking || card.isFlipped || card.isMatched) {
            return;
        }
        onClick(card.id);
    };

    const cardInnerClass = `card-inner ${card.isFlipped ? 'is-flipped' : ''}`;
    const cardClass = `card ${card.isMatched ? 'is-matched' : ''}`;

    return (
        <div className={cardClass} onClick={handleClick} aria-label={`Card ${card.isFlipped ? card.pairId : 'hidden'}`}>
            <div className={cardInnerClass}>
                <div className="card-face card-face-back">
                    {/* Optional: Add a pattern or symbol to the card back */}
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 6a6 6 0 016 6M12 18a6 6 0 01-6-6"></path></svg>
                </div>
                <div className="card-face card-face-front">
                    {card.icon}
                </div>
            </div>
        </div>
    );
});

Card.displayName = 'Card'; // Add display name for React DevTools

Card.propTypes = {
    card: PropTypes.shape({
        id: PropTypes.number.isRequired,
        pairId: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired,
        isFlipped: PropTypes.bool.isRequired,
        isMatched: PropTypes.bool.isRequired,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    isChecking: PropTypes.bool.isRequired,
};


// --- Main Game Component ---
const MindfulMatching = ({ gameTitle, onBack }) => {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]); // Store indices of flipped cards
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isChecking, setIsChecking] = useState(false); // Prevent clicks while checking pair
    const timeoutRef = useRef(null); // Ref to store timeout ID for cleanup

    // --- Game Initialization and Restart Logic ---
    const initializeGame = useCallback(() => {
        console.log("Initializing game...");
        clearTimeout(timeoutRef.current); // Clear any pending timeouts
        const duplicatedIcons = [...iconPairs, ...iconPairs];
        const initialCards = duplicatedIcons.map((item, index) => ({
            id: index,
            pairId: item.pairId,
            icon: item.icon,
            isFlipped: false,
            isMatched: false,
        }));
        setCards(shuffleArray(initialCards));
        setFlippedIndices([]);
        setMoves(0);
        setIsWon(false);
        setIsChecking(false);
    }, []); // No dependencies, safe to run anytime

    // Initialize on mount
    useEffect(() => {
        initializeGame();
        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutRef.current);
    }, [initializeGame]); // Rerun if initializeGame changes (it won't here)

    // --- Check for Match Logic ---
    useEffect(() => {
        if (flippedIndices.length !== 2) {
            return; // Only check when exactly two cards are flipped
        }

        setIsChecking(true); // Disable clicks
        const [index1, index2] = flippedIndices;
        const card1 = cards[index1];
        const card2 = cards[index2];

        if (card1.pairId === card2.pairId) {
            // --- It's a Match! ---
            console.log("Match found!");
            setCards(prevCards =>
                prevCards.map(card =>
                    card.pairId === card1.pairId ? { ...card, isMatched: true, isFlipped: true } : card
                )
            );
             // Check for win condition immediately after setting matched state
             setFlippedIndices([]); // Clear flipped cards
             setIsChecking(false); // Re-enable clicks
        } else {
            // --- No Match ---
            console.log("No match.");
            // Flip back after a delay
            timeoutRef.current = setTimeout(() => {
                setCards(prevCards =>
                    prevCards.map((card, index) =>
                        index === index1 || index === index2 ? { ...card, isFlipped: false } : card
                    )
                );
                setFlippedIndices([]);
                setIsChecking(false); // Re-enable clicks after delay
            }, CARD_FLIP_DELAY);
        }
        setMoves(prevMoves => prevMoves + 1); // Increment moves on check

    }, [flippedIndices, cards]); // Depend on flippedIndices and cards array


    // --- Check for Win Condition ---
    useEffect(() => {
         if (cards.length > 0 && cards.every(card => card.isMatched)) {
             console.log("Game Won!");
             setIsWon(true);
         }
     }, [cards]); // Check whenever the cards state updates


    // --- Card Click Handler ---
    const handleCardClick = useCallback((cardId) => {
        // Find the index of the clicked card
        const clickedCardIndex = cards.findIndex(card => card.id === cardId);

        // Ignore clicks if checking, card already flipped/matched, or 2 cards already flipped
        if (isChecking || cards[clickedCardIndex].isFlipped || cards[clickedCardIndex].isMatched || flippedIndices.length === 2) {
            return;
        }

        // Flip the clicked card
        setCards(prevCards =>
            prevCards.map((card, index) =>
                index === clickedCardIndex ? { ...card, isFlipped: true } : card
            )
        );

        // Add index to flipped array
        setFlippedIndices(prev => [...prev, clickedCardIndex]);

    }, [cards, flippedIndices.length, isChecking]); // Depend on these states


    return (
        <div className="matching-game-container fade-in">
            {/* Header */}
            <div className="matching-game-header">
                <button onClick={onBack} className="matching-back-button" aria-label="Back to Games">
                    <BackIcon />
                    <span>Back</span>
                </button>
                <h2 className="matching-game-title">{gameTitle || 'Mindful Matching'}</h2>
                <button onClick={initializeGame} className="matching-restart-button" title="Restart Game">
                    <RefreshIcon />
                    <span>Restart</span>
                </button>
            </div>

             {/* Game Info Bar */}
             <div className="matching-game-info">
                <span>Moves: {moves}</span>
            </div>


            {/* Game Board */}
            <div className="matching-game-board">
                {cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        onClick={handleCardClick}
                        isChecking={isChecking}
                    />
                ))}
            </div>

             {/* Win Message Overlay */}
             {isWon && (
                <div className="matching-win-overlay fade-in">
                    <div className="matching-win-message">
                        <h3>Well Done!</h3>
                        <p>You found all the pairs in {moves} moves.</p>
                        <p>Take a moment to appreciate your focus.</p>
                        <button onClick={initializeGame} className="matching-restart-button large">
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions Footer (Optional) */}
            {!isWon && (
                <p className="matching-game-instructions">
                    Gently click two cards to find a matching pair. Focus on each moment.
                </p>
             )}
        </div>
    );
};

MindfulMatching.propTypes = {
    gameTitle: PropTypes.string,
    onBack: PropTypes.func.isRequired,
};

export default MindfulMatching;