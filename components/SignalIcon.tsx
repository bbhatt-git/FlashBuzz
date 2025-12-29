import React from 'react';
import clsx from 'clsx';

interface SignalIconProps {
  ms?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SignalIcon: React.FC<SignalIconProps> = ({ ms, className, size = 'sm' }) => {
  let activeBars = 0;
  // Default color for active bars in dark mode is usually a muted white or specific status color
  let colorClass = "bg-white/20"; 

  if (typeof ms === 'number' && ms > 0) {
    if (ms < 100) { activeBars = 4; colorClass = "bg-emerald-500"; }
    else if (ms < 200) { activeBars = 3; colorClass = "bg-emerald-400"; }
    else if (ms < 400) { activeBars = 2; colorClass = "bg-amber-500"; }
    else { activeBars = 1; colorClass = "bg-red-500"; }
  }

  const dimensions = {
    sm: { width: 'w-[2px]', gap: 'gap-[1.5px]', height: 'h-2.5' },
    md: { width: 'w-[3px]', gap: 'gap-[2px]', height: 'h-3.5' },
    lg: { width: 'w-[4px]', gap: 'gap-[3px]', height: 'h-5' },
  };

  const dim = dimensions[size];

  // Allow override if custom bg class is passed
  const hasCustomBg = className?.includes('bg-');
  const finalActiveColor = hasCustomBg ? className : colorClass;

  return (
    <div className={clsx("flex items-end", dim.gap, dim.height)} title={`Latency: ${ms || '?'}ms`}>
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={clsx(
            dim.width,
            "rounded-[1px] transition-all duration-300",
            bar <= activeBars ? finalActiveColor : "bg-white/5"
          )}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
};