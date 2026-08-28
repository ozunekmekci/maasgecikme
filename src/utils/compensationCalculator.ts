import { SeveranceClaim, AnnualLeaveClaim, CompensationItem } from '../types/payroll';

/**
 * Calculates tenure in years and days between two dates.
 */
export function calculateTenure(startDateStr: string, endDateStr: string): { years: number; days: number; totalDays: number } {
  if (!startDateStr || !endDateStr) return { years: 0, days: 0, totalDays: 0 };
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (end < start) return { years: 0, days: 0, totalDays: 0 };

  let years = end.getFullYear() - start.getFullYear();
  let tempDate = new Date(start);
  tempDate.setFullYear(start.getFullYear() + years);

  if (tempDate > end) {
    years--;
    tempDate = new Date(start);
    tempDate.setFullYear(start.getFullYear() + years);
  }

  const diffTime = end.getTime() - tempDate.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return { years, days, totalDays };
}

/**
 * Re-calculate Severance Claim (Kıdem Tazminatı)
 */
export function calculateSeverance(
  startDate: string,
  terminationDate: string,
  baseGross: number,
  fringeGross: number,
  severanceCap: number = 99999999
): SeveranceClaim {
  const tenure = calculateTenure(startDate, terminationDate);
  const clothedGross = baseGross + fringeGross;
  const applicableGross = Math.min(clothedGross, severanceCap);

  // Gross severance = (applicableGross * years) + (applicableGross / 365 * days)
  const grossSeverance = (applicableGross * tenure.years) + ((applicableGross / 365) * tenure.days);
  
  // Stamp tax rate: 0.00759 (%0.759)
  const stampTax = grossSeverance * 0.00759;
  const netSeverance = grossSeverance - stampTax;

  return {
    enabled: true,
    startDate,
    terminationDate,
    serviceYears: tenure.years,
    serviceDays: tenure.days,
    baseGross,
    fringeGross,
    clothedGross: Number(clothedGross.toFixed(2)),
    severanceCap,
    grossSeverance: Number(grossSeverance.toFixed(2)),
    stampTax: Number(stampTax.toFixed(2)),
    netSeverance: Number(netSeverance.toFixed(2)),
    note: `Giydirilmiş brüt ${clothedGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL / Net tutar (${tenure.years} Yıl ${tenure.days} Gün)`
  };
}

/**
 * Re-calculate Annual Leave Claim (Yıllık İzin Ücreti)
 */
export function calculateAnnualLeave(
  nakedGross: number,
  leaveDays: number = 14,
  incomeTaxRate: number = 0.20 // Or cumulative bracket average
): AnnualLeaveClaim {
  const dailyGross = nakedGross / 30;
  const grossAmount = dailyGross * leaveDays;
  
  // Deductions for annual leave in Turkey:
  // 1. SGK worker: 14% + Unemployment: 1% = 15%
  const sgkCut = grossAmount * 0.15;
  // 2. Income tax matrah = grossAmount - sgkCut
  const incomeTaxMatrah = grossAmount - sgkCut;
  const incomeTaxCut = incomeTaxMatrah * incomeTaxRate;
  // 3. Stamp tax: 0.00759
  const stampTaxCut = grossAmount * 0.00759;

  const netAmount = grossAmount - sgkCut - incomeTaxCut - stampTaxCut;

  return {
    enabled: true,
    leaveDays,
    nakedGross,
    dailyGross: Number(dailyGross.toFixed(4)),
    grossAmount: Number(grossAmount.toFixed(2)),
    sgkCut: Number(sgkCut.toFixed(2)),
    incomeTaxCut: Number(incomeTaxCut.toFixed(2)),
    stampTaxCut: Number(stampTaxCut.toFixed(2)),
    netAmount: Number(netAmount.toFixed(2)),
    note: `Çıplak brüt ${nakedGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL / Net tutar (${leaveDays} Gün)`
  };
}

/**
 * Re-calculate a Compensation Item
 */
export function calculateCompensationItem(item: CompensationItem, baseGross: number): CompensationItem {
  let calculatedAmount = item.fixedAmount;
  if (item.basis === 'multiple_of_gross') {
    calculatedAmount = baseGross * item.multiplier;
  }
  return {
    ...item,
    calculatedAmount: Number(calculatedAmount.toFixed(2))
  };
}
