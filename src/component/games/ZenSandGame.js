import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import './ZenSandGame.css'; // We'll create this CSS file

// --- Helper: Icon Components ---
// (Keep your existing SVG icon components)
const RakeSmallIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 5V20M10 5V20M6 5V20M18 5V20M4 5H20"></path></svg>;
const RakeLargeIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5V20M12 5V20M9 5V20M6 5V20M18 5V20M3 5H21"></path></svg>;
const SmootherIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
const ClearIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"> <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /> </svg>;
// --- Optional: Sound ---
// import { Howl } from 'howler'; // If using howler.js

const ZenSandGarden = ({ gameTitle, onBack }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState('rake-small');
    const [lastPosition, setLastPosition] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 }); // Track canvas size

    // --- Configuration ---
    const sandBaseColor = '#E0C9A6'; // Lighter base
    const sandGrainColor = '#D0B996'; // Subtle grains
    const rakeLineColorDark = '#B09976'; // Shadow color
    const rakeLineColorLight = '#F0D9B6'; // Highlight color
    const grainDensity = 0.15; // Percentage of canvas area for grains

    const toolSettings = useRef({ // Use useRef for settings that don't trigger re-renders
        'rake-small': { size: 1.5, prongs: 3, spacing: 5, depth: 0.8 },
        'rake-large': { size: 2.5, prongs: 5, spacing: 7, depth: 1 },
        'smoother': { size: 40, depth: 0 }, // Size is diameter
    }).current; // Get the current value

    // --- Optional Sound Setup ---
    // const rakeSound = useRef(null);
    // const clearSound = useRef(null);
    // useEffect(() => {
    //     rakeSound.current = new Howl({ src: ['/sounds/rake-short.wav'], volume: 0.3 }); // Provide actual path
    //     clearSound.current = new Howl({ src: ['/sounds/clear-sand.wav'], volume: 0.5 }); // Provide actual path
    // }, []);
    // const playRakeSound = useCallback(() => {
    //     // Add throttling if needed
    //     rakeSound.current?.play();
    // }, []);


    // --- Utility ---
    const hexToRgb = useCallback((hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 }; // Default to black on error
    }, []);

    // --- Drawing Functions ---

    const drawSandTexture = useCallback((ctx, width, height) => {
        if (!ctx) return;
        console.log("drawSandTexture: Drawing base sand");

        // Base color
        ctx.fillStyle = sandBaseColor;
        ctx.fillRect(0, 0, width, height);

        // Add subtle grains
        const numGrains = Math.floor(width * height * grainDensity); // Scale grains with area
        const sandRgb = hexToRgb(sandGrainColor);
        if (!sandRgb) return; // Exit if color conversion failed

        // Use ImageData for potentially better performance on many grains
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < numGrains; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const index = (y * width + x) * 4;
            const alpha = Math.random() * 0.4 + 0.1; // Random alpha

            data[index] = sandRgb.r;     // R
            data[index + 1] = sandRgb.g; // G
            data[index + 2] = sandRgb.b; // B
            data[index + 3] = Math.floor(alpha * 255); // A
        }
        ctx.putImageData(imageData, 0, 0);

        console.log("drawSandTexture: Grains drawn");
    }, [sandBaseColor, sandGrainColor, hexToRgb, grainDensity]);


    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d', { willReadFrequently: true }); // willReadFrequently might help performance
        if (!context) {
            console.error("initializeCanvas: Failed to get 2D context");
            return;
        }
        contextRef.current = context;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Check if dimensions are valid before setting
        if (rect.width > 0 && rect.height > 0) {
             // Only update state if dimensions actually changed
            if (canvasSize.width !== rect.width || canvasSize.height !== rect.height) {
                console.log(`initializeCanvas: Resizing canvas to ${rect.width}x${rect.height} (CSS)`);
                canvas.width = Math.round(rect.width * dpr);
                canvas.height = Math.round(rect.height * dpr);
                context.scale(dpr, dpr);
                setCanvasSize({ width: rect.width, height: rect.height }); // Store logical size

                // Redraw sand texture after resize
                drawSandTexture(context, rect.width, rect.height);
            } else {
                 console.log("initializeCanvas: Size unchanged, skipping redraw.");
            }

        } else {
            console.warn("initializeCanvas: Canvas has zero dimensions. Layout might be pending.");
            // No need for requestAnimationFrame loop here, useEffect dependency handles it.
        }

    }, [drawSandTexture, canvasSize]); // Depend on canvasSize to re-run if it changes

    // Effect for Initial Setup & Resize Handling
    useEffect(() => {
        console.log("ZenSandGarden: Mounted or canvasSize changed.");
        initializeCanvas(); // Initialize on mount and when logical size state changes

        // Debounced resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("Resize detected, re-initializing canvas...");
                 // Force re-check of dimensions by temporarily resetting canvasSize state
                 // This triggers initializeCanvas via useEffect dependency
                 setCanvasSize({width: 0, height: 0});
            }, 250); // Debounce resize events
        };

        window.addEventListener('resize', handleResize);
        return () => {
            console.log("ZenSandGarden: Unmounting. Removing resize listener.");
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', handleResize);
        };
    }, [initializeCanvas]); // Re-run ONLY if initializeCanvas function identity changes (due to its dependencies)

    const getPointerPosition = useCallback((eventInput) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: eventInput.clientX - rect.left,
            y: eventInput.clientY - rect.top,
        };
    }, []); // No dependencies needed

    const startDrawing = useCallback((eventInput) => {
        if (!contextRef.current) return;
        setIsDrawing(true);
        const pos = getPointerPosition(eventInput);
        setLastPosition(pos);
        // Draw the first point immediately if it's a smoother
        if (currentTool === 'smoother') {
            drawSegment(pos, pos); // Draw a single point for the smoother start
        }
    }, [getPointerPosition, currentTool]); // Added drawSegment dependency

    const draw = useCallback((eventInput) => {
        if (!isDrawing || !contextRef.current || !lastPosition) return;

        const currentPos = getPointerPosition(eventInput);
        drawSegment(lastPosition, currentPos);
        setLastPosition(currentPos);
        // Optional: Play sound (throttled)
        // playRakeSound();

    }, [isDrawing, lastPosition, getPointerPosition, currentTool, toolSettings, sandBaseColor, sandGrainColor, rakeLineColorDark, rakeLineColorLight, hexToRgb]); // Removed setLastPosition, playRakeSound from dependencies

    const drawSegment = useCallback((startPos, endPos) => {
        const context = contextRef.current;
        if (!context) return;

        const tool = toolSettings[currentTool];
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        context.lineCap = 'round';
        context.lineJoin = 'round';

        if (currentTool === 'smoother') {
            const radius = tool.size / 2;

            // Method 1: Fill with base color + redraw grains (Simpler)
            context.fillStyle = sandBaseColor;
            context.beginPath();
            context.arc(endPos.x, endPos.y, radius, 0, Math.PI * 2);
            context.fill();

            // Redraw some grains in the smoothed area
            const numGrainsToRedraw = Math.floor(Math.PI * radius * radius * grainDensity * 1.5); // Slightly more grains
            const sandRgb = hexToRgb(sandGrainColor);
            if (sandRgb) {
                 // Directly draw small rects - might be faster than creating ImageData here
                 context.fillStyle = `rgba(${sandRgb.r}, ${sandRgb.g}, ${sandRgb.b}, ${Math.random() * 0.3 + 0.1})`; // Reuse alpha calculation
                for (let i = 0; i < numGrainsToRedraw; i++) {
                    const angleGrain = Math.random() * Math.PI * 2;
                    const radiusGrain = Math.random() * radius;
                    const grainX = endPos.x + Math.cos(angleGrain) * radiusGrain;
                    const grainY = endPos.y + Math.sin(angleGrain) * radiusGrain;
                    const alpha = Math.random() * 0.4 + 0.1; // Random alpha
                     context.fillStyle = `rgba(${sandRgb.r}, ${sandRgb.g}, ${sandRgb.b}, ${alpha})`;
                    context.fillRect(Math.floor(grainX), Math.floor(grainY), 1, 1);
                }
            }

            // Method 2 (More complex, better blend, might be slower):
            // context.save();
            // context.beginPath();
            // context.arc(endPos.x, endPos.y, radius, 0, Math.PI * 2);
            // context.clip(); // Clip to the smoother area
            // // Clear existing content in the circle
            // context.globalCompositeOperation = 'destination-out';
            // context.fillStyle = 'rgba(0,0,0,1)'; // Any opaque color
            // context.fill();
            // // Redraw sand texture inside the circle
            // context.globalCompositeOperation = 'source-over'; // Reset composite op
            // context.fillStyle = sandBaseColor;
            // context.fill(); // Fill base color first (needed because destination-out clears fully)
            // // Redraw grains within the clipped circle (similar to above grain logic)
            // // ... (grain drawing logic here, respecting the clip path) ...
            // context.restore();


        } else { // Rakes
            const prongCount = tool.prongs;
            const prongSpacing = tool.spacing;
            const lineWidth = tool.size;
            const depthFactor = tool.depth; // Use depth for subtle color intensity? (Optional)

            // Calculate perpendicular offsets for prongs
            const offsetX = Math.sin(angle) * prongSpacing;
            const offsetY = -Math.cos(angle) * prongSpacing;

            // Calculate start offset for centering the prongs
            const startOffsetX = -offsetX * (prongCount - 1) / 2;
            const startOffsetY = -offsetY * (prongCount - 1) / 2;

            for (let i = 0; i < prongCount; i++) {
                const currentOffsetX = startOffsetX + i * offsetX;
                const currentOffsetY = startOffsetY + i * offsetY;

                // Calculate positions for this prong
                const prongStartX = startPos.x + currentOffsetX;
                const prongStartY = startPos.y + currentOffsetY;
                const prongEndX = endPos.x + currentOffsetX;
                const prongEndY = endPos.y + currentOffsetY;

                // Draw the shadow line (slightly offset)
                context.strokeStyle = rakeLineColorDark;
                context.lineWidth = lineWidth * depthFactor;
                context.beginPath();
                context.moveTo(prongStartX - Math.sin(angle + Math.PI / 4) * lineWidth * 0.3, prongStartY + Math.cos(angle + Math.PI / 4) * lineWidth * 0.3);
                context.lineTo(prongEndX - Math.sin(angle + Math.PI / 4) * lineWidth * 0.3, prongEndY + Math.cos(angle + Math.PI / 4) * lineWidth * 0.3);
                context.stroke();

                // Draw the highlight line (slightly offset other way)
                context.strokeStyle = rakeLineColorLight;
                context.lineWidth = lineWidth * depthFactor * 0.8; // Highlight slightly thinner
                context.beginPath();
                context.moveTo(prongStartX + Math.sin(angle + Math.PI / 4) * lineWidth * 0.3, prongStartY - Math.cos(angle + Math.PI / 4) * lineWidth * 0.3);
                context.lineTo(prongEndX + Math.sin(angle + Math.PI / 4) * lineWidth * 0.3, prongEndY - Math.cos(angle + Math.PI / 4) * lineWidth * 0.3);
                context.stroke();

                 // Optional: Draw a center line for more definition (can be base color or slightly darker)
                // context.strokeStyle = sandGrainColor; // Or rakeLineColorDark with lower alpha
                // context.lineWidth = lineWidth * 0.5;
                // context.beginPath();
                // context.moveTo(prongStartX, prongStartY);
                // context.lineTo(prongEndX, prongEndY);
                // context.stroke();
            }
        }

    }, [toolSettings, currentTool, sandBaseColor, sandGrainColor, rakeLineColorDark, rakeLineColorLight, hexToRgb, grainDensity]);


    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setLastPosition(null);
    }, []);

    const handleToolChange = useCallback((tool) => {
        setCurrentTool(tool);
    }, []);

    const handleClearGarden = useCallback(() => {
        const context = contextRef.current;
        const canvas = canvasRef.current;
        if (!context || !canvas) return;
        console.log("handleClearGarden: Clearing garden");
        // Use the stored logical size for drawing
        drawSandTexture(context, canvasSize.width, canvasSize.height);
        // Optional: Play sound
        // clearSound.current?.play();
    }, [drawSandTexture, canvasSize]); // Depend on canvasSize

    // --- Event Handlers ---
    // Use useCallback for all handlers passed as props to prevent unnecessary re-renders
    const handleMouseDown = useCallback((e) => { e.preventDefault(); startDrawing(e.nativeEvent); }, [startDrawing]);
    const handleMouseMove = useCallback((e) => { e.preventDefault(); draw(e.nativeEvent); }, [draw]); // Only depends on draw now
    const handleMouseUp = useCallback((e) => { e.preventDefault(); stopDrawing(); }, [stopDrawing]);
    const handleMouseLeave = useCallback((e) => { e.preventDefault(); if (isDrawing) stopDrawing(); }, [isDrawing, stopDrawing]);
    const handleTouchStart = useCallback((e) => { if (e.touches.length === 1) { e.preventDefault(); startDrawing(e.touches[0]); } }, [startDrawing]);
    const handleTouchMove = useCallback((e) => { if (e.touches.length === 1) { e.preventDefault(); draw(e.touches[0]); } }, [draw]);
    const handleTouchEnd = useCallback((e) => { e.preventDefault(); stopDrawing(); }, [stopDrawing]);


    // --- Dynamic Cursor Style ---
    const getCursorStyle = () => {
        switch (currentTool) {
            case 'rake-small': return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' stroke=\'%23555\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M14 5V20M10 5V20M6 5V20M18 5V20M4 5H20\'></path></svg>") 10 10, crosshair'; // Centered cursor
            case 'rake-large': return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' stroke=\'%23555\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M15 5V20M12 5V20M9 5V20M6 5V20M18 5V20M3 5H21\'></path></svg>") 12 12, crosshair';
            case 'smoother': return 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' stroke=\'%23555\' stroke-width=\'2\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'></rect></svg>") 12 12, grab';
            default: return 'crosshair';
        }
    };

    return (
        <div className="zen-garden-container fade-in">
            <div className="zen-garden-header">
                <button onClick={onBack} className="zen-back-button" aria-label="Back to Games">
                    <BackIcon />
                    <span>Back</span> {/* Add text for clarity */}
                </button>
                <h2 className="zen-game-title">{gameTitle || 'Zen Sand Garden'}</h2>
                {/* Optional Mute Button Placeholder */}
                {/* <button className="zen-mute-button">Mute</button> */}
            </div>

            <div className="zen-garden-main">
                <div className="zen-toolbar">
                    <button
                        title="Small Rake"
                        aria-label="Select Small Rake"
                        className={`tool-button ${currentTool === 'rake-small' ? 'active' : ''}`}
                        onClick={() => handleToolChange('rake-small')}
                    >
                        <RakeSmallIcon />
                    </button>
                    <button
                        title="Large Rake"
                        aria-label="Select Large Rake"
                        className={`tool-button ${currentTool === 'rake-large' ? 'active' : ''}`}
                        onClick={() => handleToolChange('rake-large')}
                    >
                        <RakeLargeIcon />
                    </button>
                    <button
                        title="Smoother"
                        aria-label="Select Smoother"
                        className={`tool-button ${currentTool === 'smoother' ? 'active' : ''}`}
                        onClick={() => handleToolChange('smoother')}
                    >
                        <SmootherIcon />
                    </button>
                    <button
                        title="Clear Garden"
                        aria-label="Clear Sand Garden"
                        className="tool-button clear-button"
                        onClick={handleClearGarden}
                    >
                        <ClearIcon />
                    </button>
                </div>
                <div className="zen-canvas-container"> {/* Added container for potential styling */}
                    <canvas
                        ref={canvasRef}
                        className="zen-canvas"
                        style={{ cursor: getCursorStyle() }} // Dynamic cursor
                        // Event listeners using useCallback references
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd} // Handle touch cancel same as end
                    />
                </div>
            </div>
            <p className="zen-garden-instructions">
                Select a tool, then click (or tap) and drag on the sand. Find your moment of calm.
            </p>
        </div>
    );
};

// --- Prop Type Validation ---
ZenSandGarden.propTypes = {
    gameTitle: PropTypes.string,
    onBack: PropTypes.func.isRequired, // Make onBack required
};

export default ZenSandGarden;