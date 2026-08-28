import { SalaryClaimRow, SeveranceClaim, AnnualLeaveClaim, CompensationItem, CaseSummary } from '../types/payroll';
import { formatTL, formatDateTR } from './interestCalculator';

/**
 * Export claims table to CSV / Excel readable format with BOM for Turkish characters
 */
export function exportToCSV(
  rows: SalaryClaimRow[],
  severance: SeveranceClaim,
  annualLeave: AnnualLeaveClaim,
  compensations: CompensationItem[],
  summary: CaseSummary,
  calculationDate: string
) {
  const delimiter = ';';
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel

  // Header
  const headers = [
    'Dönem',
    'Bordro Net Maaş (TL)',
    'Muacceliyet Tarihi',
    'Fiili Ödeme Tarihi',
    `Gecikme Günü (${formatDateTR(calculationDate)})`,
    'Yıllık Faiz Oranı',
    'İşleyen Faiz (TL)',
    'Talep Edilen Toplam (TL)',
    'Durum / Not'
  ];
  csvContent += headers.join(delimiter) + '\r\n';

  // Monthly rows
  rows.forEach((r) => {
    const rowData = [
      r.period,
      r.netSalary.toFixed(2).replace('.', ','),
      formatDateTR(r.dueDate),
      r.actualPaymentDate ? formatDateTR(r.actualPaymentDate) : '-',
      r.delayDays,
      `%${r.annualInterestRate}`,
      r.accruedInterest.toFixed(2).replace('.', ','),
      r.totalClaim.toFixed(2).replace('.', ','),
      `"${r.note.replace(/"/g, '""')}"`
    ];
    csvContent += rowData.join(delimiter) + '\r\n';
  });

  // Wage Total
  csvContent += [
    'TOPLAM ÜCRET ALACAĞI',
    summary.totalWagePrincipalUnpaid.toFixed(2).replace('.', ','),
    '-',
    '-',
    '-',
    '-',
    summary.totalWageInterest.toFixed(2).replace('.', ','),
    summary.totalWageClaims.toFixed(2).replace('.', ','),
    '"Ödenmeyen Maaşlar + Faiz Farkı"'
  ].join(delimiter) + '\r\n';

  // Severance
  if (severance.enabled) {
    csvContent += [
      `Kıdem Tazminatı (${severance.serviceYears} Yıl ${severance.serviceDays} Gün)`,
      severance.netSeverance.toFixed(2).replace('.', ','),
      formatDateTR(severance.terminationDate),
      '-',
      '-',
      '-',
      '-',
      severance.netSeverance.toFixed(2).replace('.', ','),
      `"${severance.note.replace(/"/g, '""')}"`
    ].join(delimiter) + '\r\n';
  }

  // Annual Leave
  if (annualLeave.enabled) {
    csvContent += [
      `Yıllık İzin Ücreti (${annualLeave.leaveDays} Gün)`,
      annualLeave.netAmount.toFixed(2).replace('.', ','),
      formatDateTR(calculationDate),
      '-',
      '-',
      '-',
      '-',
      annualLeave.netAmount.toFixed(2).replace('.', ','),
      `"${annualLeave.note.replace(/"/g, '""')}"`
    ].join(delimiter) + '\r\n';
  }

  // Other Compensations
  compensations.forEach((c) => {
    if (c.enabled) {
      csvContent += [
        c.title,
        c.calculatedAmount.toFixed(2).replace('.', ','),
        '-',
        '-',
        '-',
        '-',
        '-',
        c.calculatedAmount.toFixed(2).replace('.', ','),
        `"${c.note.replace(/"/g, '""')}"`
      ].join(delimiter) + '\r\n';
    }
  });

  // Grand Total
  csvContent += [
    'GENEL DAVA TOPLAMI',
    (summary.totalWagePrincipalUnpaid + summary.totalSeveranceNet + summary.totalLeaveNet + summary.totalOtherCompensations).toFixed(2).replace('.', ','),
    '-',
    '-',
    '-',
    '-',
    summary.totalWageInterest.toFixed(2).replace('.', ','),
    summary.grandTotalClaim.toFixed(2).replace('.', ','),
    '"Dava İcmali (Masraflar Hariç)"'
  ].join(delimiter) + '\r\n';

  // Download Trigger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Maas_Ve_Faiz_Hesaplama_${calculationDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export full JSON data for backup/restore
 */
export function exportToJSON(data: any, filename: string = 'maas-analiz-verisi.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
