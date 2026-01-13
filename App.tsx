
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase, GameMode, Plane, CellStatus, Direction, BattleState, NetworkMessage } from './types';
import { PLANES_COUNT, GRID_SIZE, isPlaneValid, getPlaneBodyParts } from './constants';
import Lobby from './components/Lobby';
import Placement from './components/Placement';
import Battle from './components/Battle';
import Transition from './components/Transition';
import GameOver from './components/GameOver';

// PeerJS globally available from script tag
declare var Peer: any;

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.LOBBY);
  const [mode, setMode] = useState<GameMode>(GameMode.LOCAL_PVP);
  const [myPlayerNum, setMyPlayerNum] = useState<1 | 2>(1);
  const [battleState, setBattleState] = useState<BattleState>({
    currentPlayer: 1,
    p1Planes: [],
    p2Planes: [],
    p1Radar: {},
    p2Radar: {},
    winner: null
  });

  const [peerId, setPeerId] = useState<string>('');
  const [opponentReady, setOpponentReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);

  const initPeer = (isHost: boolean, joinId?: string) => {
    setPhase(GamePhase.CONNECTING);
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id: string) => {
      setPeerId(id);
      if (!isHost && joinId) {
        const conn = peer.connect(joinId);
        setupConnection(conn, false);
      }
    });

    peer.on('connection', (conn: any) => {
      if (isHost) {
        setupConnection(conn, true);
      }
    });

    peer.on('error', (err: any) => {
      console.error(err);
      alert("Connection error: " + err.type);
      setPhase(GamePhase.LOBBY);
    });
  };

  const setupConnection = (conn: any, isHost: boolean) => {
    connRef.current = conn;
    conn.on('open', () => {
      setMode(GameMode.ONLINE_PVP);
      setMyPlayerNum(isHost ? 1 : 2);
      setPhase(GamePhase.PLACEMENT_P1);
    });

    conn.on('data', (data: NetworkMessage) => {
      handleNetworkMessage(data);
    });

    conn.on('close', () => {
      alert("Opponent disconnected");
      window.location.reload();
    });
  };

  const copyId = () => {
    if (!peerId) return;
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNetworkMessage = (msg: NetworkMessage) => {
    switch (msg.type) {
      case 'READY':
        setBattleState(prev => ({
          ...prev,
          [myPlayerNum === 1 ? 'p2Planes' : 'p1Planes']: msg.planes
        }));
        setOpponentReady(true);
        break;
      case 'ATTACK':
        handleRemoteAttack(msg.r, msg.c);
        break;
      case 'RESULT':
        handleRemoteResult(msg.r, msg.c, msg.status);
        break;
    }
  };

  const handleRemoteAttack = (r: number, c: number) => {
    setBattleState(prev => {
      const myPlanes = myPlayerNum === 1 ? prev.p1Planes : prev.p2Planes;
      let status: CellStatus = CellStatus.EMPTY;
      
      const hitHead = myPlanes.find(p => !p.isDead && p.head.r === r && p.head.c === c);
      if (hitHead) {
        status = CellStatus.DEAD;
        hitHead.isDead = true;
      } else {
        const hitBody = myPlanes.find(p => !p.isDead && p.bodyParts.some(bp => bp.r === r && bp.c === c));
        if (hitBody) status = CellStatus.INJURED;
      }

      connRef.current?.send({ type: 'RESULT', r, c, status });

      const newState = { 
        ...prev, 
        currentPlayer: myPlayerNum,
        [myPlayerNum === 1 ? 'p1Planes' : 'p2Planes']: [...myPlanes]
      };

      if (myPlanes.every(p => p.isDead)) {
        newState.winner = myPlayerNum === 1 ? 2 : 1;
        setPhase(GamePhase.OVER);
      }
      return newState;
    });
  };

  const handleRemoteResult = (r: number, c: number, status: CellStatus) => {
    setBattleState(prev => {
      const radarKey = myPlayerNum === 1 ? 'p1Radar' : 'p2Radar';
      const updatedRadar = { ...prev[radarKey], [`${r},${c}`]: status };
      
      return {
        ...prev,
        [radarKey]: updatedRadar,
        currentPlayer: myPlayerNum === 1 ? 2 : 1
      };
    });
  };

  useEffect(() => {
    if (mode === GameMode.ONLINE_PVP && opponentReady && 
        battleState.p1Planes.length > 0 && battleState.p2Planes.length > 0 &&
        phase === GamePhase.WAITING_FOR_OPPONENT) {
      setPhase(GamePhase.BATTLE);
    }
  }, [opponentReady, battleState.p1Planes.length, battleState.p2Planes.length, phase]);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase(GamePhase.PLACEMENT_P1);
  };

  const onPlanesPlaced = (planes: Plane[]) => {
    if (mode === GameMode.ONLINE_PVP) {
      setBattleState(prev => ({
        ...prev,
        [myPlayerNum === 1 ? 'p1Planes' : 'p2Planes']: planes
      }));
      connRef.current?.send({ type: 'READY', planes });
      
      if (!opponentReady || (myPlayerNum === 1 ? battleState.p2Planes.length === 0 : battleState.p1Planes.length === 0)) {
        setPhase(GamePhase.WAITING_FOR_OPPONENT);
      } else {
        setPhase(GamePhase.BATTLE);
      }
      return;
    }

    if (phase === GamePhase.PLACEMENT_P1) {
      setBattleState(prev => ({ ...prev, p1Planes: planes }));
      if (mode === GameMode.VS_AI) {
        const aiPlanes = generateAIPlanes();
        setBattleState(prev => ({ ...prev, p2Planes: aiPlanes }));
        setPhase(GamePhase.BATTLE);
      } else {
        setPhase(GamePhase.TRANSITION);
      }
    } else {
      setBattleState(prev => ({ ...prev, p2Planes: planes }));
      setPhase(GamePhase.BATTLE);
    }
  };

  const handleAttack = (r: number, c: number) => {
    if (mode === GameMode.ONLINE_PVP) {
      if (battleState.currentPlayer !== myPlayerNum) return;
      connRef.current?.send({ type: 'ATTACK', r, c });
      return;
    }

    const { currentPlayer, p1Planes, p2Planes, p1Radar, p2Radar } = battleState;
    const targetPlanes = currentPlayer === 1 ? p2Planes : p1Planes;
    const currentRadar = currentPlayer === 1 ? p1Radar : p2Radar;
    const key = `${r},${c}`;

    if (currentRadar[key]) return;

    let result: CellStatus = CellStatus.EMPTY;
    let updatedPlanes = [...targetPlanes];
    const hitPlane = updatedPlanes.find(p => !p.isDead && p.head.r === r && p.head.c === c);
    if (hitPlane) { result = CellStatus.DEAD; hitPlane.isDead = true; }
    else {
      const injuredPlane = updatedPlanes.find(p => !p.isDead && p.bodyParts.some(bp => bp.r === r && bp.c === c));
      if (injuredPlane) result = CellStatus.INJURED;
    }

    const nextRadar = { ...currentRadar, [key]: result };
    const nextBattleState = {
      ...battleState,
      [currentPlayer === 1 ? 'p1Radar' : 'p2Radar']: nextRadar,
      [currentPlayer === 1 ? 'p2Planes' : 'p1Planes']: updatedPlanes,
    };

    if (updatedPlanes.every(p => p.isDead)) {
      setBattleState({ ...nextBattleState, winner: currentPlayer });
      setPhase(GamePhase.OVER);
      return;
    }

    if (mode === GameMode.VS_AI && currentPlayer === 1) {
      setBattleState(nextBattleState);
      setTimeout(() => aiTurn(nextBattleState), 800);
    } else {
      setBattleState({ ...nextBattleState, currentPlayer: currentPlayer === 1 ? 2 : 1 });
      setPhase(GamePhase.TRANSITION);
    }
  };

  const generateAIPlanes = (): Plane[] => {
    const planes: Plane[] = [];
    let attempts = 0;
    while (planes.length < PLANES_COUNT && attempts < 1000) {
      attempts++;
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      const dirs = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      const allExisting = planes.flatMap(p => [p.head, ...p.bodyParts]);
      if (isPlaneValid({ r, c }, d, allExisting)) {
        planes.push({
          id: `ai-${planes.length}`, head: { r, c }, direction: d, isDead: false,
          bodyParts: getPlaneBodyParts({ r, c }, d)
        });
      }
    }
    return planes;
  };

  const aiTurn = (currentState: BattleState) => {
    const { p2Radar, p1Planes } = currentState;
    const untried = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!p2Radar[`${r},${c}`]) untried.push({ r, c });
      }
    }
    if (untried.length === 0) return;
    const target = untried[Math.floor(Math.random() * untried.length)];
    const key = `${target.r},${target.c}`;
    let result: CellStatus = CellStatus.EMPTY;
    let updatedP1Planes = [...p1Planes];
    const hitPlane = updatedP1Planes.find(p => !p.isDead && p.head.r === target.r && p.head.c === target.c);
    if (hitPlane) { result = CellStatus.DEAD; hitPlane.isDead = true; }
    else {
      const injuredPlane = updatedP1Planes.find(p => !p.isDead && p.bodyParts.some(bp => bp.r === target.r && bp.c === target.c));
      if (injuredPlane) result = CellStatus.INJURED;
    }
    const nextRadar = { ...p2Radar, [key]: result };
    const allDead = updatedP1Planes.every(p => p.isDead);
    setBattleState(prev => ({
      ...prev, p2Radar: nextRadar, p1Planes: updatedP1Planes, currentPlayer: 1 as const,
      winner: allDead ? 2 : prev.winner
    }));
    if (allDead) setPhase(GamePhase.OVER);
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative overflow-hidden flex flex-col bg-slate-900">
      {phase === GamePhase.LOBBY && (
        <Lobby onStart={startGame} onOnline={(host, id) => initPeer(host, id)} />
      )}
      {phase === GamePhase.CONNECTING && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
           <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Awaiting Hangar</h2>
           <div 
             onClick={copyId}
             className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full mb-4 cursor-pointer active:bg-slate-750 transition-colors"
           >
              <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Room ID (Click to Copy)</p>
              <p className="text-blue-400 font-mono font-bold break-all">{peerId || 'GENERATING...'}</p>
              {copied && <p className="text-[10px] text-emerald-500 mt-2 font-bold animate-pulse">COPIED TO CLIPBOARD!</p>}
           </div>
           {peerId && <p className="text-xs text-slate-400 leading-relaxed italic">Share this code with your wingman to start the sortie.</p>}
           <button onClick={() => window.location.reload()} className="mt-12 text-slate-500 text-xs uppercase font-bold border-b border-slate-700">Abort Mission</button>
        </div>
      )}
      {(phase === GamePhase.PLACEMENT_P1 || phase === GamePhase.PLACEMENT_P2) && (
        <Placement 
          player={mode === GameMode.ONLINE_PVP ? myPlayerNum : (phase === GamePhase.PLACEMENT_P1 ? 1 : 2)} 
          onComplete={onPlanesPlaced} 
        />
      )}
      {phase === GamePhase.WAITING_FOR_OPPONENT && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
           <div className="relative mb-8">
              <i className="fa-solid fa-satellite-dish text-6xl text-blue-500 animate-pulse"></i>
           </div>
           <h2 className="text-2xl font-black text-white mb-2 tracking-tighter">FLEET READY</h2>
           <p className="text-slate-400 text-sm">Waiting for the enemy to finalize their aircraft positions...</p>
        </div>
      )}
      {phase === GamePhase.TRANSITION && (
        <Transition 
          nextPlayer={battleState.currentPlayer} 
          isBattle={battleState.p1Planes.length > 0 && battleState.p2Planes.length > 0}
          onContinue={() => setPhase(battleState.p2Planes.length === 0 ? GamePhase.PLACEMENT_P2 : GamePhase.BATTLE)} 
        />
      )}
      {phase === GamePhase.BATTLE && (
        <Battle 
          state={battleState} 
          onAttack={handleAttack} 
          myPlayerNum={mode === GameMode.ONLINE_PVP ? myPlayerNum : undefined}
          isAITurn={mode === GameMode.VS_AI && battleState.currentPlayer === 2}
        />
      )}
      {phase === GamePhase.OVER && (
        <GameOver winner={battleState.winner!} onRestart={() => window.location.reload()} />
      )}
    </div>
  );
};

export default App;
