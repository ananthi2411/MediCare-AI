import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { UploadCard } from './components/UploadCard';
import { ReportsTable } from './components/ReportsTable';
import { SummaryModal } from './components/SummaryModal';
import { CriticalAlertsView } from './components/CriticalAlertsView';
import { SettingsView } from './components/SettingsView';
import { fetchReportsApi, fetchCriticalAlertsApi } from './services/api';
import { MedicalReport, CriticalAlert, TabType } from './types';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedReports, fetchedAlerts] = await Promise.all([
        fetchReportsApi().catch(() => []),
        fetchCriticalAlertsApi().catch(() => []),
      ]);
      setReports(fetchedReports);
      setCriticalAlerts(fetchedAlerts);
    } catch (err) {
      console.error('Failed to load initial reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSuccess = (newReport: MedicalReport) => {
    setReports((prev) => [newReport, ...prev]);
    if (newReport.is_critical) {
      const newAlert: CriticalAlert = {
        report_id: String(newReport.id),
        patient_name: newReport.patient_name,
        alert_message: `Critical medical parameters identified in ${newReport.report_type}`,
        abnormal_params: Array.isArray(newReport.abnormal_values) ? newReport.abnormal_values : [],
        timestamp: new Date().toISOString(),
      };
      setCriticalAlerts((prev) => [newAlert, ...prev]);
    }
    // Automatically open summary modal for uploaded report
    setSelectedReport(newReport);
  };

  const criticalCount = reports.filter((r) => r.is_critical).length;
  const normalCount = reports.filter((r) => !r.is_critical).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          criticalCount={criticalAlerts.length || criticalCount}
        />

        {/* Central Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* FinSight AI Medical Metrics Cards */}
              <StatsCards
                totalReports={reports.length}
                criticalReports={criticalCount}
                normalReports={normalCount}
              />

              {/* Upload Form Card */}
              <UploadCard onUploadSuccess={handleUploadSuccess} />

              {/* Reports Data Table */}
              <ReportsTable
                reports={reports}
                onSelectReport={(report) => setSelectedReport(report)}
              />

            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  All Medical Reports Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive listing of extracted lab reports stored in PostgreSQL RDS
                </p>
              </div>
              <ReportsTable
                reports={reports}
                onSelectReport={(report) => setSelectedReport(report)}
              />
            </div>
          )}

          {/* CRITICAL ALERTS TAB */}
          {activeTab === 'alerts' && (
            <CriticalAlertsView
              alerts={criticalAlerts}
              onRefresh={loadData}
            />
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && <SettingsView />}

        </main>
      </div>

      {/* View Summary Modal Popup */}
      {selectedReport && (
        <SummaryModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 MediCare AI • Powered by AWS Textract, S3, RDS PostgreSQL, DynamoDB & OpenAI GPT-4o-mini</p>
        </div>
      </footer>

    </div>
  );
};

export default App;
