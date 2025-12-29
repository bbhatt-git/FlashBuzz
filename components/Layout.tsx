import React from 'react';
import { Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  showHomeLink?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showHomeLink = true }) => {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith('/play');

  if (isPlayer) {
    return <div className="min-h-[100dvh] bg-background text-textMain font-sans overflow-hidden">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-textMain relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none z-0"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-5 px-5 py-2.5 rounded-full glass-card shadow-glass transition-all hover:border-white/20 duration-300">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/40 blur-md rounded-full group-hover:bg-primary/60 transition-colors"></div>
                <div className="relative bg-black text-white p-1.5 rounded-full border border-white/10">
                    <Zap size={14} fill="currentColor" />
                </div>
            </div>
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-primary transition-colors">
              FlashBuzz
            </span>
          </Link>
          
          {showHomeLink && (
            <>
              <div className="w-px h-3 bg-white/10"></div>
              <Link 
                to="/" 
                className="text-[10px] font-bold text-textMuted hover:text-white transition-colors uppercase tracking-widest"
              >
                Exit
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full max-w-6xl mx-auto px-6 relative z-10 pt-32 pb-12">
        {children}
      </main>

      <footer className="py-8 text-center relative z-10">
        <p className="text-[10px] text-textMuted/50 uppercase tracking-[0.3em] font-medium">
          System Status: Online
        </p>
      </footer>
    </div>
  );
};