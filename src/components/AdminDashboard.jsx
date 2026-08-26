import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import {
  RefreshCw,
  Search,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAttendanceLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  // Update status (Approve or Reject)
  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      const { error } = await supabase
        .from('attendance_logs')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Local state optimistic update
      setLogs((prevLogs) =>
        prevLogs.map((log) => (log.id === id ? { ...log, status: newStatus } : log))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      const msg = err.message || 'Permission denied.';
      alert(
        `Could not update status to "${newStatus}".\n\nError: ${msg}\n\nNote: If you haven't enabled UPDATE policies in Supabase RLS, run this query in your Supabase SQL Editor:\n\nCREATE POLICY "Allow public update" ON attendance_logs FOR UPDATE USING (true);`
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatTimestamp = (timestampStr) => {
    if (!timestampStr) return 'N/A';
    try {
      const date = new Date(timestampStr);
      return new Intl.DateTimeFormat(navigator.language || 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
    } catch {
      return timestampStr;
    }
  };

  // Filter logs by search term & status filter
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.trainer_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const logStatus = log.status || 'pending';
    const matchesStatus =
      statusFilter === 'all' || logStatus.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reliable Excel (.xlsx) Download Logic
  const handleDownloadExcel = () => {
    if (filteredLogs.length === 0) {
      alert('No attendance data available to export.');
      return;
    }

    try {
      // Map data into clean object rows for Excel
      const excelRows = filteredLogs.map((log, index) => ({
        'S/N': index + 1,
        'Trainer Name': log.trainer_name || 'N/A',
        'Action Type': log.action_type === 'check-in' ? 'Check In' : 'Check Out',
        'Approval Status': (log.status || 'pending').toUpperCase(),
        'Timestamp': formatTimestamp(log.created_at),
        'Log ID': log.id || '',
      }));

      // Create sheet & workbook
      const worksheet = XLSX.utils.json_to_sheet(excelRows);

      // Auto-fit column widths
      worksheet['!cols'] = [
        { wch: 6 },  // S/N
        { wch: 26 }, // Trainer Name
        { wch: 15 }, // Action Type
        { wch: 18 }, // Approval Status
        { wch: 28 }, // Timestamp
        { wch: 38 }, // Log ID
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `Trainer_Attendance_Records_${dateStr}.xlsx`;

      // Export using binary buffer & Blob URL for guaranteed browser download compatibility
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();

      setTimeout(() => {
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(downloadUrl);
      }, 200);
    } catch (err) {
      console.error('Excel Download Error:', err);
      alert(`Unable to generate Excel file: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Admin Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Review, accept/reject attendance check-ins, and export Excel reports
            </p>
          </div>

          {/* Action Bar (Search, Status Filter, Single Excel Download Button, Refresh) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[160px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trainer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900 appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Single Download Excel (.xlsx) Button */}
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md active:scale-95 transition-all"
              title="Download records in Excel (.xlsx) format"
            >
              <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-200" />
              <span>Download Excel Record (.xlsx)</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchAttendanceLogs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 text-white text-sm font-medium rounded-xl hover:bg-blue-950 shadow-sm active:scale-95 transition-all disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-semibold">Unable to fetch logs</p>
            <p className="text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-900 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Fetching attendance logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              No matching records found
            </h3>
            <p className="text-sm text-slate-500">
              No attendance logs match your current search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-900" />
                      <span>Trainer Name</span>
                    </div>
                  </th>
                  <th className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-blue-900" />
                      <span>Action</span>
                    </div>
                  </th>
                  <th className="py-4 px-6">
                    <span>Approval Status</span>
                  </th>
                  <th className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-900" />
                      <span>Timestamp</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right">
                    <span>Admin Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log, index) => {
                  const isCheckIn = log.action_type === 'check-in';
                  const currentStatus = log.status || 'pending';
                  const isPending = currentStatus === 'pending';
                  const isApproved = currentStatus === 'approved';
                  const isRejected = currentStatus === 'rejected';
                  const isActioning = actionLoadingId === log.id;

                  return (
                    <tr
                      key={log.id || index}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {log.trainer_name}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isCheckIn
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCheckIn ? 'bg-blue-900' : 'bg-slate-500'
                            }`}
                          />
                          {isCheckIn ? 'Check In' : 'Check Out'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isRejected && <XCircle className="w-3.5 h-3.5" />}
                          {isPending && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                          <span className="capitalize">{currentStatus}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                        {formatTimestamp(log.created_at)}
                      </td>

                      {/* Admin Approve / Reject Buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isPending || (!isApproved && !isRejected) ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(log.id, 'approved')}
                                disabled={isActioning}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
                                title="Accept & Approve Check In"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(log.id, 'rejected')}
                                disabled={isActioning}
                                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
                                title="Reject Request"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  log.id,
                                  isApproved ? 'rejected' : 'approved'
                                )
                              }
                              disabled={isActioning}
                              className="text-xs font-medium text-slate-500 hover:text-blue-900 underline transition-colors"
                            >
                              Change to {isApproved ? 'Rejected' : 'Approved'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info count */}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>
              Showing {filteredLogs.length} of {logs.length} record(s)
            </span>
            <span>Excel (.xlsx) report export enabled</span>
          </div>
        )}
      </div>
    </div>
  );
}
