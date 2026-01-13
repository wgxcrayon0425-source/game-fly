
import React from 'react';
import { GRID_SIZE } from '../constants';

interface GridProps {
  onCellClick?: (r: number, c: number) => void;
  renderCell: (r: number, c: number) => React.ReactNode;
  title?: string;
  disabled?: boolean;
}

const Grid: React.FC<GridProps> = ({ onCellClick, renderCell, title, disabled }) => {
  const coords = Array.from({ length: GRID_SIZE }, (_, i) => i);

  return (
    <div className={`flex flex-col items-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {title && <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">{title}</h3>}
      <div className="relative bg-slate-800 p-2 rounded-lg border-2 border-slate-700 shadow-2xl">
        {/* Column Labels */}
        <div className="flex ml-6">
          {coords.map(c => (
            <div key={c} className="w-8 h-6 flex items-center justify-center text-[10px] text-slate-500 font-mono">
              {c}
            </div>
          ))}
        </div>
        <div className="flex">
          {/* Row Labels */}
          <div className="flex flex-col">
            {coords.map(r => (
              <div key={r} className="w-6 h-8 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                {r}
              </div>
            ))}
          </div>
          {/* Main Grid */}
          <div className="grid grid-cols-10 gap-px bg-slate-700 border border-slate-700">
            {coords.map(r => 
              coords.map(c => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => onCellClick?.(r, c)}
                  className="w-8 h-8 bg-slate-900 flex items-center justify-center cursor-pointer active:bg-slate-700 transition-colors"
                >
                  {renderCell(r, c)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grid;
