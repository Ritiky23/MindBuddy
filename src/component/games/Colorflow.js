import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './Colorflow.css'; // Make sure this CSS file exists

// --- Level Data ---
const levels = [
    // Level 1: Simple 5x5
    {
        id: 1,
        name: "First Steps",
        gridSize: 5,
        dots: [
            { row: 0, col: 0, colorId: 0 }, { row: 4, col: 4, colorId: 0 }, // Red pair
            { row: 1, col: 0, colorId: 1 }, { row: 3, col: 3, colorId: 1 }, // Blue pair
            { row: 0, col: 2, colorId: 2 }, { row: 2, col: 4, colorId: 2 }, // Green pair
            { row: 4, col: 0, colorId: 3 }, { row: 2, col: 1, colorId: 3 }, // Yellow pair
        ],
        colors: ['#FF6B6B', '#4ECDC4', '#9EDE73', '#F9D423'] // Red, Teal, Green, Yellow
    },
    // Level 2: Slightly more complex 6x6
    {
        id: 2,
        name: "Cross Currents",
        gridSize: 6,
        dots: [
            { row: 0, col: 1, colorId: 0 }, { row: 4, col: 5, colorId: 0 }, // Red
            { row: 1, col: 1, colorId: 1 }, { row: 3, col: 3, colorId: 1 }, // Blue
            { row: 2, col: 0, colorId: 2 }, { row: 5, col: 3, colorId: 2 }, // Green
            { row: 0, col: 4, colorId: 3 }, { row: 3, col: 1, colorId: 3 }, // Yellow
            { row: 5, col: 0, colorId: 4 }, { row: 5, col: 5, colorId: 4 }, // Purple
        ],
        colors: ['#FF6B6B', '#4ECDC4', '#9EDE73', '#F9D423', '#A084E8'] // Added Purple
    },
     // Level 3: 7x7
     {
        id: 3,
        name: "The Maze",
        gridSize: 7,
        dots: [
            { row: 0, col: 0, colorId: 0 }, { row: 6, col: 6, colorId: 0 }, // Red
            { row: 0, col: 6, colorId: 1 }, { row: 6, col: 0, colorId: 1 }, // Blue
            { row: 1, col: 1, colorId: 2 }, { row: 5, col: 5, colorId: 2 }, // Green
            { row: 1, col: 5, colorId: 3 }, { row: 5, col: 1, colorId: 3 }, // Yellow
            { row: 3, col: 0, colorId: 4 }, { row: 3, col: 6, colorId: 4 }, // Purple
            { row: 0, col: 3, colorId: 5 }, { row: 6, col: 3, colorId: 5 }, // Orange
        ],
        colors: ['#FF6B6B', '#4ECDC4', '#9EDE73', '#F9D423', '#A084E8', '#FFA07A'] // Added Orange
    },
];

// --- Helper: Get cell identifier string ---
const getCellId = (row, col) => `${row}-${col}`;

// --- Icon Components ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"> <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /> </svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M15.312 11.342a1.25 1.25 0 01.884.884l1.296 1.296a1.25 1.25 0 11-1.768 1.768l-1.296-1.296a1.25 1.25 0 01-.884-.884 6.25 6.25 0 114.307-6.06l.75-.75a.75.75 0 111.06 1.06l-1.5 1.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.75.75a7.75 7.75 0 10-5.307 7.304 1.25 1.25 0 01-.884.884l-1.296 1.296a1.25 1.25 0 11-1.768-1.768l1.296-1.296a1.25 1.25 0 01.884-.884A6.25 6.25 0 0115.312 11.342z" clipRule="evenodd" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="24" height="24"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>;


const ColorFlow = ({ gameTitle, onBack }) => {
    // --- State Variables ---
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [level, setLevel] = useState(levels[0]);
    const [gridState, setGridState] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingColorId, setDrawingColorId] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [completedPaths, setCompletedPaths] = useState({});
    const [isWon, setIsWon] = useState(false);
    const gridRef = useRef(null);

    // --- Helper Function: Update Cell ---
    // Creates a *new* grid state with the cell at [r][c] updated
    const updateCellPath = (grid, r, c, colorId, fromDir, toDir, isDotOverride = null) => {
        const newGrid = grid.map(row => [...row]);
        const currentCell = newGrid[r][c];
        const newPathDir = colorId !== null ? {
            from: fromDir ?? currentCell.pathDir.from,
            to: toDir ?? currentCell.pathDir.to
        } : { from: null, to: null };

        newGrid[r][c] = {
            ...currentCell,
            dotColorId: isDotOverride !== null ? (colorId !== null ? colorId : null) : currentCell.dotColorId,
            isEnd: isDotOverride !== null ? (colorId !== null) : currentCell.isEnd,
            pathColorId: colorId,
            pathDir: newPathDir
        };
        return newGrid;
    };

    // --- Helper Function: Clear Path ---
    // *Corrected Version*: Operates on passed grid and returns new grid
    const clearPath = useCallback((colorIdToClear, currentGridState) => {
        console.log(`Clearing path for colorId: ${colorIdToClear}`);
        let gridAfterClear = currentGridState.map(row =>
            row.map(cell => {
                if (cell.pathColorId === colorIdToClear) {
                    return { ...cell, pathColorId: null, pathDir: { from: null, to: null } };
                }
                if (cell.dotColorId === colorIdToClear && (cell.pathDir.from || cell.pathDir.to)) {
                     return { ...cell, pathDir: { from: null, to: null } }
                }
                return cell;
            })
        );
        setCompletedPaths(prev => {
             const newCompleted = {...prev};
             delete newCompleted[colorIdToClear];
             return newCompleted;
        });
        return gridAfterClear;
    }, []); // No external dependencies needed for the core logic


    // --- Initialize/Load Level ---
    const loadLevel = useCallback((levelIndex) => {
        console.log(`Loading level ${levelIndex + 1}`);
        const newLevel = levels[levelIndex];
        setLevel(newLevel);
        setCurrentLevelIndex(levelIndex);

        const initialGrid = Array(newLevel.gridSize).fill(null).map((_, r) =>
            Array(newLevel.gridSize).fill(null).map((_, c) => ({
                dotColorId: null,
                pathColorId: null,
                isEnd: false,
                pathDir: { from: null, to: null }
            }))
        );

        newLevel.dots.forEach(dot => {
            initialGrid[dot.row][dot.col] = {
                ...initialGrid[dot.row][dot.col],
                dotColorId: dot.colorId,
                isEnd: true
            };
        });

        setGridState(initialGrid);
        setCompletedPaths({});
        setIsDrawing(false);
        setDrawingColorId(null);
        setCurrentPath([]);
        setIsWon(false);
    }, []); // Empty dependency array: defines the function once

    // Load initial level on mount
    useEffect(() => {
        loadLevel(0);
    }, [loadLevel]); // Run when loadLevel function is defined

    // --- Check Win Condition ---
    useEffect(() => {
        if (level && Object.keys(completedPaths).length === level.colors.length) {
             console.log("All pairs connected!");
            setIsWon(true);
        } else {
            setIsWon(false);
        }
    }, [completedPaths, level]); // Check only when completedPaths or level changes


    // --- Path Drawing Logic ---

    // Helper to get grid coordinates from event
    const getCellFromEvent = useCallback((event) => {
        if (!gridRef.current || !level) return null; // Ensure level is loaded

        const gridRect = gridRef.current.getBoundingClientRect();
        let clientX, clientY;

        if (event.touches && event.touches[0]) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        const x = clientX - gridRect.left;
        const y = clientY - gridRect.top;

        // Ensure gridSize is available
        const gridSize = level.gridSize;
        if(!gridSize) return null;

        const col = Math.floor((x / gridRect.width) * gridSize);
        const row = Math.floor((y / gridRect.height) * gridSize);

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            return { row, col };
        }
        return null;
    }, [level]); // Depends on level to get gridSize


    // --- Start Drawing ---
    // *Corrected Version*
    const handleInteractionStart = useCallback((event) => {
        if (isWon || isDrawing) return;

        const cellCoords = getCellFromEvent(event.nativeEvent || event);
        if (!cellCoords) return;

        const { row, col } = cellCoords;

        setGridState(currentGridState => { // Functional update
            const startCell = currentGridState[row]?.[col];
            if (!startCell || startCell.dotColorId === null) {
                 return currentGridState;
            }

            const colorId = startCell.dotColorId;
            let gridForDrawing = currentGridState;
            const pathExists = currentGridState.flat().some(c => c.pathColorId === colorId);

             if (completedPaths[colorId] || pathExists) {
                gridForDrawing = clearPath(colorId, currentGridState);
             }

            setIsDrawing(true);
            setDrawingColorId(colorId);
            setCurrentPath([{ row, col }]); // Set initial path state

            return updateCellPath(gridForDrawing, row, col, colorId, null, null); // Update grid
        });

    }, [isWon, isDrawing, clearPath, completedPaths, getCellFromEvent]);


    // --- Continue Drawing ---
    // *Corrected Version*
    const handleInteractionMove = useCallback((event) => {
        if (!isDrawing || drawingColorId === null) return;

        const cellCoords = getCellFromEvent(event.nativeEvent || event);
        if (!cellCoords) return;

        const { row, col } = cellCoords;

        setCurrentPath(currentPathState => { // Functional update for path
            const lastPathCell = currentPathState[currentPathState.length - 1];
            if (!lastPathCell || (row === lastPathCell.row && col === lastPathCell.col)) {
                return currentPathState; // No change
            }

            let newPath = [...currentPathState];
            const previousCellIndex = currentPathState.findIndex(p => p.row === row && p.col === col);

            // --- Erasure Logic ---
            if (previousCellIndex !== -1) {
                const cellsToClear = newPath.splice(previousCellIndex + 1);
                if (cellsToClear.length > 0) {
                    setGridState(prevGrid => { // Functional update for grid
                        let gridAfterErase = prevGrid.map(r => [...r]);
                        cellsToClear.forEach(cellToClear => {
                             const targetCell = gridAfterErase[cellToClear.row][cellToClear.col];
                             if (targetCell.dotColorId === null) {
                                gridAfterErase = updateCellPath(gridAfterErase, cellToClear.row, cellToClear.col, null, null, null);
                             } else {
                                 gridAfterErase = updateCellPath(gridAfterErase, cellToClear.row, cellToClear.col, null, null, null); // Reset dot path directions too
                             }
                        });
                        const newLastCell = newPath[newPath.length - 1];
                        gridAfterErase = updateCellPath(gridAfterErase, newLastCell.row, newLastCell.col, drawingColorId, gridAfterErase[newLastCell.row][newLastCell.col].pathDir.from, null);
                        return gridAfterErase;
                    });
                }
                return newPath; // Return shortened path
            }

            // --- Extension Logic ---
            let pathExtended = false; // Flag to check if path was actually extended in grid state
            setGridState(prevGrid => { // Functional update for grid
                 const currentGridCell = prevGrid[row]?.[col];
                 const lastGridCellPos = newPath[newPath.length - 1];

                 if (!currentGridCell || !lastGridCellPos) return prevGrid; // Safety check

                 // Check for invalid moves
                 if ((currentGridCell.pathColorId !== null && currentGridCell.pathColorId !== drawingColorId) ||
                     (currentGridCell.dotColorId !== null && currentGridCell.dotColorId !== drawingColorId))
                 {
                    console.log(`Invalid move: Cell [${row}, ${col}] blocked.`);
                    return prevGrid; // No grid change
                 }

                 // Calculate direction
                 let fromDir = null, toDirForPrev = null;
                 if (row > lastGridCellPos.row) { fromDir = 'top'; toDirForPrev = 'bottom'; }
                 else if (row < lastGridCellPos.row) { fromDir = 'bottom'; toDirForPrev = 'top'; }
                 else if (col > lastGridCellPos.col) { fromDir = 'left'; toDirForPrev = 'right'; }
                 else if (col < lastGridCellPos.col) { fromDir = 'right'; toDirForPrev = 'left'; }

                 let gridAfterUpdate = prevGrid.map(r => [...r]);
                 // Update previous cell
                 gridAfterUpdate = updateCellPath(gridAfterUpdate, lastGridCellPos.row, lastGridCellPos.col, drawingColorId, gridAfterUpdate[lastGridCellPos.row][lastGridCellPos.col].pathDir.from, toDirForPrev);
                 // Update current cell
                 gridAfterUpdate = updateCellPath(gridAfterUpdate, row, col, drawingColorId, fromDir, null);

                 pathExtended = true; // Mark that grid was updated

                 // Check if the current cell is the target end dot
                 const isEndDot = currentGridCell?.dotColorId === drawingColorId;
                 if (isEndDot) {
                    console.log("Reached end dot during move.");
                    // Do nothing extra here, handleInteractionEnd will finalize
                 }
                 return gridAfterUpdate; // Return updated grid
            });

             // Only update the React path state if the grid state was actually updated
             if(pathExtended){
                 const checkGridCell = gridState[row]?.[col]; // Re-check the *current* (potentially updated) grid state
                 const isEndDot = checkGridCell?.dotColorId === drawingColorId;
                 if (!isEndDot) { // Don't add end dot here, let handleEnd manage it
                    newPath.push({ row, col });
                 } else {
                    // Add end dot to path state if we landed on it, so handleEnd knows
                     newPath.push({ row, col });
                 }
             }

             return newPath; // Return potentially updated path

        }); // End setCurrentPath functional update

    }, [isDrawing, drawingColorId, gridState, getCellFromEvent]); // Include gridState dependency


    // --- End Drawing ---
    // *Corrected Version*
    const handleInteractionEnd = useCallback(() => {
        if (!isDrawing) return;
        console.log("Interaction End");

        // Use state directly, functional update in setGridState ensures latest
        const finalPath = currentPath;
        const finalColorId = drawingColorId;

         setGridState(prevGrid => { // Functional update for grid
            let gridOnEnd = prevGrid.map(r => [...r]);

            if (!finalPath || finalPath.length < 2 || finalColorId === null) {
                // Clear path state of the single start dot if path was invalid
                if (finalPath && finalPath.length === 1) {
                     const startDot = finalPath[0];
                     gridOnEnd = updateCellPath(gridOnEnd, startDot.row, startDot.col, null, null, null);
                }
                return gridOnEnd; // Return cleaned or unchanged grid
            }

            const lastPathCellPos = finalPath[finalPath.length - 1];
            const endCell = gridOnEnd[lastPathCellPos.row]?.[lastPathCellPos.col];
            const startCellPos = finalPath[0];
            const isCorrectEndDot = endCell?.dotColorId === finalColorId && !(lastPathCellPos.row === startCellPos.row && lastPathCellPos.col === startCellPos.col);

            if (isCorrectEndDot) {
                console.log(`Path completed successfully for color: ${finalColorId}!`);
                setCompletedPaths(prevComp => ({ ...prevComp, [finalColorId]: true }));
                // Final grid state already reflects connection from handleInteractionMove
            } else {
                console.log("Path ended incorrectly. Clearing drawn path.");
                // Use clearPath logic on the current path attempt
                finalPath.forEach(cellPos => {
                    const cell = gridOnEnd[cellPos.row][cellPos.col];
                    if (cell.dotColorId !== finalColorId) {
                         gridOnEnd = updateCellPath(gridOnEnd, cellPos.row, cellPos.col, null, null, null);
                    } else {
                         gridOnEnd = updateCellPath(gridOnEnd, cellPos.row, cellPos.col, null, null, null); // Also reset dot directions
                    }
                });
            }
             return gridOnEnd;
        });

        // Reset drawing state AFTER grid update is queued
        setIsDrawing(false);
        setDrawingColorId(null);
        setCurrentPath([]);

    }, [isDrawing, currentPath, drawingColorId]); // Dependencies

    // --- Event Listeners ---
    useEffect(() => {
        const gridElement = gridRef.current;
        if (!gridElement) return;

        const touchMoveOptions = { passive: false }; // Need to preventDefault scroll

        const handleTouchMove = (e) => {
             // Only prevent default if drawing is active, allowing normal scroll otherwise
             if(isDrawing) {
                e.preventDefault();
             }
            handleInteractionMove(e.touches[0]);
        };

        // Mouse
        gridElement.addEventListener('mousedown', handleInteractionStart);
        window.addEventListener('mousemove', handleInteractionMove);
        window.addEventListener('mouseup', handleInteractionEnd);
        // Touch
        gridElement.addEventListener('touchstart', handleInteractionStart, { passive: true }); // Can be passive
        gridElement.addEventListener('touchmove', handleTouchMove, touchMoveOptions);
        window.addEventListener('touchend', handleInteractionEnd);

        return () => {
            gridElement.removeEventListener('mousedown', handleInteractionStart);
            window.removeEventListener('mousemove', handleInteractionMove);
            window.removeEventListener('mouseup', handleInteractionEnd);
            gridElement.removeEventListener('touchstart', handleInteractionStart);
            gridElement.removeEventListener('touchmove', handleTouchMove, touchMoveOptions);
            window.removeEventListener('touchend', handleInteractionEnd);
        };
        // DEPENDENCIES: Include the handlers!
    }, [handleInteractionStart, handleInteractionMove, handleInteractionEnd, isDrawing]); // isDrawing added to maybe optimize touchmove preventDefault


    // --- Reset and Level Change ---
    const handleReset = () => {
        console.log("Resetting level");
        loadLevel(currentLevelIndex);
    };
    const handleNextLevel = () => {
        const nextIndex = (currentLevelIndex + 1) % levels.length;
        loadLevel(nextIndex);
    };
     const handlePrevLevel = () => {
         const prevIndex = (currentLevelIndex - 1 + levels.length) % levels.length;
         loadLevel(prevIndex);
     };


    // --- Rendering ---
    const renderCell = (cell, row, col) => {
        const cellId = getCellId(row, col);
        const isDot = cell.dotColorId !== null;
        const isPath = cell.pathColorId !== null;
        const colorId = isPath ? cell.pathColorId : (isDot ? cell.dotColorId : null);
        const color = colorId !== null ? level.colors[colorId] : null;
        const isCompleted = colorId !== null && completedPaths[colorId];

        const classes = [
            'grid-cell',
            isDot ? 'is-dot' : '',
            isPath ? 'is-path' : '',
            isCompleted ? 'is-completed' : '',
            cell.pathDir.from ? `path-from-${cell.pathDir.from}` : '',
            cell.pathDir.to ? `path-to-${cell.pathDir.to}` : '',
        ].filter(Boolean).join(' ');

        const style = {
            backgroundColor: isPath ? color + 'bb' : 'transparent', // Slightly more opaque path
             '--path-color': color,
             '--dot-color': isDot ? color : 'transparent'
        };

        return (
            <div key={cellId} className={classes} style={style}>
                {isDot && (
                    <div className="dot" style={{ backgroundColor: color }}>
                       {!completedPaths[colorId] && <div className="dot-pulse"></div>}
                    </div>
                )}
            </div>
        );
    };

    // --- Component Return ---
    if (!level || gridState.length === 0) {
        return <div className="loading-placeholder">Loading Level...</div>; // Basic loading state
    }

    return (
        <div className="colorflow-container fade-in">
             {/* Header */}
            <div className="colorflow-header">
                <button onClick={onBack} className="colorflow-button subtle" aria-label="Back to Games">
                    <BackIcon />
                </button>
                <div className='level-selector'>
                    <button onClick={handlePrevLevel} className="colorflow-button level-nav" disabled={levels.length <= 1 || isDrawing} aria-label="Previous Level"></button>
                     <h2 className="colorflow-title">{gameTitle || 'Color Flow'} - <span>{level.name} ({level.gridSize}x{level.gridSize})</span></h2>
                    <button onClick={handleNextLevel} className="colorflow-button level-nav" disabled={levels.length <= 1 || isDrawing} aria-label="Next Level"></button>
                </div>
                 <button onClick={handleReset} className="colorflow-button subtle" title="Reset Level" disabled={isDrawing}>
                    <RefreshIcon />
                </button>
            </div>

            {/* Game Grid */}
            <div className="colorflow-grid-area" onContextMenu={(e) => e.preventDefault()}>
                <div
                    ref={gridRef}
                    className={`colorflow-grid ${isDrawing ? 'is-drawing' : ''}`} // Add drawing class if needed
                    style={{ '--grid-size': level.gridSize }}
                    >
                    {gridState.map((rowArr, rowIndex) =>
                        rowArr.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
                    )}
                </div>
            </div>

             {/* Win Message Overlay */}
             {isWon && (
                <div className="colorflow-win-overlay fade-in">
                    <div className="colorflow-win-message">
                        <CheckIcon />
                        <h3>Level Complete!</h3>
                        <p>{level.name} solved.</p>
                        {currentLevelIndex < levels.length - 1 ? (
                            <button onClick={handleNextLevel} className="colorflow-button primary large">
                                Next Level
                            </button>
                         ) : (
                             <p>You've completed all levels!</p>
                         )}
                         <button onClick={handleReset} className="colorflow-button subtle large">
                             Play Again
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};

ColorFlow.propTypes = {
    gameTitle: PropTypes.string,
    onBack: PropTypes.func.isRequired,
};

export default ColorFlow;