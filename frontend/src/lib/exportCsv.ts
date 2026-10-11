import { Application } from '../types';

export function exportApplicationsToCsv(applications: Application[]): void {
  if (!applications || applications.length === 0) return;

  const headers = [
    'Company',
    'Job Title',
    'Status',
    'Workplace Mode',
    'Employment Type',
    'Min Salary',
    'Max Salary',
    'Currency',
    'Applied Date',
    'Deadline',
    'Rating (1-5)',
    'Job URL',
    'Resume Filename',
    'Notes',
  ];

  const escapeCell = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = applications.map((app) => [
    escapeCell(app.company),
    escapeCell(app.job_title),
    escapeCell(app.status),
    escapeCell(app.location_type),
    escapeCell(app.job_type),
    escapeCell(app.salary_min || ''),
    escapeCell(app.salary_max || ''),
    escapeCell(app.salary_currency || 'INR'),
    escapeCell(app.applied_date || ''),
    escapeCell(app.deadline || ''),
    escapeCell(app.rating || ''),
    escapeCell(app.job_url || ''),
    escapeCell(app.resume_filename || ''),
    escapeCell(app.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `trackr_applications_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
