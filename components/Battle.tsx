
import React, { useState } from 'react';
import { BattleState, CellStatus } from '../types';
import Grid from './Grid';

interface BattleProps {
  state: BattleState;
  onAttack: (r: number, c: number) => void;
  isAITurn: boolean;
  myPlayerNum?: 1 | 2;
}

const Battle: React.FC<BattleProps> = ({ state, onAttack, isAITurn, myPlayerNum }) => {
  const [view, setView] = useState<'RADAR' | 'MY_FLEET'>('RADAR');
  const { currentPlayer, p1Radar, p2Radar, p1Planes, p2Planes } = state;
  
  const currentRadar = currentPlayer === 1 ? p1Radar : p2Radar;
  const myPlanes = myPlayerNum === 2 ? p2Planes : p1Planes;
  const enemyRadarAtMe = myPlayerNum === 2 ? p1Radar : p2Radar;

  const isMyTurn = myPlayerNum ? currentPlayer === myPlayerNum : true;

  const renderRadarCell = (r: number, c: number) => {
    const status = currentRadar[`${r},${c}`];
    if (status === CellStatus.EMPTY) return <div className="w-3 h-3 rounded-full border border-slate-500"></div>;
    if (status === CellStatus.INJURED) return <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>;
    if (status === CellStatus.DEAD) return <i className="fa-solid fa-skull text-red-500 text-xs animate-bounce"></i>;
    return null;
  };

  const renderMyFleetCell = (r: number, c: number) => {
    const isHead = myPlanes.some(p => p.head.r === r && p.head.c === c);
    const isBody = myPlanes.some(p => p.bodyParts.some(bp => bp.r === r && bp.c === c));
    const enemyAttack = enemyRadarAtMe[`${r},${c}`];

    let content = null;
    if (isHead) content = <div className="w-4 h-4 rounded-full bg-blue-400"></div>;
    else if (isBody) content = <div className="w-3 h-3 bg-blue-800"></div>;

    if (enemyAttack === CellStatus.INJURED || enemyAttack === CellStatus.DEAD) {
        return (
            <div className="relative flex items-center justify-center w-full h-full">
                {content}
                <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                    <div className="w-full h-px bg-red-500 rotate-45 absolute"></div>
                    <div className="w-full h-px bg-red-500 -rotate-45 absolute"></div>
                </div>
            </div>
        );
    }
    
    return content;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 p-4 relative">
      <div className="flex justify-between items-center mb-6">
        <div className={`p-3 rounded-xl transition-all ${currentPlayer === 1 ? 'bg-blue-600' : 'bg-slate-800 opacity-50'}`}>
          <div className="text-[10px] uppercase font-bold text-slate-300">Player 1</div>
          <div className="flex gap-1 mt-1">
            {p1Planes.map((p, i) => (
              <i key={i} className={`fa-solid fa-plane text-[10px] ${p.isDead ? 'text-slate-500' : 'text-blue-300'}`}></i>
            ))}
          </div>
        </div>

        <div className="text-center">
            <div className="text-[10px] text-slate-500 font-mono mb-1">BATTLE</div>
            <div className={`text-xs font-black px-3 py-1 rounded-full ${isMyTurn ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 bg-slate-500/10'}`}>
              {isAITurn ? 'AI THINKING...' : (isMyTurn ? 'YOUR TURN' : "OPPONENT'S TURN")}
            </div>
        </div>

        <div className={`p-3 rounded-xl transition-all ${currentPlayer === 2 ? 'bg-emerald-600' : 'bg-slate-800 opacity-50'}`}>
          <div className="text-[10px] uppercase font-bold text-slate-300">Player 2</div>
          <div className="flex gap-1 mt-1">
            {p2Planes.map((p, i) => (
              <i key={i} className={`fa-solid fa-plane text-[10px] ${p.isDead ? 'text-slate-500' : 'text-emerald-300'}`}></i>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {view === 'RADAR' ? (
          <Grid 
            title="TARGET RADAR"
            renderCell={renderRadarCell}
            onCellClick={onAttack}
            disabled={!isMyTurn || isAITurn}
          />
        ) : (
          <Grid 
            title="MY FLEET STATUS"
            renderCell={renderMyFleetCell}
            disabled={true}
          />
        )}
      </div>

      <div className="mt-8 flex justify-center p-2 bg-slate-800 rounded-2xl">
        <button 
          onClick={() => setView('RADAR')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${view === 'RADAR' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
        >
          RADAR
        </button>
        <button 
          onClick={() => setView('MY_FLEET')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${view === 'MY_FLEET' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
        >
          MY FLEET
        </button>
      </div>
      
      {!isMyTurn && view === 'RADAR' && (
        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none flex items-center justify-center">
           <div className="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-slate-400 border border-slate-700 shadow-2xl">
             WAITING FOR OPPONENT...
           </div>
        </div>
      )}
    </div>
  );
};

export default Battle;
