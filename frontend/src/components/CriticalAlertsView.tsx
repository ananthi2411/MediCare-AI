import React from 'react';
import { AlertOctagon, ShieldAlert, User, Clock, Database, CheckCircle2 } from 'lucide-react';
import { CriticalAlert } from '../types';

interface CriticalAlertsViewProps {
  alerts: CriticalAlert[];
  onRefresh: () => void;
}

export const CriticalAlertsView: React.FC<CriticalAlertsViewProps> = ({ alerts, onRefresh }) => {
  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 text-white shadow-lg border border-rose-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">DynamoDB Critical Alerts Feed</h2>
            <p className="text-xs text-rose-200/80 font-medium">
              Real-time synchronization with AWS DynamoDB Table: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-rose-300 font-mono">CriticalAlerts</code>
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center space-x-2 self-start md:self-auto"
        >
          <Database className="w-4 h-4" />
          <span>Refresh DynamoDB Feed</span>
        </button>
      </div>

      {/* Alerts Grid / Cards */}
      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Clear! No Critical Alerts Flagged</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reports with critical findings will automatically stream into this DynamoDB partition.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-rose-200 dark:border-rose-900/60 shadow-md shadow-rose-500/5 transition-all hover:border-rose-400"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    {alert.patient_name}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black border border-rose-200 dark:border-rose-800">
                  Report #{alert.report_id}
                </span>
              </div>

              <div className="flex items-start space-x-2 text-rose-700 dark:text-rose-400 font-bold text-xs mb-3">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{alert.alert_message}</span>
              </div>

              {/* Abnormal parameters badges */}
              <div className="space-y-1.5 mb-4">
                <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Flagged Abnormal Parameters:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {alert.abnormal_params?.map((param, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900"
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>DynamoDB Alert Timestamp: {new Date(alert.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
