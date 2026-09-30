import React from 'react';
import { FileText, AlertOctagon, CheckCircle2, TrendingUp } from 'lucide-react';
import { HealthIndicator } from './HealthIndicator';

interface StatsCardsProps {
  totalReports: number;
  criticalReports: number;
  normalReports: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalReports,
  criticalReports,
  normalReports,
}) => {
  const healthIndex = totalReports > 0 ? Math.round((normalReports / totalReports) * 100) : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Reports */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Reports
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalReports}
          </h3>
          <div className="flex items-center space-x-1 text-xs text-sky-600 dark:text-sky-400 font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>RDS PostgreSQL Storage</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Critical Reports */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
            Critical Reports
          </p>
          <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {criticalReports}
          </h3>
          <div className="flex items-center space-x-1 text-xs text-rose-600 dark:text-rose-400 font-medium mt-2">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Synced to DynamoDB</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
          <AlertOctagon className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Normal Reports */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5">
        <div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Normal Reports
          </p>
          <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {normalReports}
          </h3>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Low Risk Profiles</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Circular Health Indicator (FinSight AI Style Widget) */}
      <HealthIndicator
        score={healthIndex}
        label="Overall Patient Health Status"
        subLabel="Health Index"
        size={90}
      />

    </div>
  );
};
