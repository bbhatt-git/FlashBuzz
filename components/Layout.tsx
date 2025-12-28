import React from 'react';
import { Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

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
    <div className="min-h-screen flex flex-col font-sans bg-background text-textMain relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white pointer-events-none -z-10"></div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-4 px-5 py-2.5 rounded-full glass-panel shadow-sm transition-all hover:shadow-md duration-300">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
               <Zap size={16} fill="currentColor" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-800">
              FlashBuzz
            </span>
          </Link>
          
          {showHomeLink && (
            <>
              <div className="w-px h-4 bg-slate-200"></div>
              <Link 
                to="/" 
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wide"
              >
                Exit
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-12">
        {children}
      </main>

      <footer className="py-6 text-center relative z-10">
        <p className="text-xs text-slate-400 font-medium">
          High Performance Buzzer System
        </p>
      </footer>
    </div>
  );
};