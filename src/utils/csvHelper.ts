import { Issue } from '../types/issue';

export function exportIssuesToCSV(issues: Issue[]): void {
  const headers = [
    '#',
    'Reported Date',
    'Reported Time',
    'Solved Date',
    'Solved Time',
    'Reported By',
    'Contact / Team',
    'Priority',
    'Issue Area',
    'Status',
    'Long Description / Enquiry',
    'Expected Result',
    'Impact / Affected User or Module',
    'Evidence / Screenshot Link',
    'Resolved Date/Time',
    'Resolution / Explanation',
    'Root Cause / Finding',
    'Action Taken / Next Step',
    'Tracker Label',
    'Last Updated',
    'Age (Hours)',
  ];

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = issues.map((item) => [
    escapeCSV(item.id),
    escapeCSV(item.reportedDate),
    escapeCSV(item.reportedTime),
    escapeCSV(item.solvedDate),
    escapeCSV(item.solvedTime),
    escapeCSV(item.reportedBy),
    escapeCSV(item.contactTeam),
    escapeCSV(item.priority),
    escapeCSV(item.issueArea),
    escapeCSV(item.status),
    escapeCSV(item.longDescription),
    escapeCSV(item.expectedResult),
    escapeCSV(item.impact),
    escapeCSV(item.evidenceLink),
    escapeCSV(item.resolvedDateTime),
    escapeCSV(item.resolution),
    escapeCSV(item.rootCause),
    escapeCSV(item.actionTaken),
    escapeCSV(item.trackerLabel),
    escapeCSV(item.lastUpdated),
    escapeCSV(item.ageHours),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TM_NOC_Issue_Tracker_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVToIssues(csvText: string): Issue[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse CSV with quotes handling
  const parseLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parsedIssues: Issue[] = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (!cols[0] || isNaN(Number(cols[0]))) continue;

    const id = parseInt(cols[0], 10);
    const reportedDate = cols[1] || '';
    const reportedTime = cols[2] || '';
    const solvedDate = cols[3] || '';
    const solvedTime = cols[4] || '';
    const reportedBy = cols[5] || 'NOC Operator';
    const contactTeam = cols[6] || 'Harveet';
    const priority = (['P1', 'P2', 'P3', 'P4'].includes(cols[7]) ? cols[7] : 'P2') as Issue['priority'];
    const issueArea = cols[8] || 'General';
    const status = (['Resolved', 'In Progress', 'In Review', 'On Hold', 'Open'].includes(cols[9])
      ? cols[9]
      : 'Resolved') as Issue['status'];
    const longDescription = cols[10] || '';
    const expectedResult = cols[11] || '';
    const impact = cols[12] || '';
    const evidenceLink = cols[13] || '';
    const resolvedDateTime = cols[14] || '';
    const resolution = cols[15] || '';
    const rootCause = cols[16] || '';
    const actionTaken = cols[17] || '';
    const trackerLabel = cols[18] || 'System / Application level issue';
    const lastUpdated = cols[19] || new Date().toLocaleDateString();
    const ageHours = cols[20] || 'N/A';

    // Infer month
    let month: Issue['month'] = 'July';
    if (reportedDate.toLowerCase().includes('aug')) month = 'August';
    else if (reportedDate.toLowerCase().includes('sep')) month = 'September';
    else if (reportedDate.toLowerCase().includes('oct')) month = 'October';

    const rcaStatus: Issue['rcaStatus'] =
      status === 'Resolved' ? (rootCause.trim() ? 'Included' : 'Pending RCA') : 'In Progress';

    parsedIssues.push({
      id,
      reportedDate,
      reportedTime,
      solvedDate,
      solvedTime,
      reportedBy,
      contactTeam,
      priority,
      issueArea,
      status,
      longDescription,
      expectedResult,
      impact,
      evidenceLink,
      resolvedDateTime,
      resolution,
      rootCause,
      actionTaken,
      trackerLabel,
      lastUpdated,
      ageHours,
      month,
      rcaStatus,
    });
  }

  return parsedIssues;
}
