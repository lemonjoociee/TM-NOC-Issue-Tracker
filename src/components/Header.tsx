import React from 'react';
import { Plus, Download, Upload, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'tracker' | 'guidelines' | 'matrix';
  setActiveTab: (tab: 'dashboard' | 'tracker' | 'guidelines' | 'matrix') => void;
  onOpenNewIssue: () => void;
  onExportCSV: () => void;
  onImportCSV: () => void;
  onOpenSharePointSync: () => void;
  onRefreshSharePoint?: () => void;
  isLiveSyncing?: boolean;
  onResetData: () => void;
  activeIssuesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewIssue,
  onExportCSV,
  onImportCSV,
  onOpenSharePointSync,
  onRefreshSharePoint,
  isLiveSyncing = false,
  onResetData,
  activeIssuesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-sm">
              TM
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="text-base font-bold tracking-tight text-white hover:text-orange-400 transition-colors whitespace-nowrap"
            >
              NOC Issue Tracker
            </a>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-1 relative ${
                activeTab === 'dashboard'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ops Monitor
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-1 relative flex items-center gap-2 ${
                activeTab === 'tracker'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Past & Present Issues</span>
              {activeIssuesCount > 0 && (
                <span className="font-mono text-xs px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 tabular-nums">
                  {activeIssuesCount} active
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-1 relative ${
                activeTab === 'guidelines'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RCA & Guidelines Hub
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`transition-colors whitespace-nowrap cursor-pointer pb-1 relative ${
                activeTab === 'matrix'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Summary Matrix
            </button>
          </nav>

          {/* Zone 3: Primary action & utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onRefreshSharePoint || onOpenSharePointSync}
              title="Real-time sync with Scicom SharePoint (Click to refresh now)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 rounded-lg border border-emerald-500/40 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            >
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isLiveSyncing ? 'animate-ping' : 'animate-pulse'}`} />
              <span>{isLiveSyncing ? 'Syncing...' : 'SharePoint Live'}</span>
            </button>

            <button
              onClick={onOpenSharePointSync}
              title="Configure SharePoint Sync settings & view link"
              className="hidden lg:flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <span>Settings</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Export Tracker as CSV formatted sheet"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenNewIssue}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incident</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
