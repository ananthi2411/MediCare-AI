import React from 'react';
import { Settings, Server, Database, Cloud, Key, CheckCircle, Terminal } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Settings Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              System Settings & AWS Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              MediCare AI Deployment Architecture & Cloud Credentials
            </p>
          </div>
        </div>
      </div>

      {/* Environment Config Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* AWS S3 & Textract */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
            <Cloud className="w-5 h-5" />
            <span>AWS Storage & OCR</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">S3 Bucket Name:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">medicare-reports-2026</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">OCR Service:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">AWS Textract</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Auth Mode:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>EC2 IAM Role (No Hardcoded Keys)</span>
              </span>
            </div>
          </div>
        </div>

        {/* PostgreSQL RDS & DynamoDB */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <Database className="w-5 h-5" />
            <span>Databases (RDS & DynamoDB)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">Relational DB:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">PostgreSQL RDS (medicare_db)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">NoSQL Alerts Table:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">DynamoDB (CriticalAlerts)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Driver:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">psycopg2-binary + boto3</span>
            </div>
          </div>
        </div>

        {/* OpenAI AI Intelligence */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Key className="w-5 h-5" />
            <span>AI Simplifier Engine</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">AI Model:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">OpenAI gpt-4o-mini API</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">Output Languages:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">English + Tamil Tanglish</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Offline Fallback:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Enabled</span>
            </div>
          </div>
        </div>

        {/* EC2 Server Specs */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
            <Server className="w-5 h-5" />
            <span>EC2 Host Deployment Specs</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">Target Instance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">AWS EC2 Ubuntu t2.micro</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">Frontend Server:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">http://localhost:3000</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Backend API Host:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">http://localhost:8000</span>
            </div>
          </div>
        </div>

      </div>

      {/* EC2 Terminal Command Quick Reference */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-slate-200 font-mono text-xs space-y-3 shadow-xl">
        <div className="flex items-center space-x-2 text-sky-400 font-bold border-b border-slate-800 pb-3">
          <Terminal className="w-4 h-4" />
          <span>Quick EC2 Command Reference</span>
        </div>
        <p className="text-slate-400 text-[11px]"># Start Backend Service on Ubuntu</p>
        <p className="text-emerald-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          cd backend && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000
        </p>
        <p className="text-slate-400 text-[11px] mt-2"># Start Frontend Development Server on Ubuntu</p>
        <p className="text-sky-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          cd frontend && npm install && npm run dev --host 0.0.0.0
        </p>
      </div>

    </div>
  );
};
