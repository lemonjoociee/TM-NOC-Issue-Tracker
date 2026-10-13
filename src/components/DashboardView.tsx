import React from 'react';
import { Issue, MonthlySummary } from '../types/issue';
import { Charts } from './Charts';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
} from 'lucide-react';

interface DashboardViewProps {
  issues: Issue[];
  summaries: MonthlySummary[];
  onSelectIssue: (issue: Issue) => void;
  onNavigateToTracker: (filter?: { month?: string; status?: string; priority?: string }) => void;
  onNavigateToGuidelines: (searchQuery?: string) => void;
  onOpenNewIssue: () => void;
  onOpenSharePointSync: () => void;
  onRefreshSharePoint?: () => void;
  isLiveSyncing?: boolean;
  lastSyncTime: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  issues,
  summaries,
  onSelectIssue,
  onNavigateToTracker,
  onNavigateToGuidelines,
  onOpenNewIssue,
  onOpenSharePointSync,
  onRefreshSharePoint,
  isLiveSyncing = false,
  lastSyncTime,
}) => {
  // Present issues (not yet resolved)
  const presentIssues = issues.filter(
    (i) => i.status === 'Open' || i.status === 'In Progress' || i.status === 'In Review' || i.status === 'On Hold'
  );

  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;
  const p1Count = issues.filter((i) => i.priority === 'P1').length;
  const resolutionRate = ((resolvedCount / Math.max(issues.length, 1)) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* SharePoint Live Synchronization Ribbon */}
      <div className="bg-slate-900/90 rounded-xl border border-emerald-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-900/90">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full bg-emerald-400 ${isLiveSyncing ? 'animate-ping' : 'animate-pulse'} shrink-0`} />
          <div className="truncate">
            <span className="font-semibold text-white">SharePoint Real-Time Sync</span>
            <span className="text-slate-500 mx-2">·</span>
            <span className="text-slate-300 font-mono text-[11px] truncate">
              Auto-updating from Scicom SharePoint
            </span>
            <span className="text-slate-500 mx-2">·</span>
            <span className="text-emerald-400 font-mono text-[11px] tabular-nums font-semibold">
              {lastSyncTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRefreshSharePoint}
            disabled={isLiveSyncing}
            className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span>{isLiveSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <a
            href="https://scicommsc-my.sharepoint.com/:x:/g/personal/izzul_a_scicom_com_my/IQBHvM-VrkZZSop0Qba4jzRaAaUtutk3k7RM-8B1fJlhZhY?e=ln7nZo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
          >
            <span>Open in SharePoint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 1. Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Issues */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400 block mb-1">Total Issues</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">{issues.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">July – October 2026</span>
        </div>

        {/* Resolved */}
        <div
          onClick={() => onNavigateToTracker({ status: 'Resolved' })}
          className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400">Resolved (Past)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{resolvedCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Available as guidelines</span>
        </div>

        {/* Open (Present Issues) */}
        <div
          onClick={() => onNavigateToTracker({ status: 'Open' })}
          className="bg-slate-900/80 rounded-xl border border-amber-500/40 p-4 cursor-pointer hover:bg-slate-900 transition-colors bg-gradient-to-b from-amber-500/5 to-transparent"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-amber-300">Open (Present)</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {presentIssues.length}
          </div>
          <span className="text-[11px] text-amber-300/80 mt-1 block">Active NOC tracking</span>
        </div>

        {/* Resolution Rate */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400">Resolution Rate</span>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">{resolutionRate}%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Target: &ge; 95.0%</span>
        </div>

        {/* P1 Critical */}
        <div
          onClick={() => onNavigateToTracker({ priority: 'P1' })}
          className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 cursor-pointer hover:border-red-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400">P1 (Critical)</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">{p1Count}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Immediate triage</span>
        </div>

        {/* Avg Resolution (hrs) */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400">Avg Resolution</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-200 tabular-nums">72.8h</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Mean Time to Resolve</span>
        </div>
      </div>

      {/* 2. Present Issues Under Active Investigation (Live Watchlist) */}
      <div className="bg-slate-900/80 rounded-xl border border-amber-500/30 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Present Issues Under Active Investigation ({presentIssues.length})
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active incidents requiring ongoing NOC follow-up, vendor escalation, or verification before ticket closure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToTracker({ status: 'Open' })}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View present queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenNewIssue}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors cursor-pointer"
            >
              + Log Present Issue
            </button>
          </div>
        </div>

        {presentIssues.length === 0 ? (
          <div className="py-8 text-center bg-slate-950/40 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm text-slate-300 font-medium">All monitored incidents currently resolved.</p>
            <p className="text-xs text-slate-500 mt-1">No active present issues pending NOC action.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presentIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-semibold tabular-nums">
                        #{issue.id}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span
                        className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                          issue.priority === 'P1'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : issue.priority === 'P2'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {issue.priority}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300 font-medium">{issue.issueArea}</span>
                    </div>

                    <span className="font-mono text-[11px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {issue.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {issue.longDescription}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    <strong className="text-slate-300">Impact:</strong> {issue.impact}
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs">
                    <div className="text-[11px] text-slate-500 mb-1">Latest Finding / Action:</div>
                    <div className="text-slate-300 line-clamp-2">
                      {issue.actionTaken || issue.rootCause || 'Under technical evaluation by NOC PIC.'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>PIC: <strong className="text-slate-300">{issue.contactTeam}</strong></span>
                    <span>·</span>
                    <span>Age: <strong className="text-slate-300 font-mono tabular-nums">{issue.ageHours}</strong></span>
                  </div>
                  <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-1">
                    Inspect Dossier &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Analytics Charts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">
            NOC Operational Diagnostics & Volume Trends
          </h2>
          <span className="text-xs text-slate-400">Click any bar or category to filter tracker</span>
        </div>
        <Charts
          issues={issues}
          summaries={summaries}
          onSelectMonth={(month) => onNavigateToTracker({ month })}
          onSelectArea={(area) => onNavigateToTracker({ month: undefined })}
          onSelectPriority={(priority) => onNavigateToTracker({ priority })}
        />
      </div>

      {/* 4. Monthly Summary Matrix Table (Exact Match to CSV Specification) */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Monthly Summary Matrix</h2>
            <p className="text-xs text-slate-400 mt-1">
              Live summary of all monthly status reports (July to October 2026).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToGuidelines()}
              className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>Browse Knowledge Base</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-right">Resolved</th>
                <th className="py-3 px-3 text-right">Open</th>
                <th className="py-3 px-3 text-right">Res. Rate</th>
                <th className="py-3 px-3 text-right text-red-400">P1</th>
                <th className="py-3 px-3 text-right text-amber-400">P2</th>
                <th className="py-3 px-3 text-right text-sky-400">P3</th>
                <th className="py-3 px-3 text-right text-slate-400">P4</th>
                <th className="py-3 px-3 text-right text-emerald-400">RCA Incl.</th>
                <th className="py-3 px-3 text-right text-amber-400">Pend. RCA</th>
                <th className="py-3 px-3 text-right">With Time</th>
                <th className="py-3 px-4 text-right">Avg Res (hrs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {summaries.map((s) => (
                <tr
                  key={s.month}
                  onClick={() => onNavigateToTracker({ month: s.month })}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-sans font-semibold text-slate-200 group-hover:text-orange-400 flex items-center gap-2">
                    <span>{s.month}</span>
                    <span className="text-[10px] text-slate-500 font-normal">2026</span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-100 tabular-nums font-bold">
                    {s.totalIssues}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 tabular-nums">
                    {s.resolved}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400 tabular-nums font-semibold">
                    {s.open > 0 ? s.open : '-'}
                  </td>
                  <td className="py-3 px-3 text-right text-sky-300 tabular-nums">
                    {s.resolutionRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-red-400 tabular-nums">
                    {s.p1 > 0 ? s.p1 : '-'}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400 tabular-nums">
                    {s.p2 > 0 ? s.p2 : '-'}
                  </td>
                  <td className="py-3 px-3 text-right text-sky-400 tabular-nums">
                    {s.p3 > 0 ? s.p3 : '-'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                    {s.p4 > 0 ? s.p4 : '-'}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 tabular-nums">
                    {s.rcaIncluded > 0 ? s.rcaIncluded : '-'}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400 tabular-nums">
                    {s.pendingRca > 0 ? s.pendingRca : '-'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                    {s.issuesWithResTime}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-200 font-bold tabular-nums">
                    {s.avgResolutionHours.toFixed(1)}
                  </td>
                </tr>
              ))}

              {/* Grand Total Row */}
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                <td className="py-3.5 px-4 font-sans text-white">Total</td>
                <td className="py-3.5 px-3 text-right text-white tabular-nums">
                  {issues.length}
                </td>
                <td className="py-3.5 px-3 text-right text-emerald-400 tabular-nums">
                  {resolvedCount}
                </td>
                <td className="py-3.5 px-3 text-right text-amber-400 tabular-nums">
                  {presentIssues.length}
                </td>
                <td className="py-3.5 px-3 text-right text-sky-400 tabular-nums">
                  {resolutionRate}%
                </td>
                <td className="py-3.5 px-3 text-right text-red-400 tabular-nums">
                  {p1Count}
                </td>
                <td className="py-3.5 px-3 text-right text-amber-400 tabular-nums">
                  {issues.filter((i) => i.priority === 'P2').length}
                </td>
                <td className="py-3.5 px-3 text-right text-sky-400 tabular-nums">
                  {issues.filter((i) => i.priority === 'P3').length}
                </td>
                <td className="py-3.5 px-3 text-right text-slate-400 tabular-nums">
                  {issues.filter((i) => i.priority === 'P4').length}
                </td>
                <td className="py-3.5 px-3 text-right text-emerald-400 tabular-nums">
                  {issues.filter((i) => i.rcaStatus === 'Included').length}
                </td>
                <td className="py-3.5 px-3 text-right text-amber-400 tabular-nums">
                  {issues.filter((i) => i.rcaStatus === 'Pending RCA').length}
                </td>
                <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">99</td>
                <td className="py-3.5 px-4 text-right text-orange-400 tabular-nums">72.8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
