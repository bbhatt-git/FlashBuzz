import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Lock, Award, Zap, Trash2, RefreshCw, Smartphone, Copy, Check, Clock } from 'lucide-react';
import { GameState, Player } from '../types';
import { Layout } from './Layout';
import * as fb from '../services/firebase';
import { playBuzzerSound, initAudio } from '../services/audio';
import { SignalIcon } from './SignalIcon';
import clsx from 'clsx';

const getValidDate = (time: any): Date => {
    if (!time) return new Date();
    if (typeof time === 'number') return new Date(time);
    if (typeof time.toDate === 'function') return time.toDate();
    return new Date();
};

export const HostView: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [winner, setWinner] = useState<{ name: string; time: any } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initRoom = async () => {
      const cachedRoomId = localStorage.getItem('flashbuzz_host_room_id');
      if (cachedRoomId && await fb.checkRoomExists(cachedRoomId)) {
          setRoomId(cachedRoomId);
          setStatusMessage('Active');
          return;
      }
      await createNewSession();
    };
    initRoom();
  }, []);

  const createNewSession = async () => {
    setIsLoading(true);
    try {
      const id = await fb.createRoom();
      setRoomId(id);
      localStorage.setItem('flashbuzz_host_room_id', id);
      setStatusMessage('Active');
    } catch (e) { setStatusMessage('Error'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = fb.subscribeToRoom(roomId, (data) => {
        if (!data) { setStatusMessage('Closed'); return; }
        setGameState(data.gameState);
        setWinner(data.winner || null);
    });
    const unsubPlayers = fb.subscribeToPlayers(roomId, (data) => setPlayers(data as Player[]));
    return () => { unsubRoom(); unsubPlayers(); };
  }, [roomId]);

  useEffect(() => { if (winner) playBuzzerSound(); }, [winner?.time]);

  const resetBuzzer = () => { initAudio(); if (roomId) fb.updateGameState(roomId, GameState.OPEN); };
  const lockBuzzer = () => { initAudio(); if (roomId) fb.updateGameState(roomId, GameState.IDLE); };
  const kickPlayer = (pid: string) => roomId && fb.removePlayer(roomId, pid);
  
  const copyLink = () => {
      navigator.clipboard.writeText(`${window.location.origin}/#/play/${roomId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-fade-in">
        
        {/* Left Column: Controls & Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Room Card */}
            <div className="glass-card rounded-3xl p-6 shadow-glow shadow-primary/5">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-2">Session ID</h2>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-5xl font-black text-white tracking-tight drop-shadow-lg">{roomId || '....'}</span>
                            <button onClick={copyLink} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-textMuted">
                                {copied ? <Check size={20} className="text-success" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-lg">
                        {roomId && <QRCodeSVG value={`${window.location.origin}/#/play/${roomId}`} size={80} />}
                    </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                         <span className={clsx("w-2 h-2 rounded-full animate-pulse", roomId ? "bg-success shadow-[0_0_10px_#10b981]" : "bg-danger")}></span>
                         <span className="text-textMuted text-[10px] font-bold uppercase tracking-widest">{statusMessage}</span>
                    </div>
                    <button onClick={createNewSession} disabled={isLoading} className="text-[10px] font-bold text-primary hover:text-white flex items-center gap-1 uppercase tracking-wider transition-colors">
                        <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} /> New Session
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
                <button 
                    onClick={resetBuzzer}
                    className="group relative h-24 bg-gradient-to-br from-primary to-primaryDark text-white rounded-3xl font-black text-xl uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden border border-white/10"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative flex items-center justify-center gap-3 z-10">
                        <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                            <Zap size={24} className={gameState === GameState.OPEN ? "fill-white animate-pulse" : "fill-white"} />
                        </div>
                        RESET / GO
                    </div>
                </button>
                
                <button 
                    onClick={lockBuzzer}
                    className="h-16 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMuted hover:text-white border border-white/5 rounded-3xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Lock size={16} /> Lock Buzzers
                </button>
            </div>

            {/* Stats */}
            <div className="bg-black/30 rounded-3xl p-5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-surfaceHighlight rounded-2xl text-textMuted">
                        <Users size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white leading-none">{players.length}</div>
                        <div className="text-textMuted text-[10px] uppercase tracking-widest font-bold mt-1">Players Ready</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Game Display */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Main Stage */}
            <div className={clsx(
                "flex-1 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] transition-all duration-500 border border-white/5",
                winner ? "bg-warning shadow-[0_0_100px_-20px_rgba(245,158,11,0.3)]" : gameState === GameState.OPEN ? "bg-success shadow-[0_0_100px_-20px_rgba(16,185,129,0.3)]" : "bg-surfaceHighlight"
            )}>
                {/* Background Grid inside Stage */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

                <div className="relative z-10 text-center px-8 w-full max-w-2xl">
                    {winner ? (
                        <div className="animate-fade-in flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/20 text-black text-sm font-black uppercase tracking-widest mb-8 backdrop-blur-sm border border-black/10">
                                <Award size={16} /> Winner
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-black tracking-tighter mb-4 leading-none drop-shadow-sm">
                                {winner.name}
                            </h1>
                            <div className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl shadow-2xl">
                                <Clock size={24} className="text-warning" />
                                <span className="font-mono text-3xl font-bold tracking-widest">
                                    +0.{String(getValidDate(winner.time).getMilliseconds()).padStart(3, '0')}s
                                </span>
                            </div>
                        </div>
                    ) : gameState === GameState.OPEN ? (
                        <div className="animate-bounce-subtle">
                             <div className="w-32 h-32 rounded-full bg-black/20 flex items-center justify-center mx-auto mb-8 border border-black/5">
                                <Zap size={64} className="text-black fill-black" />
                             </div>
                             <h2 className="text-7xl font-black text-black tracking-tighter mix-blend-overlay">BUZZ NOW</h2>
                        </div>
                    ) : (
                        <div className="opacity-20 flex flex-col items-center">
                            <Lock size={64} className="text-textMuted mb-6" />
                            <h2 className="text-4xl font-black text-textMuted tracking-tight uppercase">Locked</h2>
                        </div>
                    )}
                </div>
            </div>

            {/* Players Grid */}
            <div className="glass-card rounded-3xl p-6">
                <h3 className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span> Live Lobby
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {players.map(p => (
                        <div key={p.id} className={clsx(
                            "group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 min-h-[100px]",
                            winner?.name === p.name 
                                ? "bg-warning/10 border-warning text-warning" 
                                : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                        )}>
                            <div className="flex justify-between items-start w-full">
                                <span className={clsx("font-bold truncate text-sm w-full pr-2", winner?.name === p.name ? "text-warning" : "text-white")}>{p.name}</span>
                                <SignalIcon ms={p.rtt} size="sm" className={winner?.name === p.name ? "bg-warning" : "bg-white/20"} />
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                                <span className="text-[10px] font-mono font-bold opacity-50">{p.rtt || '-'}ms</span>
                                <button onClick={() => kickPlayer(p.id)} className="opacity-0 group-hover:opacity-100 text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-all">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {players.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                            <p className="text-textMuted text-xs font-mono">Waiting for connections...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};