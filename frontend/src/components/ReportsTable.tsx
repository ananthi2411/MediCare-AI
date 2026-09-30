import React from 'react';
import { Eye, AlertOctagon, CheckCircle2, FileText, Calendar, User, Search } from 'lucide-react';
import { MedicalReport } from '../types';

interface ReportsTableProps {
  reports: MedicalReport[];
  onSelectReport: (report: MedicalReport) => void;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ reports, onSelectReport }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('All');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.report_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'All' ||
      (filterType === 'Critical' && report.is_critical) ||
      (filterType === 'Normal' && !report.is_critical);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
      
      {/* Header & Controls */}
      <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>Uploaded Medical Reports</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Stored in PostgreSQL RDS • Critical Alerts in DynamoDB
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="Critical">Critical Only</option>
            <option value="Normal">Normal Only</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-4 px-6">Patient Name</th>
              <th className="py-4 px-6">Report Type</th>
              <th className="py-4 px-6">Date Uploaded</th>
              <th className="py-4 px-6">Health Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No medical reports found</p>
                  <p className="text-xs">Upload a lab report PDF or image above to view AI analysis.</p>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const formattedDate = new Date(report.uploaded_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* Patient Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                          <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {report.patient_name}
                          </p>
                          <p className="text-[11px] text-slate-400">ID: #{report.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Report Type */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800">
                        {report.report_type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Status Badge (Critical / Normal) */}
                    <td className="py-4 px-6">
                      {report.is_critical ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-300 dark:border-rose-800 animate-pulse">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Critical</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Normal</span>
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onSelectReport(report)}
                        className="px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/80 hover:bg-sky-600 hover:text-white text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800 transition-all duration-150 flex items-center space-x-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Summary</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
