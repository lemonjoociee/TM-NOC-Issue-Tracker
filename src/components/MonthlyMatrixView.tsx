import React from 'react';
import { Issue, MonthlySummary } from '../types/issue';
import { Calendar, TrendingUp, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface MonthlyMatrixViewProps {
  summaries: MonthlySummary[];
  issues: Issue[];
  onSelectMonth: (month: string) => void;
}

export const MonthlyMatrixView: React.FC<MonthlyMatrixViewProps> = ({
  summaries,
  issues,
  onSelectMonth,
}) => {
  const monthInsights: Record<
    string,
    { title: string; highlight: string; rcaObservation: string; statusBadge: string }
  > = {
    July: {
      title: 'Initial Cutover & Core Stabilization',
      highlight:
        '18 issues with 100% resolution rate. Characterized by 15 P1 issues originating from Nubitel code deploys lacking corresponding database schema updates, and email/SocMed queue synchronization.',
      rcaObservation:
        '9 issues included full root cause analysis. Key fixes involved database schema alignment, UUID persistence, and report memory limits.',
      statusBadge: '100% Resolved',
    },
    August: {
      title: 'Operational Normalization & SLA Gains',
      highlight:
        '29 issues with 100% resolution rate. Average resolution time improved dramatically to 34.2 hours. Higher proportion of lower severity inquiries (11 P3s, 3 P4s).',
      rcaObservation:
        '6 RCAs finalized, 17 marked Pending RCA. Key issues resolved included WhatsApp token expiration, Exchange attachment limit updates, and Redis session TTL rollover.',
      statusBadge: '100% Resolved',
    },
    September: {
      title: 'Peak Workload & Concurrency Bottlenecks',
      highlight:
        '48 issues (highest monthly volume). 46 resolved, 2 open present issues. Average resolution climbed to 104.2 hours due to deep architectural database indexing and OAuth secret rotations.',
      rcaObservation:
        '13 RCAs included. Discovered query partition limits on 14M row logging table and Graph API webhook SSL expiry.',
      statusBadge: '95.8% Resolved (2 Active)',
    },
    October: {
      title: 'Current Active Operational Period',
      highlight:
        '12 issues recorded to date. 10 resolved, 2 active present issues (#106 FMC Webhook latency and #107 RTA Report timeout). Mean resolution tracking at 34.2 hours.',
      rcaObservation:
        '5 RCAs completed. Active focus is on RabbitMQ worker thread allocation for FMC live chat and report memory ceilings.',
      statusBadge: 'Active Operations (2 Active)',
    },
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-white tracking-tight">Monthly Performance Matrix</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detailed breakdown of incident volume, severity distribution, RCA coverage, and resolution MTTR across reporting months.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Total Historical Incidents: <strong className="text-slate-100">{issues.length}</strong>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Reporting Month</th>
                <th className="py-3 px-3 text-right">Total Issues</th>
                <th className="py-3 px-3 text-right text-emerald-400">Resolved</th>
                <th className="py-3 px-3 text-right text-amber-400">Open</th>
                <th className="py-3 px-3 text-right">Resolution Rate</th>
                <th className="py-3 px-3 text-right text-red-400">P1</th>
                <th className="py-3 px-3 text-right text-amber-400">P2</th>
                <th className="py-3 px-3 text-right text-sky-400">P3</th>
                <th className="py-3 px-3 text-right text-slate-400">P4</th>
                <th className="py-3 px-3 text-right text-emerald-400">RCA Included</th>
                <th className="py-3 px-3 text-right text-amber-400">Pending RCA</th>
                <th className="py-3 px-3 text-right">Tracked SLA</th>
                <th className="py-3 px-4 text-right">Avg Res (hrs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {summaries.map((s) => (
                <tr
                  key={s.month}
                  onClick={() => onSelectMonth(s.month)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-200 group-hover:text-orange-400">
                    <div className="flex items-center gap-2">
                      <span>{s.month} 2026</span>
                      <span className="text-[10px] text-slate-500 font-mono font-normal">
                        ({monthInsights[s.month]?.statusBadge})
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-100 font-bold tabular-nums">
                    {s.totalIssues}
                  </td>
                  <td className="py-3.5 px-3 text-right text-emerald-400 tabular-nums">
                    {s.resolved}
                  </td>
                  <td className="py-3.5 px-3 text-right text-amber-400 tabular-nums font-semibold">
                    {s.open > 0 ? s.open : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right text-sky-300 tabular-nums">
                    {s.resolutionRate.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-3 text-right text-red-400 tabular-nums font-semibold">
                    {s.p1 > 0 ? s.p1 : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right text-amber-400 tabular-nums">
                    {s.p2 > 0 ? s.p2 : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right text-sky-400 tabular-nums">
                    {s.p3 > 0 ? s.p3 : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-400 tabular-nums">
                    {s.p4 > 0 ? s.p4 : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right text-emerald-400 tabular-nums">
                    {s.rcaIncluded > 0 ? s.rcaIncluded : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right text-amber-400 tabular-nums">
                    {s.pendingRca > 0 ? s.pendingRca : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-300 tabular-nums">
                    {s.issuesWithResTime}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-200 font-bold tabular-nums">
                    {s.avgResolutionHours.toFixed(1)}h
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                <td className="py-4 px-4 font-sans text-white">Full Cumulative Total</td>
                <td className="py-4 px-3 text-right text-white tabular-nums">107</td>
                <td className="py-4 px-3 text-right text-emerald-400 tabular-nums">103</td>
                <td className="py-4 px-3 text-right text-amber-400 tabular-nums">4</td>
                <td className="py-4 px-3 text-right text-sky-400 tabular-nums">96.3%</td>
                <td className="py-4 px-3 text-right text-red-400 tabular-nums">39</td>
                <td className="py-4 px-3 text-right text-amber-400 tabular-nums">28</td>
                <td className="py-4 px-3 text-right text-sky-400 tabular-nums">32</td>
                <td className="py-4 px-3 text-right text-slate-400 tabular-nums">8</td>
                <td className="py-4 px-3 text-right text-emerald-400 tabular-nums">33</td>
                <td className="py-4 px-3 text-right text-amber-400 tabular-nums">23</td>
                <td className="py-4 px-4 text-right text-slate-300 tabular-nums">99</td>
                <td className="py-4 px-4 text-right text-orange-400 tabular-nums">72.8h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Narrative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {summaries.map((s) => {
          const insight = monthInsights[s.month];
          return (
            <div
              key={s.month}
              className="bg-slate-900/70 rounded-xl border border-slate-800 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white text-sm">
                    {s.month} 2026: {insight?.title}
                  </span>
                  <span className="font-mono text-emerald-400 text-xs font-semibold">
                    {s.resolutionRate.toFixed(1)}% Res. Rate
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{insight?.highlight}</p>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    RCA & Architectural Findings:
                  </span>
                  <p className="text-slate-400 leading-relaxed">{insight?.rcaObservation}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>P1: <strong className="text-red-400">{s.p1}</strong></span>
                  <span>·</span>
                  <span>Avg: <strong className="text-slate-200">{s.avgResolutionHours}h</strong></span>
                </div>

                <button
                  onClick={() => onSelectMonth(s.month)}
                  className="text-xs font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Filter issues for {s.month}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
