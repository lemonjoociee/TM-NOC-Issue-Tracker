import React, { useState } from 'react';
import { Issue, IssueStatus, Priority, RcaStatus } from '../types/issue';
import { OPERATIONAL_GUIDELINES } from '../data/guidelines';
import { X, Check, Edit2, ShieldAlert, Clock, User, Link as LinkIcon, BookOpen, AlertCircle } from 'lucide-react';

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
  onSaveIssue: (updatedIssue: Issue) => void;
  onNavigateToGuideline?: (guidelineId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onSaveIssue,
  onNavigateToGuideline,
}) => {
  if (!issue) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Issue>({ ...issue });

  // Find matching guidelines for this issue
  const matchingGuidelines = OPERATIONAL_GUIDELINES.filter(
    (g) =>
      g.historicalTicketIds.includes(issue.id) ||
      g.symptoms.some((s) => issue.longDescription.toLowerCase().includes(s.toLowerCase().slice(0, 15))) ||
      issue.issueArea.toLowerCase().includes(g.vendorOrModule.toLowerCase().slice(0, 5))
  );

  const handleSave = () => {
    // If status changed to Resolved, update solvedDate/time if empty
    let updated = { ...formData, lastUpdated: new Date().toLocaleString() };
    if (updated.status === 'Resolved' && (!updated.solvedDate || updated.solvedDate.trim() === '')) {
      const today = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${months[today.getMonth()]}-26`;
      updated.solvedDate = dateStr;
      updated.solvedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updated.resolvedDateTime = `${dateStr} ${updated.solvedTime}`;
      if (updated.rootCause.trim()) {
        updated.rcaStatus = 'Included';
      }
    }
    onSaveIssue(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-orange-400 tabular-nums">
              Incident #{issue.id}
            </span>
            <span className="text-slate-500">·</span>
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded font-bold border ${
                issue.priority === 'P1'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : issue.priority === 'P2'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}
            >
              {issue.priority}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-sm font-semibold text-slate-200">{issue.issueArea}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit / Update RCA</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Main Title / Long Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Long Description / Operational Enquiry
            </label>
            {isEditing ? (
              <textarea
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            ) : (
              <div className="text-sm font-semibold text-white bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {issue.longDescription}
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Status</span>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as IssueStatus })}
                  className="mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Resolved">Resolved</option>
                </select>
              ) : (
                <span
                  className={`font-semibold mt-0.5 inline-block ${
                    issue.status === 'Resolved'
                      ? 'text-emerald-400'
                      : 'text-amber-400 font-bold'
                  }`}
                >
                  {issue.status}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Priority</span>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                </select>
              ) : (
                <span className="font-mono font-semibold text-slate-200 mt-0.5 inline-block">
                  {issue.priority}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">RCA Status</span>
              {isEditing ? (
                <select
                  value={formData.rcaStatus}
                  onChange={(e) => setFormData({ ...formData, rcaStatus: e.target.value as RcaStatus })}
                  className="mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Included">Included</option>
                  <option value="Pending RCA">Pending RCA</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="N/A">N/A</option>
                </select>
              ) : (
                <span className="font-mono text-slate-300 mt-0.5 inline-block">{issue.rcaStatus}</span>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Ticket Age / Duration</span>
              <span className="font-mono text-slate-200 mt-0.5 inline-block tabular-nums">
                {issue.ageHours}
              </span>
            </div>
          </div>

          {/* Incident Timeline & Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeline */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Incident Timeline</span>
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reported:</span>
                  <span className="font-mono text-slate-200">
                    {issue.reportedDate} {issue.reportedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Solved:</span>
                  <span className="font-mono text-slate-200">
                    {issue.solvedDate ? `${issue.solvedDate} ${issue.solvedTime}` : 'Not Solved (Active)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolved Date/Time:</span>
                  <span className="font-mono text-slate-200">
                    {issue.resolvedDateTime || 'Pending ticket resolution'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last System Update:</span>
                  <span className="font-mono text-slate-400">{issue.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Personnel & Routing */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Incident Ownership</span>
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reported By:</span>
                  <span className="text-slate-200 font-medium">{issue.reportedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NOC PIC / Lead:</span>
                  <span className="text-orange-400 font-semibold">{issue.contactTeam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracker Label:</span>
                  <span className="text-slate-300">{issue.trackerLabel}</span>
                </div>
                {issue.evidenceLink && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Evidence Link:</span>
                    <a
                      href={issue.evidenceLink.startsWith('http') ? issue.evidenceLink : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 truncate max-w-[180px] flex items-center gap-1 font-mono text-[11px]"
                    >
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      <span>{issue.evidenceLink}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expected Result & Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Expected Operational Result
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                  {issue.expectedResult || 'Not specified'}
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Impact / Affected User or Module
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                />
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                  {issue.impact || 'Not specified'}
                </div>
              )}
            </div>
          </div>

          {/* Root Cause / Finding (RCA) */}
          <div>
            <label className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Root Cause / Technical Finding (RCA)</span>
            </label>
            {isEditing ? (
              <textarea
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                rows={3}
                placeholder="Enter root cause analysis, architecture fault, or provider upstream delay..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-slate-200 leading-relaxed font-normal">
                {issue.rootCause || 'Root cause investigation pending or not applicable (BAU).'}
              </div>
            )}
          </div>

          {/* Resolution / Explanation */}
          <div>
            <label className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Resolution / Explanation</span>
            </label>
            {isEditing ? (
              <textarea
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                rows={3}
                placeholder="Describe how the issue was resolved or current update status..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 text-slate-200 leading-relaxed font-normal">
                {issue.resolution || 'Resolution details not yet submitted.'}
              </div>
            )}
          </div>

          {/* Action Taken / Next Step */}
          <div>
            <label className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block mb-1">
              Action Taken / Preventive Next Step
            </label>
            {isEditing ? (
              <textarea
                value={formData.actionTaken}
                onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                rows={3}
                placeholder="SOP steps taken, configuration changes, or preventive actions..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-sky-500/[0.04] border border-sky-500/20 text-slate-200 leading-relaxed font-normal">
                {issue.actionTaken || 'No preventive action specified.'}
              </div>
            )}
          </div>

          {/* Matching Operational Guidelines & Knowledge Playbooks */}
          {matchingGuidelines.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Related Operational Guidelines & Playbooks</span>
              </span>

              <div className="space-y-2">
                {matchingGuidelines.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-orange-500/40 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-orange-400 font-bold text-[11px]">
                          {g.id}
                        </span>
                        <span className="font-semibold text-slate-200">{g.title}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                        {g.rootCauseSummary}
                      </p>
                    </div>

                    {onNavigateToGuideline && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToGuideline(g.id);
                        }}
                        className="text-xs text-orange-400 hover:text-orange-300 font-medium whitespace-nowrap ml-4 cursor-pointer"
                      >
                        Read SOP &rarr;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Tracker Label: <strong className="text-slate-300">{issue.trackerLabel}</strong>
          </span>

          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
