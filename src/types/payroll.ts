export interface RawPayrollRecord {
  id: string;
  filename: string;
  period: string; // e.g. "Ağustos 2025" or "Ağustos / 2025"
  month: number; // 1-12
  year: number; // 2025, 2026, etc.
  employeeName: string;
  companyName: string;
  jobTitle: string;
  startDate: string; // "04.08.2025"
  grossSalary: number;
  netSalary: number;
  foodAllowanceGross: number;
  foodAllowanceNet: number;
  sgkWorkerDeduction: number;
  sgkUnemploymentDeduction: number;
  sgkEmployerDeduction: number;
  sgkMatrah: number;
  incomeTaxMatrah: number;
  incomeTaxAmount: number;
  stampTaxAmount: number;
  besDeduction: number;
  otherDeductions: number;
  totalGrossEarnings: number;
  totalNetEarnings: number;
  totalDeductions: number;
  workDays: number;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'partial';

export interface SalaryClaimRow {
  id: string;
  period: string;
  month: number;
  year: number;
  netSalary: number;
  dueDate: string; // YYYY-MM-DD
  actualPaymentDate?: string; // YYYY-MM-DD or empty
  status: PaymentStatus;
  paidAmount?: number; // if partial
  calculationDate: string; // YYYY-MM-DD
  delayDays: number;
  annualInterestRate: number; // e.g. 50
  accruedInterest: number;
  totalClaim: number;
  note: string;
  rawRecord?: RawPayrollRecord;
}

export interface SeveranceClaim {
  enabled: boolean;
  startDate: string; // "2025-08-04"
  terminationDate: string; // "2026-08-28"
  serviceYears: number;
  serviceDays: number;
  baseGross: number; // 70902.23
  fringeGross: number; // 10907.33 (food, etc.)
  clothedGross: number; // 81809.56
  severanceCap: number; // Kıdem tavanı
  grossSeverance: number;
  stampTax: number;
  netSeverance: number; // 86527.06
  note: string;
}

export interface AnnualLeaveClaim {
  enabled: boolean;
  leaveDays: number; // 14
  nakedGross: number; // 70902.23
  dailyGross: number;
  grossAmount: number;
  sgkCut: number;
  incomeTaxCut: number;
  stampTaxCut: number;
  netAmount: number; // 22248.50
  note: string;
}

export interface CompensationItem {
  id: string;
  title: string;
  enabled: boolean;
  basis: 'multiple_of_gross' | 'fixed_amount';
  multiplier: number; // e.g. 6 (6 Aylık Brüt Maaş)
  fixedAmount: number;
  calculatedAmount: number;
  note: string;
}

export interface CaseSummary {
  totalWagePrincipalUnpaid: number;
  totalWageInterest: number;
  totalWageClaims: number;
  totalSeveranceNet: number;
  totalLeaveNet: number;
  totalOtherCompensations: number;
  grandTotalClaim: number;
}
