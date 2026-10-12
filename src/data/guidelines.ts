import { GuidelinePlaybook } from '../types/issue';

export const OPERATIONAL_GUIDELINES: GuidelinePlaybook[] = [
  {
    id: 'SOP-01',
    title: 'Application Code & Database Schema Mismatch Resolution',
    category: 'Deployment & System Architecture',
    severityDefault: 'P1',
    vendorOrModule: 'Nubitel / Core Application',
    symptoms: [
      'Email team or SocMed team completely unable to send/reply',
      'Sudden system 500 error after scheduled or unscheduled release',
      'Database attribute missing or undefined errors in server logs',
    ],
    rootCauseSummary:
      'Application code update deployed to production without executing the corresponding database migration scripts, creating an application-level schema mismatch.',
    recommendedResolution:
      '1. Verify the release version and identify missing migration scripts.\n2. Execute missing schema migration commands against the operational database immediately.\n3. Validate email send/reply functionality with NOC test mailboxes.',
    preventiveAction:
      'Mandate automated database migration checks in CI/CD release pipeline before routing traffic to new worker nodes.',
    historicalTicketIds: [1],
  },
  {
    id: 'SOP-02',
    title: 'Upstream Social Media Latency & Disconnect Protocol',
    category: 'Social Media & Upstream APIs',
    severityDefault: 'P1',
    vendorOrModule: 'X (Twitter) / Meta (FB, WA, IG)',
    symptoms: [
      'Backdated response timestamps from customer or agents',
      'Delay in receiving incoming customer DMs (Unifi handle)',
      'Customer replies appearing out of order',
    ],
    rootCauseSummary:
      'Message latency originating upstream on provider API servers (X/Twitter, Meta Graph API) rather than within internal NOC/Nubitel infrastructure. Webhook payload timestamp proves internal receipt was instant upon delivery.',
    recommendedResolution:
      '1. Check upstream provider developer status portals (Twitter API Status, Meta API Dashboard).\n2. Cross-reference message "created_at" timestamp with internal "received_at" webhook log.\n3. Search interaction history via UUID and Handle ID to verify conversation thread continuity.',
    preventiveAction:
      'Display upstream webhook arrival timestamp on agent interface alongside customer message timestamp so agents can distinguish provider latency from local lag.',
    historicalTicketIds: [2, 3, 24, 27, 49],
  },
  {
    id: 'SOP-03',
    title: 'High-Volume Spam Flooding & Mail Loop Neutralization',
    category: 'Email & Security Ingestion',
    severityDefault: 'P1',
    vendorOrModule: 'Exchange / Nubitel / Postfix MTA',
    symptoms: [
      'Sudden surge of hundreds to thousands of identical incoming emails in minutes',
      'Spam from automated systems (e.g. services-portal.support, MicrosoftExchange NDR bounce loops)',
      'Email team queue SLA severely degraded by phantom tickets',
    ],
    rootCauseSummary:
      'Automated bounce loops or external spam storms bypassing standard ingress filters, creating thousands of unassigned tickets that clog agent handling queues.',
    recommendedResolution:
      '1. Escalate immediately to Nubitel database administrator for backend bulk ticket purge/closure.\n2. Request TM Mail Gateway Administrator (Laila / Postmaster) to permanently quarantine the sender domain/IP at the boundary firewall.\n3. Configure Exchange transport rules to drop auto-reply NDR loops addressed to shared service queues.',
    preventiveAction:
      'Deploy rate-limiting throttle on incoming mailbox webhooks (maximum 20 messages per sender per hour) and enforce automated DMARC/SPF hard-fail reject.',
    historicalTicketIds: [8, 9, 11, 26, 56],
  },
  {
    id: 'SOP-04',
    title: 'RTA & Custom Report Template Crash Recovery',
    category: 'Reporting & Analytics (RTA)',
    severityDefault: 'P1',
    vendorOrModule: 'RTA Report Generator / PostgreSQL',
    symptoms: [
      'RTA team unable to extract data from report templates (timeout/white screen)',
      'Social Post Detail Report or Agent State Detail Report spinning indefinitely',
      'Background report generation worker process becomes unresponsive',
    ],
    rootCauseSummary:
      'Report pre-processing task encounters runtime container memory exhaustion under heavy monthly dataset volume, or table scans on unpartitioned logging tables.',
    recommendedResolution:
      '1. Increase runtime memory allocation for the report processing microservice (e.g. 2GB -> 4GB).\n2. Provide supervisors with the "Interaction Detail (Chat/Summary) Customized Report" as an immediate aggregate workaround.\n3. Restart report queue worker container to flush hung lock files.',
    preventiveAction:
      'Partition large historical activity tables by month, add composite database indexes on (campaign_id, timestamp), and enforce pagination on report queries.',
    historicalTicketIds: [7, 12, 17, 50, 54, 98, 107],
  },
  {
    id: 'SOP-05',
    title: 'Agent Seat Licensing & Privilege Synchronization',
    category: 'Licensing & User Management',
    severityDefault: 'P1',
    vendorOrModule: 'Nubitel Backend License Manager',
    symptoms: [
      'Newly provisioned users cannot be activated or assigned to campaigns',
      'Reports abort when newly created staff records are queried',
      'License limit warning during peak shift onboarding (e.g. 250 vs 600+ users)',
    ],
    rootCauseSummary:
      'User accounts created in active directory exceed backend license quota configuration, causing report extraction and routing scripts to abort with license authorization faults.',
    recommendedResolution:
      '1. Access backend configuration console and synchronize license seat allocation tier with actual user headcount.\n2. Re-trigger user synchronization batch job to license pending accounts.\n3. Re-run failed report extraction for affected user IDs.',
    preventiveAction:
      'Set automated alert when active user count reaches 85% of purchased license capacity to allow timely procurement and license file updates.',
    historicalTicketIds: [17, 31],
  },
  {
    id: 'SOP-06',
    title: 'Supervisor Campaign Queue Scoping & Filter Guidelines',
    category: 'Campaign & Queue Management',
    severityDefault: 'P2',
    vendorOrModule: 'Supervisor Console / Routing Rules',
    symptoms: [
      'Supervisors see campaigns or tickets outside their operational jurisdiction',
      'SocMed team receiving FMC emails in CC queue or Live Chat Main queue',
      'Inconsistent ticket counts between Supervisor view and Agent view',
    ],
    rootCauseSummary:
      'Campaign Queue configuration displaying global campaigns by default, or supervisors selecting "All" under Agent List while deselecting specific campaigns, generating conflicting SQL filters.',
    recommendedResolution:
      '1. Advise supervisors: When FMC-Email Campaign is unticked, DO NOT select "All" under Agent List. Only select relevant team members.\n2. Verify supervisor account scope assignments in Nubitel campaign settings.\n3. If counts diverge, clear supervisor client cache and verify Redis queue sync.',
    preventiveAction:
      'Deploy UI constraint preventing selection of "All Agents" when specific campaigns are unchecked, and enforce strict role-based queue scoping.',
    historicalTicketIds: [5, 6, 10, 14, 18],
  },
  {
    id: 'SOP-07',
    title: 'Missing Customer Interaction & Chat History Recovery',
    category: 'Customer History & Session Tracking',
    severityDefault: 'P1',
    vendorOrModule: 'Nubitel Chat Session / UUID Registry',
    symptoms: [
      'Agents receive chats without previous conversation history',
      'Customer forced to repeat issue details from scratch',
      'Interaction history search returns blank or missing Handle ID',
    ],
    rootCauseSummary:
      'WebSocket reconnection dropped conversation UUID and Handle ID association, or client-side caching failed to fetch newly closed interaction records.',
    recommendedResolution:
      '1. Instruct agent to search using UUID and Handle ID in All Interaction directory.\n2. Verify that UUID session persistence is active in Nubitel configuration.\n3. Clear agent browser cache or test via incognito session.',
    preventiveAction:
      'Enforce permanent database linking between customer phone/email and all child interaction UUIDs regardless of websocket reconnect count.',
    historicalTicketIds: [13, 15, 52, 57],
  },
  {
    id: 'SOP-08',
    title: 'Nubitel Webhook & Microsoft Graph API Intermittent Failures',
    category: 'API & Gateway Integrations',
    severityDefault: 'P1',
    vendorOrModule: 'Graph API / Ingress Webhook Proxy',
    symptoms: [
      'Intermittent disconnection between Nubitel webhook and Graph API',
      'Inbound emails failing to convert into tickets; duplicate retries',
      '502 Bad Gateway or SSL handshake timeout on webhook receiver',
    ],
    rootCauseSummary:
      'SSL certificate renewal mismatch, Azure AD client secret expiry, or Graph API throttling due to burst traffic.',
    recommendedResolution:
      '1. Check webhook endpoint TLS certificate validity and CA bundle.\n2. Confirm Azure AD app registration client secret status in tenant administration.\n3. Restart webhook listener pods and inspect retry backlog.',
    preventiveAction:
      'Configure redundant webhook receiver endpoints with active dead-letter queues (DLQ) for automated retry processing.',
    historicalTicketIds: [4, 48, 53],
  },
];
