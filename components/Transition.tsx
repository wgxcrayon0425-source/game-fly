
import React from 'react';

interface TransitionProps {
  nextPlayer: number;
  isBattle: boolean;
  onContinue: () => void;
}

const Transition: React.FC<TransitionProps> = ({ nextPlayer, isBattle, onContinue }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-8 text-center">
      <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center mb-8 animate-pulse">
        <i className="fa-solid fa-user-secret text-4xl text-slate-600"></i>
      </div>
      <h2 className="text-2xl font-bold text-slate-300 mb-2 uppercase tracking-widest">Pass the Phone</h2>
      <p className="text-slate-500 text-sm mb-12">
        Hand the device to <span className="text-blue-400 font-bold">PLAYER {nextPlayer}</span>.<br/>
        Ensure your fleet remains top secret!
      </p>
      
      <button 
        onClick={onContinue}
        className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-xl text-lg hover:bg-white active:scale-95 transition-all shadow-2xl shadow-white/10"
      >
        I AM PLAYER {nextPlayer}
      </button>
    </div>
  );
};

export default Transition;
