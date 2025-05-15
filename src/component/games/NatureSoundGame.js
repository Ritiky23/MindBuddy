// --- NatureSoundGame.js ---
// No changes needed from the previous version, assuming Steps 1-4 are checked.
// Ensure this file is saved as NatureSoundGame.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Howl, Howler } from 'howler'; // Correct import
import './NatureSoundGame.css';      // Ensure CSS file exists

// --- Icon Components ---
const PlayIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v14zm4-11l5 4-5 4V8z"></path></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>;
const VolumeIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>;
const RainIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 13V21M8 13V21M16 13V21M19.071 4.929C17.613 3.47 15.431 2.5 13 2.5c-4.142 0-7.5 3.358-7.5 7.5 0 .317.02.63.058.937M7 10.5C7 10.5 7.5 9 9 9c1.5 0 2.873 1.284 3.442 3"></path><path d="M16 13.001c1.5-.001 2.5-1.501 2.5-1.501S17.5 9.001 16 9.001c-1.5 0-2.5 1.5-2.5 1.5s1 1.5 2.5 1.5z"></path></svg>;
const BirdsIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a5 5 0 00-10 0c0 2.472 1.791 4.5 4 4.5 1.209 0 2.3-.469 3.121-1.231M18 15l-3-3m0 0l-3 3m3-3V5m-7 6c-1.5 0-3-.5-3-1.5S5.5 8 7 8s3 .5 3 1.5-1.5 1.5-3 1.5zM21 12c-1.5 0-3-.5-3-1.5S19.5 9 21 9s3 .5 3 1.5-1.5 1.5-3 1.5z"></path></svg>;
const WavesIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6c3 0 6-3 9-3s6 3 9 3M3 12c3 0 6-3 9-3s6 3 9 3M3 18c3 0 6-3 9-3s6 3 9 3"></path></svg>;
const FireIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3C9.65 5.2 8 7.8 8 11c0 3.31 2.69 6 6 6s6-2.69 6-6c0-3.2-1.65-5.8-4-8zm0 15c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path><path d="M12 3c1.5 2.3 2.5 4.8 2.5 7 0 1.66-.67 3.16-1.76 4.24"></path></svg>;
const ForestIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 21V11l-5-4M14 21V11l5-4M5 16h14M12 3l-4 4h8l-4-4z"></path><path d="M12 3v9"></path></svg>;
const LoadingIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><style>{`.spinner_V8m1{transform-origin:center;animation:spinner_zKoa 2s linear infinite}.spinner_zKoa{animation-timing-function:steps(8,end);animation-name:spinner_zKoa}@keyframes spinner_zKoa{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style><g className="spinner_V8m1"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(45 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".43"/><rect x="11" y="1" width="2" height="5" transform="rotate(135 12 12)" opacity=".57"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(225 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(270 12 12)"/><rect x="11" y="1" width="2" height="5" transform="rotate(315 12 12)" opacity=".1"/></g></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"> <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /> </svg>;



const soundData = [
    { id: 'rain', name: 'Gentle Rain', icon: RainIcon,  file: require('../../assets/rain.mp3')} ,
    { id: 'birds', name: 'Forest Birds', icon: BirdsIcon, file: require('../../assets/birds.mp3') },
    { id: 'waves', name: 'Ocean Waves', icon: WavesIcon, file: require('../../assets/oceanwaves.mp3') },
    { id: 'fire', name: 'Crackling Fire', icon: FireIcon, file: require('../../assets/fire.mp3')},
    { id: 'forest', name: 'Night Forest', icon: ForestIcon, file: require('../../assets/night.mp3') },
];

const NatureSoundGame = ({ gameTitle, onBack }) => {
    const [soundStates, setSoundStates] = useState(() => {
        const initialState = {};
        soundData.forEach(sound => {
            initialState[sound.id] = {
                isPlaying: false,
                volume: 0.6,
                isLoading: true, // Start loading
                error: null,
                howlInstance: null,
            };
        });
        return initialState;
    });

    // --- Initialization & Cleanup ---
    useEffect(() => {
        console.log("NatureSoundGame: Initializing sounds...");
        let isMounted = true; // Flag to prevent state updates after unmount
        const howlInstancesToCleanUp = []; // Keep track of instances created in this effect

        soundData.forEach(sound => {
            // Check if instance already exists (e.g., due to fast refresh/re-render)
             // We access the *latest* state here using functional update form later,
             // so we don't need to check soundStates directly here.
             // Just create new instances on mount.

            console.log(`Creating Howl instance for ${sound.id} with file ${sound.file}`);
            const howl = new Howl({
                src: [sound.file],
                loop: true,
                volume: soundStates[sound.id]?.volume || 0.6, // Use initial state volume as default
                html5: true, // Good default for stability
                onload: () => {
                    if (!isMounted) return; // Prevent update if unmounted
                    console.log(`Howl loaded: ${sound.id}`);
                    setSoundStates(prev => ({
                        ...prev,
                        [sound.id]: { ...prev[sound.id], isLoading: false, error: null, howlInstance: howl } // Store instance on load
                    }));
                },
                onloaderror: (id, err) => {
                    if (!isMounted) return;
                    console.error(`Howl load error for ${sound.id} (Howl ID: ${id}):`, err);
                    setSoundStates(prev => ({
                        ...prev,
                        [sound.id]: { ...prev[sound.id], isLoading: false, error: `Failed to load sound (${err})`, howlInstance: null } // Clear instance on load error
                    }));
                },
                 onplayerror: (id, err) => {
                     if (!isMounted) return;
                     console.error(`Howl play error for ${sound.id} (Howl ID: ${id}):`, err);
                      // Attempt to recover AudioContext if suspended
                      if (Howler.ctx && Howler.ctx.state === 'suspended') {
                        console.warn("AudioContext was suspended. Attempting resume on user interaction...");
                        // Resume might fail if not directly triggered by user event,
                        // but Howler often handles this internally on the next *valid* play attempt.
                        Howler.ctx.resume().catch(e => console.error("AudioContext resume failed:", e));
                      }
                    setSoundStates(prev => ({
                        ...prev,
                        // Only update if this instance matches the one in state (prevents race conditions)
                        ...(prev[sound.id]?.howlInstance === howl ? {
                           [sound.id]: { ...prev[sound.id], isPlaying: false, error: `Playback failed (${err})` }
                        } : {})
                    }));
                },
                // Optional: Add more logging
                onplay: (id) => console.log(`Howl playing: ${sound.id} (Howl ID: ${id})`),
                onpause: (id) => console.log(`Howl paused: ${sound.id} (Howl ID: ${id})`),
                onstop: (id) => console.log(`Howl stopped: ${sound.id} (Howl ID: ${id})`),
                onend: (id) => console.log(`Howl ended (should loop): ${sound.id} (Howl ID: ${id})`),

            });
             howlInstancesToCleanUp.push(howl); // Add to cleanup list

             // Update state immediately to store the *reference* to the Howl instance
             // (isLoading will be updated later by onload/onloaderror)
             setSoundStates(prev => ({
                 ...prev,
                 [sound.id]: { ...prev[sound.id], howlInstance: howl, isLoading: true, error: null }
             }));

        });

        // --- Cleanup Function ---
        return () => {
            console.log("NatureSoundGame: Cleaning up sound instances...");
            isMounted = false; // Mark as unmounted
            howlInstancesToCleanUp.forEach(howlInstance => {
                 // Check if howlInstance exists and has an unload method
                 if (howlInstance && typeof howlInstance.unload === 'function') {
                    console.log(`Unloading instance for: ${howlInstance._src}`);
                    howlInstance.stop(); // Stop first
                    howlInstance.unload(); // Then unload
                 } else {
                     console.warn("Attempted to unload an invalid Howl instance during cleanup.");
                 }
            });
            // Avoid calling setSoundStates here as component is unmounting
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Runs only on mount

    // --- Handlers (Callbacks wrapped to prevent unnecessary re-renders) ---
    const togglePlay = useCallback((soundId) => {
        setSoundStates(prev => {
            const sound = prev[soundId];
            // **Crucial Check:** Ensure howlInstance exists AND is loaded
            if (!sound || !sound.howlInstance || sound.isLoading || sound.error) {
                 console.warn(`Cannot toggle play for ${soundId}: Instance not ready, loading, or error.`);
                 // Check if instance exists but isn't loaded yet
                 if (sound && sound.howlInstance && sound.isLoading) {
                    console.warn(` > ${soundId} is still loading.`);
                 } else if (sound && sound.error) {
                     console.warn(` > ${soundId} has error: ${sound.error}`);
                 } else if (!sound || !sound.howlInstance) {
                     console.warn(` > ${soundId} instance is missing.`);
                 }
                 return prev; // No change
            }

            const newState = !sound.isPlaying;
            console.log(`Attempting to toggle ${soundId} to ${newState ? 'Play' : 'Pause'}`);

            // Howler's play/pause methods handle internal state.
            // We rely on the onplay/onpause/onplayerror callbacks for feedback if needed,
            // but we update our React state optimistically here.
            if (newState) {
                sound.howlInstance.volume(sound.volume); // Ensure correct volume
                sound.howlInstance.play();
            } else {
                sound.howlInstance.pause();
            }

            // Optimistic UI update
            return {
                ...prev,
                [soundId]: { ...sound, isPlaying: newState }
            };
            // Note: If onplayerror fires, it will correct the isPlaying state back to false.
        });
    }, []); // Dependencies are stable (setSoundStates)

    const changeVolume = useCallback((soundId, volume) => {
        const newVolume = parseFloat(volume);
        if (isNaN(newVolume) || newVolume < 0 || newVolume > 1) return; // Validate volume

        setSoundStates(prev => {
            const sound = prev[soundId];
             // Check instance exists before trying to set volume
             if (!sound || !sound.howlInstance) {
                 console.warn(`Cannot change volume for ${soundId}: Instance not found.`);
                 return prev;
             }

            sound.howlInstance.volume(newVolume);
            return {
                ...prev,
                [soundId]: { ...sound, volume: newVolume }
            };
        });
    }, []); // Dependencies are stable

    const stopAll = useCallback(() => {
         console.log("Stopping all sounds...");
         setSoundStates(prev => {
            const newState = {...prev};
            Object.keys(newState).forEach(id => {
                 if(newState[id]?.howlInstance && newState[id]?.isPlaying) { // Check instance exists
                    console.log(` > Stopping ${id}`);
                    newState[id].howlInstance.pause(); // Use pause for looping sounds to allow resume
                    // newState[id].howlInstance.stop(); // Use stop if you want to reset position
                    newState[id].isPlaying = false;
                 }
            });
            return newState;
         });
    }, []); // Dependencies are stable

    // --- Render Logic ---
    // (The JSX structure from the previous correct version is fine)
    // No changes needed in the return statement below...
    return (
        <div className="nature-sound-container fade-in">
            {/* Header */}
            <div className="nature-sound-header">
                <button onClick={onBack} className="nature-back-button" aria-label="Back to Games">
                    <BackIcon />
                    <span>Back</span>
                </button>
                <h2 className="nature-game-title">{gameTitle || 'Nature Soundscape'}</h2>
                <button onClick={stopAll} className="nature-stop-all-button" title="Stop All Sounds">
                    Stop All
                </button>
            </div>

            {/* Main Content */}
            <div className="nature-sound-main">
                 {soundData.length === 0 && <p>No sounds configured.</p>}
                <div className="sound-controls-grid">
                    {soundData.map((sound) => {
                        const state = soundStates[sound.id];
                        const IconComponent = sound.icon;
                        const itemClasses = [
                            'sound-control-item',
                            state?.isPlaying ? 'playing' : '',
                            state?.isLoading ? 'loading' : '',
                            state?.error ? 'error' : '',
                        ].filter(Boolean).join(' ');

                        return (
                            <div key={sound.id} className={itemClasses}>
                                {/* Sound Info */}
                                <div className="sound-info">
                                     {IconComponent && <IconComponent />}
                                    <span className="sound-name">{sound.name}</span>
                                </div>

                                {/* Status Indicators */}
                                {state?.isLoading && (
                                    <div className="sound-status loading-indicator" title="Loading...">
                                         <LoadingIcon />
                                         <span>Loading...</span>
                                    </div>
                                )}
                                {state?.error && !state?.isLoading && (
                                    <div className="sound-status error-indicator" title={state.error}>
                                        ⚠️ <span className='error-text'>Error</span>
                                    </div>
                                )}

                                {/* Action Controls - IMPORTANT: Disable if instance doesn't exist OR loading/error */}
                                {!state?.isLoading && !state?.error && state?.howlInstance && (
                                    <div className="sound-actions">
                                        {/* Play/Pause Button */}
                                        <button
                                            onClick={() => togglePlay(sound.id)}
                                            className="play-pause-button"
                                            aria-label={state?.isPlaying ? `Pause ${sound.name}` : `Play ${sound.name}`}
                                            title={state?.isPlaying ? 'Pause' : 'Play'}
                                            // Stronger disabled check: Ensure instance exists and no load/error
                                            disabled={!state?.howlInstance || state?.isLoading || !!state?.error}
                                        >
                                            {state?.isPlaying ? <PauseIcon /> : <PlayIcon />}
                                        </button>

                                        {/* Volume Control */}
                                        <div className="volume-control">
                                            <VolumeIcon />
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={state?.volume ?? 0.6}
                                                onChange={(e) => changeVolume(sound.id, e.target.value)}
                                                className="volume-slider"
                                                aria-label={`${sound.name} volume`}
                                                disabled={!state?.howlInstance || state?.isLoading || !!state?.error}
                                            />
                                             <span className="volume-value">
                                                {typeof state?.volume === 'number' ? (state.volume * 100).toFixed(0) + '%' : 'N/A'}
                                             </span>
                                        </div>
                                    </div>
                                )}
                                 {/* Show message if instance missing after load attempt */}
                                 {!state?.isLoading && !state?.error && !state?.howlInstance && (
                                      <div className="sound-status error-indicator">
                                          Instance Error
                                      </div>
                                 )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Instructions Footer */}
            <p className="nature-sound-instructions">
                Click play to start a sound, adjust volume sliders to mix your perfect ambiance.
            </p>
        </div>
    );
};

// --- PropTypes ---
NatureSoundGame.propTypes = {
    gameTitle: PropTypes.string,
    onBack: PropTypes.func.isRequired,
};

export default NatureSoundGame;