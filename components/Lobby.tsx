
import React, { useState } from 'react';
import { GameMode } from '../types';

interface LobbyProps {
  onStart: (mode: GameMode) => void;
  onOnline: (isHost: boolean, joinId?: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ onStart, onOnline }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [joinId, setJoinId] = useState('');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 text-center">
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-blue-500/20 rounded-full absolute -top-4 -left-4 animate-pulse"></div>
        <i className="fa-solid fa-plane-up text-8xl text-blue-500 relative z-10"></i>
      </div>
      <h1 className="text-4xl font-black mb-2 tracking-tighter italic text-white">AIR STRIKE</h1>
      <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-xs">
        Real-time WiFi/Online Coordinates Battle.
      </p>
      
      {!showJoin ? (
        <div className="w-full space-y-4">
          <button 
            onClick={() => onStart(GameMode.VS_AI)}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 text-white"
          >
            <i className="fa-solid fa-robot"></i> VS COMPUTER
          </button>
          
          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => onOnline(true)}
              className="py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/40 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 text-white"
            >
              <i className="fa-solid fa-plus"></i> CREATE ROOM
            </button>
            <button 
              onClick={() => setShowJoin(true)}
              className="py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/40 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 text-white"
            >
              <i className="fa-solid fa-link"></i> JOIN ROOM
            </button>
          </div>

          <button 
            onClick={() => onStart(GameMode.LOCAL_PVP)}
            className="w-full py-3 text-slate-500 font-bold text-sm"
          >
            Local Pass & Play
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <input 
            type="text"
            placeholder="Enter Room ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="w-full px-4 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl text-center font-mono text-xl focus:border-blue-500 outline-none text-white"
          />
          <button 
            onClick={() => onOnline(false, joinId)}
            className="w-full py-4 bg-emerald-600 rounded-xl font-black text-white active:scale-95"
          >
            CONNECT NOW
          </button>
          <button 
            onClick={() => setShowJoin(false)}
            className="w-full py-2 text-slate-500 text-xs uppercase tracking-widest"
          >
            Go Back
          </button>
        </div>
      )}

      <div className="mt-8 text-left w-full p-4 bg-slate-800/50 rounded-lg text-[10px] text-slate-500 uppercase tracking-wider">
        <h4 className="font-bold text-slate-400 mb-2">Instructions:</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Create a room and share the ID.</li>
          <li>Both place aircraft in secret.</li>
          <li>Take turns shelling the enemy grid.</li>
        </ul>
      </div>
    </div>
  );
};

export default Lobby;
