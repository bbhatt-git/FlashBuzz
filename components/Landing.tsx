import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { ArrowRight, Monitor, Smartphone, Zap } from 'lucide-react';
import clsx from 'clsx';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [activeTab, setActiveTab] = useState<'join' | 'host'>('join');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) navigate(`/play/${roomId.trim()}`);
  };

  return (
    <Layout showHomeLink={false}>
      <div className="flex flex-col items-center justify-center flex-grow">
        
        <div className="text-center mb-16 relative">
           <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full opacity-30 pointer-events-none"></div>
           <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none select-none">
             FLASH<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">BUZZ</span>
           </h1>
           <p className="relative text-textMuted font-medium text-lg tracking-wide max-w-md mx-auto">
             Precision timing for competitive minds.
           </p>
        </div>

        <div className="w-full max-w-md mx-auto relative z-20 animate-slide-up">
          <div className="glass-card rounded-3xl p-1.5 shadow-2xl ring-1 ring-white/10">
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-2xl mb-6 border border-white/5">
               <button
                 onClick={() => setActiveTab('join')}
                 className={clsx(
                   "py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                   activeTab === 'join' 
                    ? "bg-surfaceHighlight text-white shadow-lg ring-1 ring-white/10" 
                    : "text-textMuted hover:text-white"
                 )}
               >
                 <Smartphone size={14} /> Player
               </button>
               <button
                 onClick={() => setActiveTab('host')}
                 className={clsx(
                   "py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                   activeTab === 'host' 
                    ? "bg-surfaceHighlight text-white shadow-lg ring-1 ring-white/10" 
                    : "text-textMuted hover:text-white"
                 )}
               >
                 <Monitor size={14} /> Host
               </button>
            </div>

            <div className="relative overflow-hidden px-4 pb-4" style={{ minHeight: '180px' }}>
              
              {/* Player Join */}
              <div className={clsx(
                "absolute inset-0 px-4 pb-4 flex flex-col justify-between transition-all duration-500 ease-out",
                activeTab === 'join' ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 pointer-events-none"
              )}>
                 <form onSubmit={handleJoin} className="flex flex-col gap-5 h-full">
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                       <span className="text-white/20 font-mono font-bold text-xl">#</span>
                     </div>
                     <input 
                          type="text" 
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          placeholder="CODE"
                          maxLength={4}
                          className="w-full h-16 bg-black/50 border border-white/10 focus:border-primary/50 focus:bg-black/80 focus:ring-1 focus:ring-primary/50 rounded-2xl pl-12 pr-6 font-mono text-3xl font-bold uppercase text-white tracking-[0.2em] focus:outline-none transition-all placeholder:text-white/10"
                      />
                   </div>
                   <button 
                      type="submit"
                      disabled={!roomId}
                      className="group h-14 bg-white text-black hover:bg-primary hover:text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
                   >
                      Enter Game <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                 </form>
              </div>

              {/* Host Control */}
              <div className={clsx(
                "absolute inset-0 px-4 pb-4 flex flex-col justify-between transition-all duration-500 ease-out",
                activeTab === 'host' ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
              )}>
                 <div className="flex-1 flex flex-col items-center justify-center text-center mb-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <Monitor size={20} className="text-textMuted" />
                    </div>
                    <p className="text-textMuted text-xs font-medium leading-relaxed">
                        Launch a control dashboard on this device to manage the game.
                    </p>
                 </div>
                 <button 
                    onClick={() => navigate('/host')}
                    className="h-14 bg-surfaceHighlight hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                 >
                    Launch Dashboard
                 </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};