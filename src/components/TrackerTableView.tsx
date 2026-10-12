import React, { useState, useMemo } from 'react';
import { Issue, MonthName, Priority, IssueStatus, RcaStatus } from '../types/issue';
import { Search, Filter, X, ArrowUpDown, ExternalLink, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface TrackerTableViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  initialFilter?: {
    month?: string;
    status?: string;
    priority?: string;
  };
  onExportCSV: () => void;
  onOpenSharePointSync?: () => void;
  onExportExcel?: () => void;
}

export const TrackerTableView: React.FC<TrackerTableViewProps> = ({
  issues,
  onSelectIssue,
  initialFilter,
  onExportCSV,
  onOpenSharePointSync,
  onExportExcel,
}) => {
  // Segment view: 'all' | 'present' | 'past'
  const [viewSegment, setViewSegment] = useState<'all' | 'present' | 'past'>(
    initialFilter?.status === 'Open' ? 'present' : initialFilter?.status === 'Resolved' ? 'past' : 'all'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(initialFilter?.month || 'all');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialFilter?.priority || 'all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRcaStatus, setSelectedRcaStatus] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<keyof Issue>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Segment filter
      const isPresent = issue.status !== 'Resolved';
      if (viewSegment === 'present' && !isPresent) return false;
      if (viewSegment === 'past' && isPresent) return false;

      // Month filter
      if (selectedMonth !== 'all' && issue.month.toLowerCase() !== selectedMonth.toLowerCase()) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && issue.priority !== selectedPriority) {
        return false;
      }

      // Area filter
      if (selectedArea !== 'all' && !issue.issueArea.toLowerCase().includes(selectedArea.toLowerCase())) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && issue.status !== selectedStatus) {
        return false;
      }

      // RCA Status filter
      if (selectedRcaStatus !== 'all' && issue.rcaStatus !== selectedRcaStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          String(issue.id).includes(q) ||
          issue.longDescription.toLowerCase().includes(q) ||
          issue.rootCause.toLowerCase().includes(q) ||
          issue.actionTaken.toLowerCase().includes(q) ||
          issue.reportedBy.toLowerCase().includes(q) ||
          issue.contactTeam.toLowerCase().includes(q) ||
          issue.issueArea.toLowerCase().includes(q) ||
          issue.resolution.toLowerCase().includes(q) ||
          issue.impact.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    issues,
    viewSegment,
    selectedMonth,
    selectedPriority,
    selectedArea,
    selectedStatus,
    selectedRcaStatus,
    searchQuery,
  ]);

  // Sorted issues
  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'id') {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredIssues, sortField, sortDirection]);

  // Paginated issues
  const totalPages = Math.ceil(sortedIssues.length / pageSize) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedIssues.slice(start, start + pageSize);
  }, [sortedIssues, currentPage, pageSize]);

  const handleSort = (field: keyof Issue) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedMonth('all');
    setSelectedPriority('all');
    setSelectedArea('all');
    setSelectedStatus('all');
    setSelectedRcaStatus('all');
    setViewSegment('all');
    setCurrentPage(1);
  };

  const presentCount = issues.filter((i) => i.status !== 'Resolved').length;
  const pastCount = issues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Controls: Segmented View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Incident Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and query present active cases alongside past historical incidents for operational guidance.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              setViewSegment('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              viewSegment === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            onClick={() => {
              setViewSegment('present');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              viewSegment === 'present'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Present Issues ({presentCount})</span>
          </button>
          <button
            onClick={() => {
              setViewSegment('past');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              viewSegment === 'past'
                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Past / Resolved ({pastCount})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword, description, RCA, PIC, reporter..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Month Selector */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Months</option>
              <option value="July">July 2026 (18)</option>
              <option value="August">August 2026 (29)</option>
              <option value="September">September 2026 (48)</option>
              <option value="October">October 2026 (12)</option>
            </select>
          </div>

          {/* Priority Selector */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Medium</option>
              <option value="P4">P4 Low</option>
            </select>
          </div>

          {/* Issue Area Selector */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Issue Areas</option>
              <option value="Email">Email Team</option>
              <option value="SocMed">SocMed Team</option>
              <option value="RTA">RTA Team</option>
              <option value="FMC">FMC Live Chat</option>
              <option value="Telephony">Telephony / Voice</option>
              <option value="Campaign">Campaign</option>
            </select>
          </div>

          {/* RCA Status Selector */}
          <div>
            <select
              value={selectedRcaStatus}
              onChange={(e) => {
                setSelectedRcaStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All RCA Statuses</option>
              <option value="Included">RCA Included</option>
              <option value="Pending RCA">Pending RCA</option>
              <option value="In Progress">In Progress</option>
              <option value="N/A">N/A (BAU / Spam)</option>
            </select>
          </div>
        </div>

        {/* Filter status bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-200 tabular-nums font-mono">{filteredIssues.length}</strong> of{' '}
              <strong className="text-slate-200 tabular-nums font-mono">{issues.length}</strong> incidents
            </span>
            {(searchQuery ||
              selectedMonth !== 'all' ||
              selectedPriority !== 'all' ||
              selectedArea !== 'all' ||
              selectedRcaStatus !== 'all' ||
              viewSegment !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium cursor-pointer ml-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenSharePointSync && (
              <button
                onClick={onOpenSharePointSync}
                className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SharePoint Sync</span>
              </button>
            )}

            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download multi-sheet Issue Tracker for TM NOC.xlsx"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Export Excel (.xlsx)</span>
              </button>
            )}

            <button
              onClick={onExportCSV}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 select-none">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 w-16 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-3 w-20 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('issueArea')}
                  className="py-3 px-3 w-28 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Area</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reportedDate')}
                  className="py-3 px-3 w-32 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Reported</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[280px]">
                  <span>Description / Enquiry</span>
                </th>
                <th className="py-3 px-3 w-32">
                  <span>Reported By / PIC</span>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 w-28 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rcaStatus')}
                  className="py-3 px-3 w-28 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>RCA Status</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3 w-24 text-right">
                  <span>Duration</span>
                </th>
                <th className="py-3 px-3 w-20 text-center">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No incidents matched your search filters.</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-2 text-xs text-orange-400 hover:text-orange-300 underline cursor-pointer"
                    >
                      Clear active filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedIssues.map((issue) => {
                  const isPresent = issue.status !== 'Resolved';
                  return (
                    <tr
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer group ${
                        isPresent ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-300 group-hover:text-orange-400 tabular-nums">
                        #{issue.id}
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border ${
                            issue.priority === 'P1'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : issue.priority === 'P2'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : issue.priority === 'P3'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-slate-700/50 text-slate-400 border-slate-700'
                          }`}
                        >
                          {issue.priority}
                        </span>
                      </td>

                      {/* Area */}
                      <td className="py-2.5 px-3 font-medium text-slate-200 truncate max-w-[120px]">
                        {issue.issueArea}
                      </td>

                      {/* Reported */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        <div>{issue.reportedDate}</div>
                        <div className="text-[10px] text-slate-500">{issue.reportedTime}</div>
                      </td>

                      {/* Description / Enquiry */}
                      <td className="py-2.5 px-4 max-w-md">
                        <div className="text-slate-200 font-medium line-clamp-1 group-hover:text-white">
                          {issue.longDescription}
                        </div>
                        {issue.rootCause && (
                          <div className="text-slate-400 text-[11px] line-clamp-1 mt-0.5 font-normal">
                            RCA: {issue.rootCause}
                          </div>
                        )}
                      </td>

                      {/* Reported By / Contact */}
                      <td className="py-2.5 px-3 text-slate-300 max-w-[140px] truncate">
                        <div className="truncate text-slate-300 font-medium">{issue.reportedBy}</div>
                        <div className="text-[10px] text-slate-500">PIC: {issue.contactTeam}</div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] font-medium ${
                            issue.status === 'Resolved'
                              ? 'text-emerald-400'
                              : issue.status === 'In Progress'
                              ? 'text-amber-400 font-semibold'
                              : issue.status === 'In Review'
                              ? 'text-sky-400'
                              : 'text-amber-300'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>

                      {/* RCA Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] ${
                            issue.rcaStatus === 'Included'
                              ? 'text-emerald-400'
                              : issue.rcaStatus === 'Pending RCA'
                              ? 'text-amber-400'
                              : issue.rcaStatus === 'In Progress'
                              ? 'text-sky-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {issue.rcaStatus}
                        </span>
                      </td>

                      {/* Duration / Age */}
                      <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                        {issue.ageHours}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          className="p-1 hover:bg-slate-700/60 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="View Full Incident Dossier & Guidelines"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <div>
            Showing{' '}
            <span className="font-mono text-slate-200 tabular-nums">
              {sortedIssues.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, sortedIssues.length)}
            </span>{' '}
            of <span className="font-mono text-slate-200 tabular-nums">{sortedIssues.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-300 px-2 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
