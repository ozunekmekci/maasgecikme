import { RawPayrollRecord, SalaryClaimRow, CaseSummary, SeveranceClaim, AnnualLeaveClaim, CompensationItem } from '../types/payroll';

// Month names in Turkish
export const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * Calculates due date (Muacceliyet Tarihi). Default: 5th of the following month.
 */
export function getDueDateForMonthYear(month: number, year: number, dueDayOfMonth: number = 5): string {
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const mStr = String(nextMonth).padStart(2, '0');
  const dStr = String(dueDayOfMonth).padStart(2, '0');
  return `${nextYear}-${mStr}-${dStr}`;
}

/**
 * Calculate difference in days between two YYYY-MM-DD dates.
 */
export function getDaysDifference(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Format currency to Turkish Lira (TL) format: 1.234,56 TL
 */
export function formatTL(amount: number, showCurrency = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0,00' + (showCurrency ? ' TL' : '');
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return showCurrency ? `${formatted} TL` : formatted;
}

/**
 * Format date string (YYYY-MM-DD) to Turkish format (DD.MM.YYYY)
 */
export function formatDateTR(dateStr?: string): string {
  if (!dateStr || dateStr === '-') return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}

/**
 * Build initial SalaryClaimRows from RawPayrollRecords
 */
export function buildSalaryClaimRows(
  records: RawPayrollRecord[],
  globalInterestRate: number = 50,
  calculationDate: string = '2026-08-28',
  dueDay: number = 5
): SalaryClaimRow[] {
  return records.map((record) => {
    const isAugust2025 = record.year === 2025 && record.month === 8;
    const dueDate = getDueDateForMonthYear(record.month, record.year, dueDay);
    
    // Status & actual payment date
    let status: 'paid' | 'unpaid' = isAugust2025 ? 'paid' : 'unpaid';
    let actualPaymentDate: string | undefined = isAugust2025 ? '2026-01-05' : undefined;

    return calculateSingleRow({
      id: record.id,
      period: record.period,
      month: record.month,
      year: record.year,
      netSalary: record.netSalary,
      dueDate,
      actualPaymentDate,
      status,
      calculationDate,
      delayDays: 0,
      annualInterestRate: globalInterestRate,
      accruedInterest: 0,
      totalClaim: 0,
      note: isAugust2025 
        ? "Anapara 05.01.2026'da ödendi (Yalnızca faiz farkı)" 
        : 'Ödenmedi',
      rawRecord: record
    });
  });
}

/**
 * Calculate interest and claim for a single row
 */
export function calculateSingleRow(row: SalaryClaimRow): SalaryClaimRow {
  let delayDays = 0;
  let accruedInterest = 0;
  let totalClaim = 0;
  let note = row.note;

  if (row.status === 'paid') {
    // Interest between dueDate and actualPaymentDate
    if (row.actualPaymentDate && row.dueDate) {
      delayDays = getDaysDifference(row.dueDate, row.actualPaymentDate);
      accruedInterest = (row.netSalary * (row.annualInterestRate / 100) * delayDays) / 365;
      // Since principal was paid, only interest is claimed
      totalClaim = accruedInterest;
      if (!row.note || row.note === 'Ödenmedi') {
        note = `Anapara ${formatDateTR(row.actualPaymentDate)}'de ödendi (Yalnızca faiz farkı)`;
      }
    } else {
      delayDays = 0;
      accruedInterest = 0;
      totalClaim = 0;
    }
  } else if (row.status === 'unpaid') {
    if (row.calculationDate && row.dueDate) {
      delayDays = getDaysDifference(row.dueDate, row.calculationDate);
      accruedInterest = (row.netSalary * (row.annualInterestRate / 100) * delayDays) / 365;
      totalClaim = row.netSalary + accruedInterest;
      if (!row.note || row.note.includes('ödendi')) {
        note = 'Ödenmedi';
      }
    }
  } else if (row.status === 'partial') {
    const paid = row.paidAmount || 0;
    const remainingPrincipal = Math.max(0, row.netSalary - paid);
    delayDays = getDaysDifference(row.dueDate, row.calculationDate);
    // Interest on unpaid portion
    accruedInterest = (remainingPrincipal * (row.annualInterestRate / 100) * delayDays) / 365;
    totalClaim = remainingPrincipal + accruedInterest;
    note = `Kısmi ödendi (${formatTL(paid)} ödendi, Kalan anapara: ${formatTL(remainingPrincipal)})`;
  }

  return {
    ...row,
    delayDays,
    accruedInterest: Number(accruedInterest.toFixed(2)),
    totalClaim: Number(totalClaim.toFixed(2)),
    note
  };
}

/**
 * Calculate overall case totals
 */
export function calculateCaseSummary(
  rows: SalaryClaimRow[],
  severance: SeveranceClaim,
  annualLeave: AnnualLeaveClaim,
  compensations: CompensationItem[]
): CaseSummary {
  let totalWagePrincipalUnpaid = 0;
  let totalWageInterest = 0;
  let totalWageClaims = 0;

  rows.forEach((r) => {
    if (r.status === 'unpaid') {
      totalWagePrincipalUnpaid += r.netSalary;
    } else if (r.status === 'partial') {
      totalWagePrincipalUnpaid += Math.max(0, r.netSalary - (r.paidAmount || 0));
    }
    totalWageInterest += r.accruedInterest;
    totalWageClaims += r.totalClaim;
  });

  const totalSeveranceNet = severance.enabled ? severance.netSeverance : 0;
  const totalLeaveNet = annualLeave.enabled ? annualLeave.netAmount : 0;
  
  const totalOtherCompensations = compensations
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + c.calculatedAmount, 0);

  const grandTotalClaim = totalWageClaims + totalSeveranceNet + totalLeaveNet + totalOtherCompensations;

  return {
    totalWagePrincipalUnpaid: Number(totalWagePrincipalUnpaid.toFixed(2)),
    totalWageInterest: Number(totalWageInterest.toFixed(2)),
    totalWageClaims: Number(totalWageClaims.toFixed(2)),
    totalSeveranceNet: Number(totalSeveranceNet.toFixed(2)),
    totalLeaveNet: Number(totalLeaveNet.toFixed(2)),
    totalOtherCompensations: Number(totalOtherCompensations.toFixed(2)),
    grandTotalClaim: Number(grandTotalClaim.toFixed(2))
  };
}
