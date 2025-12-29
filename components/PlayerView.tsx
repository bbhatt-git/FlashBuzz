import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameState } from '../types';
import * as fb from '../services/firebase';
import { playBuzzerSound, playClickSound, initAudio } from '../services/audio';
import { SignalIcon } from './SignalIcon';
import clsx from 'clsx';
import { AlertCircle, ArrowRight, RefreshCw, Lock, Trophy, Zap, Smartphone, Activity } from 'lucide-react';

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
      <div className="min-h-screen bg-background flex flex-col p-6 font-sans text-textMain relative overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
        
        <header className="py-6 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
                <div className="bg-white/10 p-1.5 rounded-lg text-white border border-white/10"><Zap size={16} fill="currentColor"/></div>
                <span className="font-bold text-white text-lg tracking-tight">FlashBuzz</span>
            </div>
            <div className="font-mono text-xs font-bold bg-white/5 border border-white/10 text-textMuted px-3 py-1.5 rounded-full">
                #{roomId}
            </div>
        </header>

        <main className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full animate-slide-up relative z-10">
            <div className="text-center mb-10">
                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-surfaceHighlight to-black border border-white/10 shadow-glass mb-6">
                    <Smartphone size={32} className="text-primary" />
                 </div>
                 <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Identify Yourself</h1>
                 <p className="text-textMuted text-sm">Enter a name to sync with the room.</p>
            </div>
            
            {error && (
                 <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold border border-red-500/20">
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
                    className="w-full bg-surfaceHighlight border-2 border-transparent focus:border-primary/50 text-white text-2xl font-bold py-6 px-4 rounded-2xl outline-none transition-all text-center placeholder:text-white/10 shadow-inner-glow"
                    maxLength={12}
                />
                <button 
                    onClick={joinGame}
                    disabled={!name.trim()}
                    className="w-full h-16 bg-white text-black hover:bg-primary hover:text-white rounded-2xl font-bold text-lg uppercase tracking-wide disabled:opacity-30 disabled:shadow-none shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    Connect <ArrowRight size={20} />
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
  
  // Immersive Background logic
  let bgClass = "bg-background";
  if (isWinner) bgClass = "bg-warning/20";
  else if (isOpen) bgClass = "bg-primary/10";
  
  return (
    <div className={clsx("fixed inset-0 w-full h-full transition-colors duration-700 flex flex-col font-sans overflow-hidden", bgClass)}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        {isOpen && <div className="absolute inset-0 bg-primary/20 animate-pulse-slow pointer-events-none"></div>}

        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
            <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                    <span className={clsx("w-2 h-2 rounded-full", isOpen ? "bg-emerald-500 animate-pulse" : "bg-textMuted")}></span>
                    <span className="font-bold text-[10px] uppercase text-textMuted tracking-widest">Player</span>
                </div>
                <div className="font-black text-xl tracking-tight text-white">{name}</div>
            </div>
            
            <button 
                onClick={manualRefreshPing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-md"
            >
                {isPinging ? <RefreshCw size={12} className="animate-spin text-textMuted" /> : <SignalIcon ms={ping} size="sm" className={isOpen ? "bg-white" : "bg-textMuted"} />}
                <span className="font-mono text-xs font-bold text-textMuted">{ping}ms</span>
            </button>
        </div>

        {/* The Action Area - Centered Buzzer */}
        <div className="flex-grow flex items-center justify-center p-8 relative z-10">
            
            {/* The Physical Button */}
            <button
                className={clsx(
                    "group relative w-72 h-72 rounded-[3rem] transition-all duration-150 outline-none select-none -webkit-tap-highlight-transparent flex flex-col items-center justify-center",
                    // States
                    isWinner ? "bg-warning shadow-[0_20px_60px_-10px_rgba(245,158,11,0.5)] translate-y-0" :
                    isLoser ? "bg-surfaceHighlight opacity-50 cursor-not-allowed" :
                    isOpen 
                        ? "bg-gradient-to-br from-white to-gray-300 shadow-[0_10px_0_rgb(100,100,100),0_20px_40px_rgba(255,255,255,0.3)] hover:translate-y-[2px] hover:shadow-[0_8px_0_rgb(100,100,100),0_15px_30px_rgba(255,255,255,0.3)] active:translate-y-[10px] active:shadow-none"
                        : "bg-surfaceHighlight border border-white/5 shadow-none opacity-80 cursor-not-allowed",
                    // Active press override
                    isOpen && isPressing && "translate-y-[10px] shadow-none"
                )}
                onPointerDown={handleInteraction}
                onPointerUp={handleRelease}
                onPointerLeave={handleRelease}
                disabled={!isOpen}
                style={{ touchAction: 'none' }}
            >
                {/* Visual content inside button */}
                <div className="relative z-10 flex flex-col items-center gap-3 pointer-events-none transform transition-transform group-active:scale-95">
                    {isWinner ? (
                        <>
                            <Trophy size={64} className="text-black drop-shadow-md animate-bounce-subtle" />
                            <span className="text-4xl font-black uppercase tracking-tighter text-black">WINNER</span>
                        </>
                    ) : isLoser ? (
                        <>
                            <Lock size={48} className="text-textMuted" />
                            <span className="text-lg font-bold uppercase tracking-widest text-textMuted">{winner?.name}</span>
                        </>
                    ) : isOpen ? (
                        <>
                            <div className="p-4 bg-black/5 rounded-full mb-1">
                                <Zap size={48} className="text-black fill-black" />
                            </div>
                            <span className="text-4xl font-black uppercase tracking-tighter text-black">PRESS</span>
                        </>
                    ) : (
                        <>
                            <Activity size={48} className="text-textMuted opacity-50" />
                            <span className="text-xl font-bold uppercase tracking-widest text-textMuted">LOCKED</span>
                        </>
                    )}
                </div>
            </button>
        </div>

        {/* Footer Status */}
        <div className="p-6 pb-10 text-center relative z-20">
             <div className={clsx(
                 "inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border backdrop-blur-md transition-colors",
                 isWinner ? "bg-warning/20 border-warning/50 text-warning" : 
                 isOpen ? "bg-primary/20 border-primary/50 text-primary animate-pulse" : 
                 "bg-surfaceHighlight/50 border-white/5 text-textMuted"
             )}>
                 {isWinner ? "Fastest Finger!" : isOpen ? "Ready to Buzz" : isLoser ? "Round Closed" : "Waiting for Host..."}
             </div>
        </div>
    </div>
  );
};