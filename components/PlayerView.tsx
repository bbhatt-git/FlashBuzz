import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameState } from '../types';
import * as fb from '../services/firebase';
import { playBuzzerSound, playClickSound, initAudio } from '../services/audio';
import { SignalIcon } from './SignalIcon';
import clsx from 'clsx';
import { AlertCircle, ArrowRight, RefreshCw, Lock, Trophy, Zap, Smartphone } from 'lucide-react';

export const PlayerView: React.FC = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [winner, setWinner] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [ping, setPing] = useState<number>(0);
  const hasBuzzedRef = useRef(false);
  const roomId = hostId?.toUpperCase();

  useEffect(() => { if (!roomId) navigate('/'); }, [roomId, navigate]);

  useEffect(() => {
    if (!roomId || !hasJoined) return;
    return fb.subscribeToRoom(roomId, (data) => {
        if (!data) { setError("Room closed"); setHasJoined(false); return; }
        setGameState(data.gameState);
        setWinner(data.winner);
        if (data.gameState === GameState.OPEN) hasBuzzedRef.current = false;
    });
  }, [roomId, hasJoined]);

  useEffect(() => { if (winner?.id === playerId) playBuzzerSound(); }, [winner?.id, playerId]);

  useEffect(() => {
    if (!hasJoined || !roomId || !playerId) return;
    performSilentPing();
    const interval = setInterval(() => {
        if (gameState !== GameState.OPEN) performSilentPing();
    }, 10000);
    return () => clearInterval(interval);
  }, [hasJoined, roomId, playerId, gameState]);

  const performSilentPing = async () => {
    if (!roomId || !playerId) return;
    try {
        const ms = await fb.measurePing(roomId);
        setPing(ms);
        fb.updatePlayerRtt(roomId, playerId, ms);
    } catch (e) {}
  };

  const manualRefreshPing = async () => {
      if (isPinging) return;
      setIsPinging(true);
      await performSilentPing();
      setTimeout(() => setIsPinging(false), 500);
  };

  const joinGame = async () => {
    if (!name.trim() || !roomId) return;
    initAudio();
    try {
        const start = performance.now();
        const pid = await fb.joinRoom(roomId, name.trim());
        const end = performance.now();
        setPlayerId(pid);
        setHasJoined(true);
        setPing(Math.round(end - start));
    } catch (e) { setError("Invalid Room"); }
  };

  const handleInteraction = async (e: React.PointerEvent) => {
    setIsPressing(true);
    if (gameState !== GameState.OPEN || !roomId || !playerId || hasBuzzedRef.current) return;
    
    hasBuzzedRef.current = true;
    playClickSound();
    if (navigator.vibrate) navigator.vibrate(50);
    await fb.handleBuzz(roomId, { id: playerId, name });
  };

  const handleRelease = () => setIsPressing(false);

  // --- JOIN SCREEN ---
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans">
        <header className="py-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Zap size={16} fill="currentColor"/></div>
                <span className="font-bold text-slate-800 text-lg tracking-tight">FlashBuzz</span>
            </div>
            <div className="font-mono text-xs font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full shadow-sm">
                #{roomId}
            </div>
        </header>

        <main className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full animate-slide-up">
            <div className="text-center mb-8">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-soft text-indigo-600 mb-6">
                    <Smartphone size={32} />
                 </div>
                 <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Identify Yourself</h1>
                 <p className="text-slate-500">Enter a name to join the room.</p>
            </div>
            
            {error && (
                 <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold border border-red-100">
                    <AlertCircle size={18} />
                    {error}
                 </div>
            )}

            <div className="space-y-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="YOUR NAME"
                    className="w-full bg-white border-2 border-transparent focus:border-indigo-500 text-slate-900 text-2xl font-bold py-6 px-4 rounded-2xl outline-none transition-all text-center placeholder:text-slate-300 shadow-sm"
                    maxLength={12}
                />
                <button 
                    onClick={joinGame}
                    disabled={!name.trim()}
                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg uppercase tracking-wide disabled:opacity-50 disabled:shadow-none hover:shadow-button active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                    Enter <ArrowRight size={20} />
                </button>
            </div>
        </main>
      </div>
    );
  }

  // --- GAME SCREEN ---
  const isOpen = gameState === GameState.OPEN;
  const isWinner = winner?.id === playerId;
  const isLoser = winner && !isWinner;
  
  // Dynamic Backgrounds
  let bgClass = "bg-slate-100";
  if (isWinner) bgClass = "bg-amber-400";
  else if (isOpen) bgClass = "bg-indigo-600";
  
  // Button Colors
  const btnBase = isWinner ? "bg-white text-amber-500" 
    : isLoser ? "bg-slate-200 text-slate-400" 
    : isOpen ? "bg-emerald-500 text-white shadow-[0_8px_0_rgb(6,95,70)] active:shadow-none active:translate-y-2" 
    : "bg-slate-800 text-slate-500 shadow-[0_8px_0_rgb(15,23,42)]";

  return (
    <div className={clsx("fixed inset-0 w-full h-full transition-colors duration-500 flex flex-col font-sans", bgClass)}>
        
        {/* Header Info */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
            <div className={clsx("flex flex-col items-start transition-colors", isOpen || isWinner ? "text-white/90" : "text-slate-900")}>
                <div className="font-bold text-[10px] uppercase opacity-70 tracking-widest">Player</div>
                <div className="font-black text-xl tracking-tight">{name}</div>
            </div>
            
            <button 
                onClick={manualRefreshPing}
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all",
                    isOpen || isWinner ? "bg-white/20 text-white" : "bg-slate-200/50 text-slate-600"
                )}
            >
                {isPinging ? <RefreshCw size={12} className="animate-spin" /> : <SignalIcon ms={ping} size="sm" className={isOpen || isWinner ? "bg-white" : "bg-slate-500"} />}
                <span className="font-mono text-xs font-bold">{ping}ms</span>
            </button>
        </div>

        {/* The Action Area */}
        <div className="flex-grow flex items-center justify-center p-8 relative">
             {/* Background Pulse for OPEN state */}
            {isOpen && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-80 h-80 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                </div>
            )}

            <button
                className={clsx(
                    "relative z-10 w-72 h-72 rounded-full flex flex-col items-center justify-center transition-all duration-100 outline-none select-none -webkit-tap-highlight-transparent",
                    btnBase,
                    isPressing && isOpen ? "translate-y-2 shadow-none scale-[0.98]" : ""
                )}
                onPointerDown={handleInteraction}
                onPointerUp={handleRelease}
                onPointerLeave={handleRelease}
                disabled={!isOpen}
                style={{ touchAction: 'none' }}
            >
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                    {isWinner ? (
                        <>
                            <Trophy size={64} className="animate-bounce" />
                            <span className="text-4xl font-black uppercase tracking-tighter">WIN!</span>
                        </>
                    ) : isLoser ? (
                        <>
                            <Lock size={48} />
                            <span className="text-lg font-bold uppercase tracking-widest">{winner?.name}</span>
                        </>
                    ) : isOpen ? (
                        <>
                            <span className="text-6xl font-black uppercase tracking-tighter italic">BUZZ</span>
                            <span className="text-sm font-bold uppercase tracking-widest opacity-80">Tap Fast!</span>
                        </>
                    ) : (
                        <>
                            <div className="w-3 h-3 bg-red-500 rounded-full mb-2 animate-pulse"></div>
                            <span className="text-xl font-black uppercase tracking-widest">WAIT</span>
                        </>
                    )}
                </div>
            </button>
        </div>

        {/* Footer Status */}
        <div className="p-6 pb-8 text-center relative z-20">
             <div className={clsx(
                 "inline-block px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest backdrop-blur-md",
                 isWinner ? "bg-white/30 text-white" : "bg-slate-200/50 text-slate-500"
             )}>
                 {isWinner ? "You are the fastest!" : isOpen ? "Ready to Buzz" : isLoser ? "Better luck next time" : "Waiting for Host..."}
             </div>
        </div>
    </div>
  );
};