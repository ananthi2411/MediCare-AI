import React from 'react';

interface HealthIndicatorProps {
  score: number; // 0 to 100
  label: string;
  subLabel?: string;
  size?: number;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  score,
  label,
  subLabel = 'Health Index',
  size = 120,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-emerald-500';
  if (score < 60) colorClass = 'text-rose-500';
  else if (score < 80) colorClass = 'text-amber-500';

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-slate-100 dark:text-slate-700/60"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {score}%
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {subLabel}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </p>
    </div>
  );
};
