import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Lock, Award, Zap, Trash2, RefreshCw, Smartphone, Copy, Check } from 'lucide-react';
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-slide-up">
        
        {/* Left Column: Controls & Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Room Card */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Room Code</h2>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-5xl font-black text-slate-900 tracking-tight">{roomId || '....'}</span>
                            <button onClick={copyLink} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                        {roomId && <QRCodeSVG value={`${window.location.origin}/#/play/${roomId}`} size={80} />}
                    </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                         <span className={clsx("w-2.5 h-2.5 rounded-full animate-pulse", roomId ? "bg-emerald-500" : "bg-red-500")}></span>
                         <span className="text-slate-500 text-xs font-bold uppercase">{statusMessage}</span>
                    </div>
                    <button onClick={createNewSession} disabled={isLoading} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> NEW SESSION
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
                <button 
                    onClick={resetBuzzer}
                    className="group relative h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-3xl font-black text-xl uppercase tracking-widest shadow-button hover:shadow-lg active:scale-[0.98] transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        <Zap size={28} className={gameState === GameState.OPEN ? "fill-white animate-pulse" : "fill-white/50"} />
                        RESET / GO
                    </div>
                </button>
                
                <button 
                    onClick={lockBuzzer}
                    className="h-16 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-3xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                    <Lock size={18} /> Lock Buzzers
                </button>
            </div>

            {/* Stats */}
            <div className="bg-indigo-50/50 rounded-3xl p-5 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                        <Users size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 leading-none">{players.length}</div>
                        <div className="text-indigo-400 text-[10px] uppercase tracking-widest font-bold mt-1">Players Connected</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Game Display */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Main Stage */}
            <div className={clsx(
                "flex-1 rounded-[2rem] relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] shadow-soft transition-all duration-500 border border-slate-100",
                winner ? "bg-amber-50" : gameState === GameState.OPEN ? "bg-emerald-50" : "bg-white"
            )}>
                <div className="relative z-10 text-center px-8 w-full max-w-2xl">
                    {winner ? (
                        <div className="animate-pop flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold uppercase tracking-widest mb-8 border border-amber-200">
                                <Award size={16} /> Fast Finger
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
                                {winner.name}
                            </h1>
                            <div className="font-mono text-slate-400 text-2xl font-bold tracking-widest bg-white px-6 py-2 rounded-xl shadow-sm inline-block border border-slate-100">
                                +0.{String(getValidDate(winner.time).getMilliseconds()).padStart(3, '0')}s
                            </div>
                        </div>
                    ) : gameState === GameState.OPEN ? (
                        <div className="animate-pulse-soft">
                             <div className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-button shadow-emerald-200">
                                <Zap size={64} className="text-white fill-white" />
                             </div>
                             <h2 className="text-6xl font-black text-slate-900 tracking-tighter">BUZZERS OPEN</h2>
                             <p className="text-slate-400 font-medium mt-4 text-lg">Waiting for the fastest finger...</p>
                        </div>
                    ) : (
                        <div className="opacity-40 grayscale">
                            <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                                <Lock size={40} className="text-slate-400" />
                            </div>
                            <h2 className="text-4xl font-bold text-slate-300 tracking-tight">LOCKED</h2>
                        </div>
                    )}
                </div>
            </div>

            {/* Players Grid */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lobby</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {players.map(p => (
                        <div key={p.id} className={clsx(
                            "group relative flex flex-col justify-between p-3 rounded-2xl border transition-all duration-200 min-h-[90px] hover:shadow-md",
                            winner?.name === p.name ? "bg-amber-50 border-amber-200 ring-2 ring-amber-400 ring-offset-2" : "bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white"
                        )}>
                            <div className="flex justify-between items-start w-full">
                                <span className="font-bold truncate text-sm text-slate-900 w-full pr-2">{p.name}</span>
                                <SignalIcon ms={p.rtt} size="sm" className={winner?.name === p.name ? "bg-amber-400" : "bg-slate-300"} />
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                                <span className="text-[10px] font-mono font-bold text-slate-400">{p.rtt || '-'}ms</span>
                                <button onClick={() => kickPlayer(p.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 hover:text-red-600 p-1.5 rounded-lg transition-all">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {players.length === 0 && (
                        <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                            <p className="text-slate-400 text-sm font-medium">Waiting for players to join...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};