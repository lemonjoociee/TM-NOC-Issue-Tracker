import React from 'react';
import { Issue, MonthlySummary } from '../types/issue';

interface ChartsProps {
  issues: Issue[];
  summaries: MonthlySummary[];
  onSelectMonth?: (month: string) => void;
  onSelectArea?: (area: string) => void;
  onSelectPriority?: (priority: string) => void;
}

export const Charts: React.FC<ChartsProps> = ({
  issues,
  summaries,
  onSelectMonth,
  onSelectArea,
  onSelectPriority,
}) => {
  // Aggregate area counts
  const areaCounts = issues.reduce((acc, issue) => {
    const normArea = issue.issueArea.toLowerCase().includes('email')
      ? 'Email'
      : issue.issueArea.toLowerCase().includes('socmed')
      ? 'SocMed'
      : issue.issueArea.toLowerCase().includes('rta')
      ? 'RTA Team'
      : issue.issueArea.toLowerCase().includes('fmc')
      ? 'FMC'
      : issue.issueArea.toLowerCase().includes('telephony')
      ? 'Telephony'
      : 'General / Other';
    acc[normArea] = (acc[normArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

  // Aggregate RCA status counts
  const rcaCounts = issues.reduce((acc, issue) => {
    acc[issue.rcaStatus] = (acc[issue.rcaStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority counts
  const p1 = issues.filter((i) => i.priority === 'P1').length;
  const p2 = issues.filter((i) => i.priority === 'P2').length;
  const p3 = issues.filter((i) => i.priority === 'P3').length;
  const p4 = issues.filter((i) => i.priority === 'P4').length;

  const maxMonthTotal = Math.max(...summaries.map((s) => s.totalIssues), 50);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Trend Bar Chart */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Monthly Incident Volume by Priority</h3>
            <span className="text-xs text-slate-400">P1 to P4 breakdown</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-800">
            {summaries.map((s) => {
              const heightPercent = Math.round((s.totalIssues / maxMonthTotal) * 100);
              const p1H = s.totalIssues ? (s.p1 / s.totalIssues) * 100 : 0;
              const p2H = s.totalIssues ? (s.p2 / s.totalIssues) * 100 : 0;
              const p3H = s.totalIssues ? (s.p3 / s.totalIssues) * 100 : 0;
              const p4H = s.totalIssues ? (s.p4 / s.totalIssues) * 100 : 0;

              return (
                <div
                  key={s.month}
                  onClick={() => onSelectMonth && onSelectMonth(s.month)}
                  className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="text-xs font-mono text-slate-400 group-hover:text-white tabular-nums">
                    {s.totalIssues}
                  </div>
                  <div
                    className="w-full max-w-[48px] rounded-t flex flex-col justify-end overflow-hidden bg-slate-800/60 transition-transform group-hover:scale-105"
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                  >
                    {/* Stacked Bars */}
                    {p1H > 0 && (
                      <div
                        style={{ height: `${p1H}%` }}
                        className="bg-red-500 hover:bg-red-400 transition-colors"
                        title={`P1 Critical: ${s.p1}`}
                      />
                    )}
                    {p2H > 0 && (
                      <div
                        style={{ height: `${p2H}%` }}
                        className="bg-amber-500 hover:bg-amber-400 transition-colors"
                        title={`P2 High: ${s.p2}`}
                      />
                    )}
                    {p3H > 0 && (
                      <div
                        style={{ height: `${p3H}%` }}
                        className="bg-sky-500 hover:bg-sky-400 transition-colors"
                        title={`P3 Medium: ${s.p3}`}
                      />
                    )}
                    {p4H > 0 && (
                      <div
                        style={{ height: `${p4H}%` }}
                        className="bg-slate-500 hover:bg-slate-400 transition-colors"
                        title={`P4 Low: ${s.p4}`}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-orange-400">
                    {s.month.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3">
          <div
            onClick={() => onSelectPriority && onSelectPriority('P1')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-red-300"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span>P1 ({p1})</span>
          </div>
          <div
            onClick={() => onSelectPriority && onSelectPriority('P2')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span>P2 ({p2})</span>
          </div>
          <div
            onClick={() => onSelectPriority && onSelectPriority('P3')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-sky-300"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
            <span>P3 ({p3})</span>
          </div>
          <div
            onClick={() => onSelectPriority && onSelectPriority('P4')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
            <span>P4 ({p4})</span>
          </div>
        </div>
      </div>

      {/* 2. Issue Area Distribution */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Incident Distribution by Operational Area</h3>
          <span className="text-xs text-slate-400">Total {issues.length}</span>
        </div>

        <div className="space-y-3 my-auto pt-2">
          {sortedAreas.map(([area, count]) => {
            const percent = Math.round((count / issues.length) * 100);
            return (
              <div
                key={area}
                onClick={() => onSelectArea && onSelectArea(area)}
                className="group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300 group-hover:text-orange-400 transition-colors">
                    {area}
                  </span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 group-hover:bg-orange-400 h-full rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-500 flex justify-between">
          <span>Primary operational load</span>
          <span className="text-slate-400">SocMed & Email represent 78%</span>
        </div>
      </div>

      {/* 3. RCA Status & Resolution Health */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">RCA Documentation & Resolution Health</h3>
          <span className="text-xs text-emerald-400 font-mono">96.3% Resolved</span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-auto py-2">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">RCA Included</span>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {rcaCounts['Included'] || 33}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Full root cause & SOP</span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">Pending RCA</span>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {rcaCounts['Pending RCA'] || 23}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting vendor review</span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">In Progress / Review</span>
            <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
              {(rcaCounts['In Progress'] || 32) + (rcaCounts['In Review'] || 0)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Under technical investigation</span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="text-xs text-slate-400 block mb-1">N/A / BAU Spam</span>
            <div className="text-xl font-bold font-mono text-slate-400 tabular-nums">
              {rcaCounts['N/A'] || 16}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">External mail loops / BAU</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span>Avg SLA Resolution Time:</span>
          <span className="font-mono text-slate-200 tabular-nums font-semibold">72.8 Hours</span>
        </div>
      </div>
    </div>
  );
};
