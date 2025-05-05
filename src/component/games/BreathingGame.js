import React, { useState, useEffect, useCallback, useRef } from 'react';
import './BreathingGame.css'; // Ensure this CSS path is correct

// Constants for timing (in milliseconds)
const INHALE_DURATION = 4000;
const HOLD_DURATION = 4000;
const EXHALE_DURATION = 6000;
const PAUSE_DURATION = 1000;

const BreathingGame = ({ onBack }) => {
  const [phase, setPhase] = useState('initial');
  const [instruction, setInstruction] = useState('Press Start to Begin');
  const [isRunning, setIsRunning] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const timeoutRef = useRef(null);
  const phaseRef = useRef(phase); // Ref to track the current phase reliably in callbacks

  // Keep the phaseRef synchronized with the phase state
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Function to manage the breathing cycle transitions using refs
  const runCycle = useCallback(() => {
    // Double-check isRunning state directly, as the callback might execute slightly after state change



    let nextPhaseDuration = 0;
    let nextPhase = '';
    let nextInstruction = '';
    let nextAnimationClass = '';

    // Determine next state based on the *current* phase stored in the ref
    switch (phaseRef.current) {
      case 'initial':
      case 'pause':
        nextPhase = 'inhale';
        nextInstruction = 'Breathe In...';
        nextAnimationClass = 'inhale-animation';
        nextPhaseDuration = INHALE_DURATION;
        break;

      case 'inhale':
        nextPhase = 'hold';
        nextInstruction = 'Hold';
        nextAnimationClass = 'hold-animation';
        nextPhaseDuration = HOLD_DURATION;
        break;

      case 'hold':
        nextPhase = 'exhale';
        nextInstruction = 'Breathe Out...';
        nextAnimationClass = 'exhale-animation';
        nextPhaseDuration = EXHALE_DURATION;
        break;

      case 'exhale':
        nextPhase = 'pause';
        nextInstruction = 'Pause';
        nextAnimationClass = ''; // Reset animation
        nextPhaseDuration = PAUSE_DURATION;
        break;

      default:
        console.error(`Unexpected phase: ${phaseRef.current}. Resetting.`);
        // Reset logic handled by handleStop/handleReset
        setIsRunning(false); // Trigger stop
        return; // Don't schedule next timeout
    }

    // Update the state for the UI
    setPhase(nextPhase);
    setInstruction(nextInstruction);
    setAnimationClass(nextAnimationClass);

    // Schedule the next call to runCycle
    // Clear previous timeout just in case (though cleanup should handle it)
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(runCycle, nextPhaseDuration);

  }, [isRunning]); // Now runCycle ONLY depends on isRunning


  // Effect to handle starting and stopping the cycle based on isRunning state
  useEffect(() => {
    clearTimeout(timeoutRef.current); // Clear any lingering timeouts first

    if (isRunning) {
      console.log("useEffect: Starting cycle.");
      // Manually set the *first* phase state when starting
      setPhase('inhale');
      setInstruction('Breathe In...');
      setAnimationClass('inhale-animation');
      // Schedule the first call to runCycle after the initial phase duration
      timeoutRef.current = setTimeout(runCycle, INHALE_DURATION);
    } else {
      console.log("useEffect: Cycle stopped or not started.");
      // Optional: Reset visual state if needed when isRunning turns false externally
       if (phase !== 'initial') {
         // Reset visuals if stopped mid-cycle but keep 'Paused' message if applicable
          // setAnimationClass('');
       }
    }

    // Cleanup function: This is crucial
    return () => {
      console.log("useEffect Cleanup: Clearing timeout.");
      clearTimeout(timeoutRef.current);
    };
  }, [isRunning, runCycle]); // runCycle dependency is okay here


  // --- Control Functions ---
  const handleStart = () => {
    if (!isRunning) {
      console.log("handleStart: Setting isRunning to true");
      setIsRunning(true); // Trigger the useEffect to start the cycle
    }
  };

  const handleStop = () => {
    console.log("handleStop: Setting isRunning to false");
    setIsRunning(false); // Trigger useEffect cleanup & stop cycle
    setPhase('initial'); // Reset phase state
    setInstruction('Paused. Press Start to Resume.');
    setAnimationClass(''); // Reset visual animation class
    // No need to clear timeout explicitly here, useEffect cleanup handles it
  };

  const handleReset = () => {
    console.log("handleReset: Setting isRunning to false and resetting");
    setIsRunning(false); // Trigger useEffect cleanup & stop cycle
    setPhase('initial'); // Reset phase state
    setInstruction('Press Start to Begin');
    setAnimationClass(''); // Reset visual animation class
    // No need to clear timeout explicitly here, useEffect cleanup handles it
  };


  return (
    <div className="game-view-container breathing-game-container fade-in">
      {/* Back Button */}
      <button onClick={onBack} className="back-to-menu-button">
  {/* SVG remains the same */}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
  </svg>
  <span className="back-text">Back to Games</span>
</button>


      <h2 className="game-title">Calm Breathing Exercise</h2>

      <div className="breathing-visualizer">
        {/* Pass durations as CSS variables for animations */}
        <div
          className={`breathing-circle ${animationClass}`}
          style={{
             '--inhale-duration': `${INHALE_DURATION / 1000}s`,
             '--exhale-duration': `${EXHALE_DURATION / 1000}s`,
          }}
          ></div>
        <p className="breathing-instruction">{instruction}</p>
      </div>

      {/* Controls */}
      <div className="breathing-controls">
        {!isRunning ? (
          <button onClick={handleStart} className="control-button start-button">
            {/* Show 'Resume' if paused, otherwise 'Start' */}
            {instruction.includes('Paused') ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={handleStop} className="control-button stop-button">
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="control-button reset-button"
          // Disable reset only if truly at the initial state before ever starting
          disabled={phase === 'initial' && instruction === 'Press Start to Begin'}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BreathingGame;