import React, { useState } from 'react';
import { GuidelinePlaybook, Issue } from '../types/issue';
import { OPERATIONAL_GUIDELINES } from '../data/guidelines';
import { Search, BookOpen, AlertTriangle, ShieldCheck, CheckSquare, ExternalLink, Zap } from 'lucide-react';

interface GuidelinesViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  initialSearchQuery?: string;
}

export const GuidelinesView: React.FC<GuidelinesViewProps> = ({
  issues,
  onSelectIssue,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGuideline, setSelectedGuideline] = useState<GuidelinePlaybook | null>(null);

  // Quick symptom query helper
  const quickSymptoms = [
    'Memory limit timeout',
    'Spam auto-reply loop',
    'Upstream X DM lag',
    'License mismatch 250 vs 600',
    'Code deployed without DB update',
    'Missing customer chat history',
    'Supervisor queue filter mismatch',
  ];

  const filteredGuidelines = OPERATIONAL_GUIDELINES.filter((g) => {
    if (selectedCategory !== 'all' && g.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        g.title.toLowerCase().includes(q) ||
        g.rootCauseSummary.toLowerCase().includes(q) ||
        g.recommendedResolution.toLowerCase().includes(q) ||
        g.preventiveAction.toLowerCase().includes(q) ||
        g.vendorOrModule.toLowerCase().includes(q) ||
        g.symptoms.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const categories = Array.from(new Set(OPERATIONAL_GUIDELINES.map((g) => g.category)));

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Operational Guidelines & RCA Knowledge Base
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative incident resolution playbooks synthesized from historical NOC tickets for fast future diagnosis.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>Synthesized from</span>
          <strong className="text-slate-200 tabular-nums font-bold">107 Tickets</strong>
        </div>
      </div>

      {/* Search & Quick Symptoms */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms, root causes, or modules (e.g. memory, spam, Nubitel, license, DM lag, graph api)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Quick Symptom Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>Common issues:</span>
          </span>
          {quickSymptoms.map((symptom) => (
            <button
              key={symptom}
              onClick={() => setSearchQuery(symptom)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              {symptom}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-orange-400 hover:text-orange-300 underline ml-2 cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories ({OPERATIONAL_GUIDELINES.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGuidelines.length === 0 ? (
          <div className="col-span-2 py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm text-slate-300 font-medium">No operational guidelines matched your query.</p>
            <p className="text-xs text-slate-500 mt-1">Try another keyword or view all categories.</p>
          </div>
        ) : (
          filteredGuidelines.map((playbook) => {
            const linkedIssues = issues.filter((i) => playbook.historicalTicketIds.includes(i.id));

            return (
              <div
                key={playbook.id}
                className="bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-orange-400 font-bold">{playbook.id}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{playbook.category}</span>
                    </div>

                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.5 rounded border ${
                        playbook.severityDefault === 'P1'
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {playbook.severityDefault}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {playbook.title}
                  </h3>

                  <div className="text-xs text-slate-400 mb-3">
                    <strong className="text-slate-300">Target System / Module:</strong>{' '}
                    {playbook.vendorOrModule}
                  </div>

                  {/* Symptoms */}
                  <div className="mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Observed Symptoms</span>
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {playbook.symptoms.map((sym, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-500 select-none">•</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Root Cause Finding */}
                  <div className="mb-3 text-xs">
                    <strong className="text-slate-300 block mb-1">Established Root Cause (RCA):</strong>
                    <p className="text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      {playbook.rootCauseSummary}
                    </p>
                  </div>

                  {/* Recommended Resolution SOP */}
                  <div className="mb-3 text-xs">
                    <strong className="text-emerald-400 block mb-1 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Recommended SOP & Action:</span>
                    </strong>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-line bg-emerald-500/[0.04] p-2.5 rounded-lg border border-emerald-500/20">
                      {playbook.recommendedResolution}
                    </div>
                  </div>

                  {/* Preventive Action */}
                  <div className="text-xs">
                    <strong className="text-sky-400 block mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Preventive Action / Hardening:</span>
                    </strong>
                    <p className="text-slate-400 leading-relaxed bg-sky-500/[0.04] p-2 rounded-lg border border-sky-500/20">
                      {playbook.preventiveAction}
                    </p>
                  </div>
                </div>

                {/* Linked Historical Tickets */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Historical Tickets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedIssues.map((issue) => (
                        <button
                          key={issue.id}
                          onClick={() => onSelectIssue(issue)}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                          title={`Click to view incident #${issue.id}: ${issue.longDescription}`}
                        >
                          #{issue.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {playbook.historicalTicketIds.length} incident cases
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
