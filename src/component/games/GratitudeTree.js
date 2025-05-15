import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './GratitudeTree.css';

// --- Helper Components (Paste or import updated SVGs/Icons from above) ---
// TreeIcon, LeafShapeIcon, BackIcon, AddIcon, ClearIcon


// --- Helper Components (Inside GratitudeTree.js or imported) ---

// Slightly more detailed Tree SVG
const TreeIcon = () => (
    <svg viewBox="0 0 100 120" className="gratitude-tree-svg">
        <defs>
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#8B4513', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#A0522D', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#8B4513', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                 <feOffset dx="1" dy="1" result="offsetblur"/>
                 <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                 </feComponentTransfer>
                 <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                 </feMerge>
            </filter>
        </defs>
        {/* Trunk with gradient */}
        <path d="M50 118 V75" stroke="url(#trunkGradient)" strokeWidth="10" strokeLinecap="round" filter="url(#subtleShadow)"/>
        {/* Branches */}
        <path d="M50 85 Q38 75 25 60" stroke="#966F33" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M50 85 Q62 75 75 60" stroke="#966F33" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M50 80 Q50 70 50 50" stroke="#8B5A2B" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M25 60 Q18 50 15 35" stroke="#A0522D" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M25 60 Q35 50 40 40" stroke="#A0522D" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M75 60 Q82 50 85 35" stroke="#A0522D" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M75 60 Q65 50 60 40" stroke="#A0522D" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M50 50 Q40 40 35 25" stroke="#A0522D" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M50 50 Q60 40 65 25" stroke="#A0522D" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Suggestion of foliage */}
        <ellipse cx="50" cy="38" rx="45" ry="32" fill="rgba(85, 107, 47, 0.12)" />
        <ellipse cx="50" cy="38" rx="42" ry="28" fill="rgba(85, 107, 47, 0.15)" />
    </svg>
);

// More organic Leaf SVG Shape
const LeafShapeIcon = ({ color = "#8FBC8F" }) => ( // Default DarkSeaGreen
  <svg viewBox="0 0 60 60" width="60" height="60" className="leaf-shape-svg">
     <defs>
        <linearGradient id={`leafGradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
        </linearGradient>
        <filter id="leafShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="shadow"/>
            <feOffset dx="1" dy="1"/>
        </filter>
    </defs>
    <path
        d="M30,1 C15,10 5,25 10,45 C15,65 30,55 30,55 C30,55 45,65 50,45 C55,25 45,10 30,1 Z"
        fill={`url(#leafGradient-${color.replace('#', '')})`}
        // filter="url(#leafShadow)" // Optional shadow, can impact performance
        className="leaf-path"
    />
     {/* Subtle Vein */}
     <path d="M30 15 V 55" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.7" fill="none" />
  </svg>
);
LeafShapeIcon.propTypes = { color: PropTypes.string };


const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"> <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /> </svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>;
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.326.419A2.25 2.25 0 001.93 6.75L2.99 15.89A4.75 4.75 0 007.677 20h4.646a4.75 4.75 0 004.687-4.109l1.06-9.14a2.25 2.25 0 00-1.744-2.138c-.746-.199-1.531-.342-2.326-.42v-.442A2.75 2.75 0 0011.25 1h-2.5zM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.516c-1.014.068-2.02.206-2.984.396A4.755 4.755 0 0010 4.5c-.113 0-.225-.003-.336-.008a4.808 4.808 0 00-2.164-.388V3.75zm4.06 6.06a.75.75 0 10-1.06-1.06L10 9.19 8.56 7.75a.75.75 0 10-1.06 1.06L8.94 10l-1.44 1.44a.75.75 0 101.06 1.06L10 10.81l1.44 1.44a.75.75 0 101.06-1.06L11.06 10l1.44-1.44z" clipRule="evenodd" /></svg>;

const LOCAL_STORAGE_KEY = 'gratitudeTreeNotes';
const LEAF_COLORS = ['#a8d8b0', '#b5e48c', '#d9ed92', '#99d98c', '#76c893', '#52b69a', '#34a0a4']; // More harmonious greens

// --- Gratitude Note Component ---
const GratitudeNote = React.memo(({ note, onHover, onLeave }) => {
    const style = {
        top: `${note.y}%`,
        left: `${note.x}%`,
        // Apply rotation via CSS class for smoother animation control
        '--leaf-rotation': `${note.rotation || 0}deg`,
    };

    return (
        // Outer div for positioning and animation trigger
        <div
            className="gratitude-note-container grow-in"
            style={style}
            onMouseEnter={() => onHover(note.id)}
            onMouseLeave={onLeave}
        >
            {/* Inner div for the leaf shape and text */}
            <div className="gratitude-note" title={note.text}>
                <LeafShapeIcon color={note.color || LEAF_COLORS[0]} />
                <span className="note-text">
                    {note.text} {/* Show full text, CSS handles clipping */}
                </span>
            </div>
        </div>
    );
});
GratitudeNote.displayName = 'GratitudeNote';
GratitudeNote.propTypes = {
     note: PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        rotation: PropTypes.number,
        color: PropTypes.string,
     }).isRequired,
     onHover: PropTypes.func.isRequired,
     onLeave: PropTypes.func.isRequired,
};


// --- Main Game Component ---
const GratitudeTree = ({ gameTitle, onBack }) => {
    const [notes, setNotes] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [inputError, setInputError] = useState(false); // For visual feedback
    const [hoveredNoteId, setHoveredNoteId] = useState(null);
    const treeContainerRef = useRef(null);

    // Load notes
    useEffect(() => {
        console.log("Loading notes...");
        try {
            const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedNotes) {
                setNotes(JSON.parse(storedNotes));
            }
        } catch (error) { console.error("Error reading localStorage:", error); }
    }, []);

    // Save notes
    useEffect(() => {
        if (notes.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEY)) {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
            } catch (error) { console.error("Error saving to localStorage:", error); }
        }
    }, [notes]);

    const handleInputChange = (event) => {
        setCurrentInput(event.target.value);
        if (inputError && event.target.value.trim()) {
            setInputError(false); // Clear error state once user types valid input
        }
    };

    const addNote = useCallback((event) => {
        event.preventDefault();
        const trimmedInput = currentInput.trim();
        if (!trimmedInput) {
            setInputError(true); // Set error state for styling
            setTimeout(() => setInputError(false), 1000); // Remove error state after a second
            return;
        }

        // Prevent adding too many notes if needed (optional)
        if (notes.length > 100) { // Example limit
            alert("Your tree is full of gratitude! Consider clearing some older notes if you like.");
            return;
        }

        // Improved Positioning - avoid direct edges slightly more
        const randomX = Math.random() * 56 + 22; // 22% to 78%
        const randomY = Math.random() * 48 + 18; // 18% to 66%
        const randomRotation = Math.random() * 40 - 20; // -20 to +20 degrees
        const randomColor = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];

        const newNote = {
            id: `note-${Date.now()}-${Math.random().toString(16).slice(2)}`, // More robust ID
            text: trimmedInput,
            x: randomX, y: randomY, rotation: randomRotation, color: randomColor,
        };

        setNotes(prevNotes => [...prevNotes, newNote]);
        setCurrentInput('');
        setInputError(false); // Ensure error is cleared

    }, [currentInput, notes.length]); // Added notes.length dependency for the limit check

     const clearAllNotes = () => {
        // Use a slightly nicer confirmation if possible, but window.confirm is universal
        if (window.confirm("Are you sure you want to clear all gratitude notes from this tree?\nThis action cannot be undone.")) {
            setNotes([]);
            try { localStorage.removeItem(LOCAL_STORAGE_KEY); }
            catch (error) { console.error("Error clearing localStorage:", error); }
        }
    };

     // Handlers for hover effects
     const handleNoteHover = useCallback((id) => setHoveredNoteId(id), []);
     const handleNoteLeave = useCallback(() => setHoveredNoteId(null), []);

    return (
        <div className="gratitude-container fade-in">
            {/* Header */}
            <div className="gratitude-header">
                <button onClick={onBack} className="gratitude-button subtle" aria-label="Back to Games">
                    <BackIcon />
                    <span>Back</span>
                </button>
                <h2 className="gratitude-title">{gameTitle || 'Gratitude Tree'}</h2>
                 <button onClick={clearAllNotes} className="gratitude-button danger" title="Clear All Notes">
                    <ClearIcon />
                    <span>Clear</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="gratitude-main">
                {/* Tree Area */}
                <div className="gratitude-tree-area" ref={treeContainerRef}>
                    <TreeIcon />
                    <div className="notes-container">
                        {notes.map(note => (
                            <GratitudeNote
                                key={note.id}
                                note={note}
                                onHover={handleNoteHover}
                                onLeave={handleNoteLeave}
                            />
                        ))}
                    </div>
                     {/* Optional: Display full text of hovered note */}
                     {hoveredNoteId && notes.find(n => n.id === hoveredNoteId) && (
                        <div className="hovered-note-tooltip">
                            {notes.find(n => n.id === hoveredNoteId).text}
                        </div>
                     )}
                </div>

                {/* Input Area */}
                <form className={`gratitude-input-area ${inputError ? 'has-error' : ''}`} onSubmit={addNote}>
                    <textarea
                        value={currentInput}
                        onChange={handleInputChange}
                        placeholder="Share something you're grateful for..."
                        rows="3"
                        className="gratitude-textarea"
                        aria-label="Enter your gratitude note"
                        aria-invalid={inputError}
                    />
                    <button
                        type="submit"
                        className="gratitude-button primary add-button" // More specific class
                        disabled={!currentInput.trim()} // Disable check remains
                         title={!currentInput.trim() ? "Please enter your gratitude first" : "Add your note to the tree"}
                    >
                        <AddIcon />
                        Add Leaf
                    </button>
                </form>
            </div>

             {/* Instructions Footer */}
             <p className="gratitude-instructions">
                Let your gratitude grow. Add a leaf for each blessing, big or small.
            </p>
        </div>
    );
};

GratitudeTree.propTypes = {
    gameTitle: PropTypes.string,
    onBack: PropTypes.func.isRequired,
};

export default GratitudeTree;