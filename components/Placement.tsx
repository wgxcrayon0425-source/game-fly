
import React, { useState } from 'react';
import { Plane, Direction, Point } from '../types';
import { PLANES_COUNT, getPlaneBodyParts, isPlaneValid } from '../constants';
import Grid from './Grid';

interface PlacementProps {
  player: number;
  onComplete: (planes: Plane[]) => void;
}

const Placement: React.FC<PlacementProps> = ({ player, onComplete }) => {
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [currentDir, setCurrentDir] = useState<Direction>(Direction.UP);

  const handleCellClick = (r: number, c: number) => {
    if (planes.length >= PLANES_COUNT) return;

    const existingPoints = planes.flatMap(p => [p.head, ...p.bodyParts]);
    if (isPlaneValid({ r, c }, currentDir, existingPoints)) {
      const newPlane: Plane = {
        id: Date.now().toString(),
        head: { r, c },
        direction: currentDir,
        isDead: false,
        bodyParts: getPlaneBodyParts({ r, c }, currentDir)
      };
      setPlanes([...planes, newPlane]);
    }
  };

  const removePlane = (id: string) => {
    setPlanes(planes.filter(p => p.id !== id));
  };

  const rotate = () => {
    const dirs = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
    const nextIdx = (dirs.indexOf(currentDir) + 1) % dirs.length;
    setCurrentDir(dirs[nextIdx]);
  };

  const renderCell = (r: number, c: number) => {
    const isHead = planes.some(p => p.head.r === r && p.head.c === c);
    const isBody = planes.some(p => p.bodyParts.some(bp => bp.r === r && bp.c === c));
    
    if (isHead) return <div className="w-5 h-5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>;
    if (isBody) return <div className="w-4 h-4 rounded-sm bg-blue-600/60"></div>;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-blue-400">PLAYER {player}</h2>
        <p className="text-slate-400 text-sm">Place your aircraft ({planes.length}/{PLANES_COUNT})</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Grid 
          onCellClick={handleCellClick} 
          renderCell={renderCell} 
          title="AIRCRAFT PLACEMENT" 
        />
      </div>

      <div className="p-4 bg-slate-800 rounded-xl mt-4 flex items-center justify-between shadow-lg">
        <div className="flex gap-2 items-center">
          <div className="text-xs text-slate-400 font-bold uppercase mr-2">TOOL:</div>
          <button 
            onClick={rotate}
            className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl text-blue-400 hover:bg-slate-600 transition-colors active:scale-90"
          >
            <i className={`fa-solid fa-arrow-rotate-right transition-transform duration-300 ${currentDir === Direction.UP ? '' : currentDir === Direction.RIGHT ? 'rotate-90' : currentDir === Direction.DOWN ? 'rotate-180' : '-rotate-90'}`}></i>
          </button>
          <div className="text-[10px] text-slate-500 uppercase font-mono">{currentDir}</div>
        </div>
        
        <button 
          disabled={planes.length < PLANES_COUNT}
          onClick={() => onComplete(planes)}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${planes.length === PLANES_COUNT ? 'bg-blue-600 shadow-blue-900/40 text-white active:scale-95' : 'bg-slate-700 text-slate-500'}`}
        >
          CONFIRM
        </button>
      </div>
      
      <div className="mt-4 flex gap-2">
        {planes.length > 0 && (
           <button onClick={() => setPlanes([])} className="text-xs text-red-500 font-bold uppercase tracking-widest px-2 py-1">
             Reset All
           </button>
        )}
      </div>
    </div>
  );
};

export default Placement;
