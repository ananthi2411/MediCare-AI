import React, { useState, useRef } from 'react';
import { Upload, FileUp, User, Tag, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadReportApi } from '../services/api';
import { MedicalReport } from '../types';

interface UploadCardProps {
  onUploadSuccess: (report: MedicalReport) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onUploadSuccess }) => {
  const [patientName, setPatientName] = useState('');
  const [reportType, setReportType] = useState('Blood Test');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
        setErrorMsg('Please upload a PDF or Image file (.pdf, .jpg, .png)');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Patient Name is required');
      return;
    }
    if (!selectedFile) {
      setErrorMsg('Please select or drop a medical report PDF or Image file');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const response = await uploadReportApi(selectedFile, patientName, reportType);
      if (response.success && response.data) {
        onUploadSuccess(response.data);
        // Reset form
        setSelectedFile(null);
        setPatientName('');
        setReportType('Blood Test');
      } else {
        setErrorMsg('Upload failed. Please check backend logs.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail || 'Failed to upload report. Ensure backend is running at http://localhost:8000');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 transition-colors">
      
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Upload Medical Lab Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            AWS Textract OCR + OpenAI GPT-4o-mini Medical Simplification & Tamil Tanglish AI
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center space-x-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Patient Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Patient Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium transition-colors"
                required
              />
            </div>
          </div>

          {/* Report Type Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Report Type
            </label>
            <div className="relative">
              <Tag className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium transition-colors appearance-none"
              >
                <option value="Blood Test">Blood Test</option>
                <option value="Urine Test">Urine Test</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            dragOver
              ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 scale-[1.01]'
              : selectedFile
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
                <FileUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  <span className="text-sky-600 dark:text-sky-400 hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Supported Formats: PDF, PNG, JPG, JPEG (Max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-base shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing with Textract & OpenAI GPT-4o-mini...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Analyze & Simplify Medical Report</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
