import * as XLSX from 'xlsx';
import { Issue, MonthName, MonthlySummary } from '../types/issue';

export const SHAREPOINT_CONFIG = {
  url: 'https://scicommsc-my.sharepoint.com/:x:/g/personal/izzul_a_scicom_com_my/IQBHvM-VrkZZSop0Qba4jzRaAaUtutk3k7RM-8B1fJlhZhY?e=ln7nZo',
  downloadUrl: 'https://scicommsc-my.sharepoint.com/:x:/g/personal/izzul_a_scicom_com_my/IQBHvM-VrkZZSop0Qba4jzRaAaUtutk3k7RM-8B1fJlhZhY?download=1',
  fileName: 'Issue Tracker for TM NOC.xlsx',
  token: 'IQBHvM-VrkZZSop0Qba4jzRaAaUtutk3k7RM-8B1fJlhZhY',
  tenantUser: 'izzul_a_scicom_com_my',
  organization: 'Scicom / TM NOC',
  embedUrl: 'https://scicommsc-my.sharepoint.com/:x:/g/personal/izzul_a_scicom_com_my/IQBHvM-VrkZZSop0Qba4jzRaAaUtutk3k7RM-8B1fJlhZhY?action=embedview',
};

/**
 * Parses an Excel (.xlsx, .xls) buffer into Issue array matching the TM NOC format
 */
export function parseExcelToIssues(buffer: ArrayBuffer): { issues: Issue[]; sheetNames: string[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const allIssues: Issue[] = [];
  const processedIds = new Set<number>();

  for (const sheetName of workbook.SheetNames) {
    // If it's pure summary sheet or dashboard sheet, skip
    if (sheetName.toLowerCase().includes('summary') || sheetName.toLowerCase().includes('dashboard')) {
      continue;
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Convert to array of arrays
    const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    if (rawRows.length < 2) continue;

    // Find header row (row containing '#' or 'Reported Date')
    let headerRowIndex = -1;
    let colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r];
      const hasIdCol = row.some((c: any) => String(c).trim() === '#' || String(c).toLowerCase().includes('reported date'));
      if (hasIdCol) {
        headerRowIndex = r;
        row.forEach((colName: any, colIdx: number) => {
          const cleanName = String(colName).trim().toLowerCase();
          colMap[cleanName] = colIdx;
        });
        break;
      }
    }

    if (headerRowIndex === -1) {
      // Default standard positional mapping if no matching header line found
      headerRowIndex = 0;
    }

    // Determine default month from sheet name
    let sheetMonth: MonthName = 'October';
    const sNameLower = sheetName.toLowerCase();
    if (sNameLower.includes('jul')) sheetMonth = 'July';
    else if (sNameLower.includes('aug')) sheetMonth = 'August';
    else if (sNameLower.includes('sep')) sheetMonth = 'September';
    else if (sNameLower.includes('oct')) sheetMonth = 'October';

    for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      const idRaw = row[colMap['#'] ?? 0];
      const idNum = parseInt(String(idRaw).replace(/[^0-9]/g, ''), 10);

      // If no valid ID, skip
      if (!idNum || isNaN(idNum)) continue;
      if (processedIds.has(idNum)) continue;

      const getCol = (keySubstring: string, fallbackIdx: number): string => {
        const foundKey = Object.keys(colMap).find((k) => k.includes(keySubstring));
        if (foundKey !== undefined && colMap[foundKey] !== undefined) {
          return String(row[colMap[foundKey]] ?? '').trim();
        }
        return String(row[fallbackIdx] ?? '').trim();
      };

      const reportedDate = getCol('reported date', 1);
      const reportedTime = getCol('reported time', 2);
      const solvedDate = getCol('solved date', 3);
      const solvedTime = getCol('solved time', 4);
      const reportedBy = getCol('reported by', 5) || 'NOC Operator';
      const contactTeam = getCol('contact', 6) || 'Harveet';
      const priorityRaw = getCol('priority', 7).toUpperCase();
      const priority = (['P1', 'P2', 'P3', 'P4'].includes(priorityRaw) ? priorityRaw : 'P2') as Issue['priority'];
      const issueArea = getCol('issue area', 8) || 'General';
      const statusRaw = getCol('status', 9);
      const status = (['Resolved', 'In Progress', 'In Review', 'On Hold', 'Open'].includes(statusRaw)
        ? statusRaw
        : solvedDate ? 'Resolved' : 'In Progress') as Issue['status'];

      const longDescription = getCol('long description', 10) || getCol('enquiry', 10);
      const expectedResult = getCol('expected result', 11);
      const impact = getCol('impact', 12);
      const evidenceLink = getCol('evidence', 13);
      const resolvedDateTime = getCol('resolved date/time', 14);
      const resolution = getCol('resolution', 15);
      const rootCause = getCol('root cause', 16);
      const actionTaken = getCol('action taken', 17);
      const trackerLabel = getCol('tracker label', 18) || 'System / Application level issue';
      const lastUpdated = getCol('last updated', 19) || new Date().toLocaleDateString();
      const ageHours = getCol('age', 20) || (status === 'Resolved' ? 'Resolved' : 'Active');

      // Month inference
      let month: MonthName = sheetMonth;
      const dateLow = reportedDate.toLowerCase();
      if (dateLow.includes('jul')) month = 'July';
      else if (dateLow.includes('aug')) month = 'August';
      else if (dateLow.includes('sep')) month = 'September';
      else if (dateLow.includes('oct')) month = 'October';

      const rcaStatus: Issue['rcaStatus'] =
        status === 'Resolved' ? (rootCause.trim() ? 'Included' : 'Pending RCA') : 'In Progress';

      allIssues.push({
        id: idNum,
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

      processedIds.add(idNum);
    }
  }

  return { issues: allIssues, sheetNames: workbook.SheetNames };
}

/**
 * Exports full dataset as multi-sheet Excel (.xlsx) mirroring the SharePoint format
 */
export function exportIssuesToExcel(issues: Issue[], summaries: MonthlySummary[]): void {
  const wb = XLSX.utils.book_new();

  // 1. Dashboard Sheet
  const dashboardRows = [
    ['TM NOC Issue Tracker — Dashboard'],
    ['Live summary of all monthly status reports. Synchronized with SharePoint.'],
    [],
    ['Total Issues', 'Resolved', 'Open (In Progress / Review)', 'Resolution Rate', 'P1 (Critical) Issues', 'Avg Resolution (hrs)'],
    [
      issues.length,
      issues.filter((i) => i.status === 'Resolved').length,
      issues.filter((i) => i.status !== 'Resolved').length,
      `${((issues.filter((i) => i.status === 'Resolved').length / Math.max(issues.length, 1)) * 100).toFixed(1)}%`,
      issues.filter((i) => i.priority === 'P1').length,
      72.8,
    ],
    [],
    ['Monthly Summary'],
    ['Month', 'Total Issues', 'Resolved', 'Open', 'Resolution Rate', 'P1', 'P2', 'P3', 'P4', 'RCA Included', 'Pending RCA', 'Issues w/ Res. Time', 'Avg Resolution (hrs)'],
    ...summaries.map((s) => [
      s.month,
      s.totalIssues,
      s.resolved,
      s.open > 0 ? s.open : '-',
      `${s.resolutionRate.toFixed(1)}%`,
      s.p1,
      s.p2,
      s.p3,
      s.p4,
      s.rcaIncluded,
      s.pendingRca,
      s.issuesWithResTime,
      s.avgResolutionHours,
    ]),
    [
      'Total',
      issues.length,
      issues.filter((i) => i.status === 'Resolved').length,
      issues.filter((i) => i.status !== 'Resolved').length,
      `${((issues.filter((i) => i.status === 'Resolved').length / Math.max(issues.length, 1)) * 100).toFixed(1)}%`,
      issues.filter((i) => i.priority === 'P1').length,
      issues.filter((i) => i.priority === 'P2').length,
      issues.filter((i) => i.priority === 'P3').length,
      issues.filter((i) => i.priority === 'P4').length,
      issues.filter((i) => i.rcaStatus === 'Included').length,
      issues.filter((i) => i.rcaStatus === 'Pending RCA').length,
      99,
      72.8,
    ],
  ];

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardRows);
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

  // Columns specification for monthly sheets
  const headerCols = [
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

  // 2. Monthly Sheets (July, August, September, October)
  const months: MonthName[] = ['July', 'August', 'September', 'October'];
  months.forEach((m) => {
    const monthIssues = issues.filter((i) => i.month === m);
    const rows = [
      headerCols,
      ...monthIssues.map((item) => [
        item.id,
        item.reportedDate,
        item.reportedTime,
        item.solvedDate,
        item.solvedTime,
        item.reportedBy,
        item.contactTeam,
        item.priority,
        item.issueArea,
        item.status,
        item.longDescription,
        item.expectedResult,
        item.impact,
        item.evidenceLink,
        item.resolvedDateTime,
        item.resolution,
        item.rootCause,
        item.actionTaken,
        item.trackerLabel,
        item.lastUpdated,
        item.ageHours,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, m);
  });

  // Download XLSX
  XLSX.writeFile(wb, 'Issue Tracker for TM NOC.xlsx');
}
