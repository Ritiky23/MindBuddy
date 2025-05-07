import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ZenSandGame.css'; // We'll create this CSS file

// --- Helper: Icon Components (or use a library like react-icons) ---
const RakeSmallIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 5V20M10 5V20M6 5V20M18 5V20M4 5H20"></path></svg>;
const RakeLargeIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5V20M12 5V20M9 5V20M6 5V20M18 5V20M3 5H21"></path></svg>;
const SmootherIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
const ClearIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


const ZenSandGarden = ({ gameTitle, onBack }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState('rake-small');
    const [lastPosition, setLastPosition] = useState(null);

    // ... (colors and toolSettings) ...

    const sandBaseColor = '#E0C9A6';
    const sandGrainColor = '#D0B996';
    const rakeLineColorDark = '#B09976';
    const rakeLineColorLight = '#F0D9B6';
  
    const toolSettings = {
      'rake-small': { size: 2, prongs: 3, spacing: 6, depth: 0.8 }, // Increased spacing for visibility
      'rake-large': { size: 3, prongs: 5, spacing: 8, depth: 1 }, // Increased spacing
      'smoother': { size: 30, depth: 0 },
    };

    const hexToRgb = useCallback((hex) => {
      // console.log("hexToRgb called with:", hex); // Log if needed
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : {r:0, g:0, b:0};
    }, []);

    const drawSandTexture = useCallback(() => {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (!context || !canvas) {
        console.error("drawSandTexture: Context or Canvas not ready");
        return;
      }
      console.log("drawSandTexture: Drawing base sand");

      const dpr = window.devicePixelRatio || 1;
      context.fillStyle = sandBaseColor;
      context.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const numGrains = 5000; // Reduced for testing
      const sandRgb = hexToRgb(sandGrainColor);
      for (let i = 0; i < numGrains; i++) {
        const x = Math.random() * (canvas.width / dpr);
        const y = Math.random() * (canvas.height / dpr);
        const alpha = Math.random() * 0.3 + 0.1;
        context.fillStyle = `rgba(${sandRgb.r}, ${sandRgb.g}, ${sandRgb.b}, ${alpha})`;
        context.fillRect(x, y, 1, 1);
      }
      console.log("drawSandTexture: Grains drawn");
    }, [sandBaseColor, sandGrainColor, hexToRgb]);

    const initializeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("initializeCanvas: Canvas ref is null");
        return;
      }
      console.log("initializeCanvas: Attempting to initialize");

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      console.log("initializeCanvas: Canvas rect:", rect);


      if (rect.width === 0 || rect.height === 0) {
          console.warn("initializeCanvas: Canvas has zero dimensions. Retrying...");
          requestAnimationFrame(initializeCanvas); // Retry
          return;
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      console.log(`initializeCanvas: Canvas dimensions set to ${canvas.width}x${canvas.height} (physical), ${rect.width}x${rect.height} (CSS)`);


      const context = canvas.getContext('2d');
      if (!context) {
        console.error("initializeCanvas: Failed to get 2D context");
        return;
      }
      context.scale(dpr, dpr);
      contextRef.current = context;
      console.log("initializeCanvas: Context set and scaled. DPR:", dpr);
      drawSandTexture();
    }, [drawSandTexture]);


    useEffect(() => {
      console.log("ZenSandGarden: Component Mounted. Initializing canvas.");
      initializeCanvas();
      window.addEventListener('resize', initializeCanvas);
      return () => {
        console.log("ZenSandGarden: Component Unmounting. Removing resize listener.");
        window.removeEventListener('resize', initializeCanvas);
      };
    }, [initializeCanvas]);


    const getPointerPosition = useCallback((eventInput) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        // console.error("getPointerPosition: Canvas ref is null");
        return { x: 0, y: 0 };
      }
      const rect = canvas.getBoundingClientRect();
      const clientX = eventInput.clientX;
      const clientY = eventInput.clientY;

      const pos = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
      // console.log("getPointerPosition: Event:", eventInput.type, "Coords:", clientX, clientY, "Rect:", rect.left, rect.top, "Calc Pos:", pos);
      return pos;
    }, []);

    const startDrawing = useCallback((eventInput) => {
      console.log("startDrawing: Event type:", eventInput.type);
      const pos = getPointerPosition(eventInput);
      console.log("startDrawing: Position:", pos);
      setIsDrawing(true);
      setLastPosition(pos);

      if (!contextRef.current) {
          console.error("startDrawing: Context is null!");
          return;
      }
      // TEST: Draw a small red dot at the start position
      // contextRef.current.fillStyle = 'red';
      // contextRef.current.beginPath();
      // contextRef.current.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      // contextRef.current.fill();
      // console.log("startDrawing: Test dot drawn at", pos);

    }, [getPointerPosition, setIsDrawing, setLastPosition]);

    const draw = useCallback((eventInput) => {
      if (!isDrawing) {
        // console.log("draw: Not drawing (isDrawing is false)");
        return;
      }
      if (!contextRef.current) {
        console.error("draw: Context is null!");
        return;
      }
      if (!lastPosition) {
        // console.log("draw: No lastPosition");
        return;
      }

      const currentPos = getPointerPosition(eventInput);
      // console.log("draw: Current Pos:", currentPos, "Last Pos:", lastPosition);

      const context = contextRef.current;
      const tool = toolSettings[currentTool]; // Keep this for later

      // --- SIMPLIFIED DRAWING FOR DEBUGGING ---
      context.beginPath();
      context.moveTo(lastPosition.x, lastPosition.y);
      context.lineTo(currentPos.x, currentPos.y);
      context.strokeStyle = 'blue'; // Use a very obvious color
      context.lineWidth = 5;       // Use a very obvious line width
      context.lineCap = 'round';
      context.stroke();
      console.log(`draw: Line drawn from ${JSON.stringify(lastPosition)} to ${JSON.stringify(currentPos)}`);
      // --- END SIMPLIFIED DRAWING ---

      /* --- ORIGINAL COMPLEX DRAWING (Commented out for now) ---
      const dx = currentPos.x - lastPosition.x;
      const dy = currentPos.y - lastPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      if (currentTool !== 'smoother' && dist < tool.size / 3 ) return;

      if (currentTool === 'smoother') {
        // ... smoother logic ...
      } else { // Rakes
        // ... rake logic ...
      }
      */
      setLastPosition(currentPos);
    }, [isDrawing, lastPosition, currentTool, getPointerPosition, toolSettings, sandBaseColor, sandGrainColor, rakeLineColorDark, rakeLineColorLight, hexToRgb, setLastPosition]);

    const stopDrawing = useCallback(() => {
      console.log("stopDrawing: Called");
      setIsDrawing(false);
      setLastPosition(null);
    }, [setIsDrawing, setLastPosition]);

    // ... (handleToolChange, handleClearGarden) ...
    const handleToolChange = (tool) => {
        console.log("handleToolChange: New tool:", tool);
        setCurrentTool(tool);
    };

    const handleClearGarden = useCallback(() => {
        console.log("handleClearGarden: Clearing garden");
        drawSandTexture();
    }, [drawSandTexture]);


    const handleMouseDown = useCallback((e) => {
      console.log("handleMouseDown: Fired");
      e.preventDefault();
      startDrawing(e.nativeEvent);
    }, [startDrawing]);

    const handleMouseMove = useCallback((e) => {
      // console.log("handleMouseMove: Fired, isDrawing:", isDrawing); // Log frequently, can be noisy
      e.preventDefault();
      if (isDrawing) {
          draw(e.nativeEvent);
      }
    }, [isDrawing, draw]);

    const handleMouseUp = useCallback((e) => {
      console.log("handleMouseUp: Fired");
      e.preventDefault();
      stopDrawing();
    }, [stopDrawing]);

    const handleMouseLeave = useCallback((e) => {
      console.log("handleMouseLeave: Fired, isDrawing:", isDrawing);
      e.preventDefault();
      if (isDrawing) {
          stopDrawing();
      }
    }, [isDrawing, stopDrawing]);

    const handleTouchStart = useCallback((e) => {
      console.log("handleTouchStart: Fired, touches:", e.touches.length);
      if (e.touches.length > 0) {
        // e.preventDefault(); // Consider if needed
        startDrawing(e.touches[0]);
      }
    }, [startDrawing]);

    const handleTouchMove = useCallback((e) => {
      // console.log("handleTouchMove: Fired, isDrawing:", isDrawing, "touches:", e.touches.length); // Noisy
      if (isDrawing && e.touches.length > 0) {
        // e.preventDefault(); // Consider if needed
        draw(e.touches[0]);
      }
    }, [isDrawing, draw]);

    const handleTouchEnd = useCallback((e) => {
      console.log("handleTouchEnd: Fired");
      // e.preventDefault(); // Consider if needed
      stopDrawing();
    }, [stopDrawing]);


    // ... (return statement with JSX) ...
    return (
        <div className="zen-garden-container fade-in">
          {/* ... header and toolbar ... */}
          <div className="zen-garden-header">
            <button onClick={onBack} className="zen-back-button">
              {/* Replace RakeSmallIcon with a proper back arrow icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
              Back to Games
            </button>
            <h2 className="zen-game-title">{gameTitle || 'Zen Sand Garden'}</h2>
          </div>

          <div className="zen-garden-main">
            <div className="zen-toolbar">
              {/* ... buttons ... */}
              <button
                title="Small Rake"
                className={`tool-button ${currentTool === 'rake-small' ? 'active' : ''}`}
                onClick={() => handleToolChange('rake-small')}
              >
                <RakeSmallIcon />
              </button>
              <button
                title="Large Rake"
                className={`tool-button ${currentTool === 'rake-large' ? 'active' : ''}`}
                onClick={() => handleToolChange('rake-large')}
              >
                <RakeLargeIcon />
              </button>
              <button
                title="Smoother"
                className={`tool-button ${currentTool === 'smoother' ? 'active' : ''}`}
                onClick={() => handleToolChange('smoother')}
              >
                <SmootherIcon />
              </button>
              <button title="Clear Garden" className="tool-button clear-button" onClick={handleClearGarden}>
                <ClearIcon />
              </button>
            </div>
            <canvas
                ref={canvasRef}
                className="zen-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave} // Crucial
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd} // Good to handle cancel
            />
          </div>
          <p className="zen-garden-instructions">
            Click (or tap) and drag on the sand to rake. Select tools to change your pattern.
          </p>
        </div>
      );
};
export default ZenSandGarden;