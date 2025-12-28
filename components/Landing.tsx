import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { ArrowRight, Monitor, Play, Smartphone, Zap } from 'lucide-react';
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
        
        <div className="text-center mb-12 animate-slide-up">
           <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
             <Zap size={32} className="text-indigo-600 fill-indigo-600" />
           </div>
           <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-4">
             FlashBuzz
           </h1>
           <p className="text-lg md:text-xl text-slate-500 max-w-md mx-auto leading-relaxed">
             The ultra-low latency buzzer system for your next trivia night.
           </p>
        </div>

        <div className="w-full max-w-md mx-auto relative z-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-3xl shadow-soft p-2 border border-slate-100">
            <div className="grid grid-cols-2 p-1.5 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
               <button
                 onClick={() => setActiveTab('join')}
                 className={clsx(
                   "py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
                   activeTab === 'join' 
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 <Smartphone size={14} /> Player
               </button>
               <button
                 onClick={() => setActiveTab('host')}
                 className={clsx(
                   "py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
                   activeTab === 'host' 
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 <Monitor size={14} /> Host
               </button>
            </div>

            <div className="relative overflow-hidden px-4 pb-4" style={{ minHeight: '160px' }}>
              
              {/* Player Join */}
              <div className={clsx(
                "absolute inset-0 px-4 pb-4 flex flex-col justify-between transition-all duration-300",
                activeTab === 'join' ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"
              )}>
                 <form onSubmit={handleJoin} className="flex flex-col gap-4 h-full">
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <span className="text-slate-400 font-mono font-bold">#</span>
                     </div>
                     <input 
                          type="text" 
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value)}
                          placeholder="ROOM CODE"
                          maxLength={4}
                          className="w-full h-16 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl pl-10 pr-6 font-mono text-3xl font-bold uppercase text-slate-800 tracking-wider focus:outline-none transition-all placeholder:text-slate-300"
                      />
                   </div>
                   <button 
                      type="submit"
                      disabled={!roomId}
                      className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-3 shadow-button active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
                   >
                      Enter Game <ArrowRight size={18} />
                   </button>
                 </form>
              </div>

              {/* Host Control */}
              <div className={clsx(
                "absolute inset-0 px-4 pb-4 flex flex-col justify-between transition-all duration-300",
                activeTab === 'host' ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"
              )}>
                 <div className="flex-1 flex flex-col items-center justify-center text-center mb-4">
                    <p className="text-slate-500 text-sm font-medium">Create a new room on your big screen to let players join.</p>
                 </div>
                 <button 
                    onClick={() => navigate('/host')}
                    className="h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all"
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