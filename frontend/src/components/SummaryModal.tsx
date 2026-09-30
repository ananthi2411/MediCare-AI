import React, { useState } from 'react';
import { X, FileText, ExternalLink, AlertOctagon, Utensils, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { MedicalReport } from '../types';

interface SummaryModalProps {
  report: MedicalReport | null;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'ocr' | 'tanglish'>('summary');

  if (!report) return null;

  // Ensure summaries are array format
  const enPoints = Array.isArray(report.ai_summary_en)
    ? report.ai_summary_en
    : typeof report.ai_summary_en === 'string'
    ? report.ai_summary_en.split('\n').filter(Boolean)
    : [];

  const taPoints = Array.isArray(report.ai_summary_ta)
    ? report.ai_summary_ta
    : typeof report.ai_summary_ta === 'string'
    ? report.ai_summary_ta.split('\n').filter(Boolean)
    : [];

  const abnormalVals = Array.isArray(report.abnormal_values)
    ? report.abnormal_values
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${report.is_critical ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'}`}>
              {report.is_critical ? <AlertOctagon className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {report.patient_name}'s Medical Analysis
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  {report.report_type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Uploaded: {new Date(report.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 bg-white dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'summary'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AI English Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('tanglish')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'tanglish'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Tamil Tanglish AI</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'ocr'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Extracted Text (AWS Textract)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* S3 Original Image / Document Link Banner */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 flex items-center justify-center font-bold">
                S3
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Original Document S3 Location
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                  {report.s3_image_url}
                </p>
              </div>
            </div>
            <a
              href={report.s3_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <span>View Original File</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Abnormal Values Box (Highlighted in BOLD RED) */}
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900 shadow-sm">
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-extrabold text-sm mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Abnormal Parameters & Critical Values Identified (Attention Required)</span>
            </div>

            {abnormalVals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {abnormalVals.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 flex items-center space-x-2 font-bold text-rose-600 dark:text-rose-400 text-xs shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-ping"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                No major abnormal parameters flagged in this report.
              </p>
            )}
          </div>

          {/* Tab 1: AI Summary (English) */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Simplified English Key Findings (3 Points)
              </h4>
              <ul className="space-y-3">
                {enPoints.map((point, i) => (
                  <li
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex items-start space-x-3 text-sm text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <span className="h-6 w-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{point.replace(/^[0-9\.\-\*]+\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 2: Tamil Tanglish Summary */}
          {activeTab === 'tanglish' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Globe className="w-4 h-4 text-sky-500" />
                <span>Simple Tamil Tanglish Summary (3 Points)</span>
              </h4>
              <ul className="space-y-3">
                {taPoints.map((point, i) => (
                  <li
                    key={i}
                    className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 flex items-start space-x-3 text-sm text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{point.replace(/^[0-9\.\-\*]+\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 3: Extracted Text (AWS Textract) */}
          {activeTab === 'ocr' && (
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Raw Extracted OCR Text (AWS Textract)
              </h4>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-700">
                {report.extracted_text || 'No raw text extracted.'}
              </pre>
            </div>
          )}

          {/* Food Advice Section */}
          {report.food_advice && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-2">
                <Utensils className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Recommended Food & Dietary Advice</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                {report.food_advice}
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
