
import React from 'react';

interface GameOverProps {
  winner: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ winner, onRestart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 text-center">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full"></div>
        <i className="fa-solid fa-trophy text-8xl text-yellow-500 relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"></i>
      </div>
      
      <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">VICTORY</h1>
      <p className="text-xl font-bold text-yellow-500 mb-12 uppercase tracking-[0.2em]">PLAYER {winner} WINS</p>
      
      <div className="w-full space-y-4">
        <button 
          onClick={onRestart}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-lg transition-transform active:scale-95 shadow-xl shadow-blue-900/40"
        >
          NEW MISSION
        </button>
      </div>
      
      <p className="mt-8 text-slate-600 text-[10px] uppercase font-bold tracking-widest">Operation Complete</p>
    </div>
  );
};

export default GameOver;
