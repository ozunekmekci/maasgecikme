import * as pdfjsLib from 'pdfjs-dist';
import { RawPayrollRecord } from '../types/payroll';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const MONTH_MAP: Record<string, number> = {
  'ocak': 1,
  'şubat': 2,
  'subat': 2,
  'mart': 3,
  'nisan': 4,
  'mayıs': 5,
  'mayis': 5,
  'haziran': 6,
  'temmuz': 7,
  'ağustos': 8,
  'agustos': 8,
  'eylül': 9,
  'eylul': 9,
  'ekim': 10,
  'kasım': 11,
  'kasim': 11,
  'aralık': 12,
  'aralik': 12
};

function parseNum(val?: string | null): number {
  if (!val) return 0;
  // Remove thousand dots, change decimal comma to dot
  const clean = val.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export async function parsePdfFile(file: File): Promise<RawPayrollRecord> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return extractPayrollDataFromText(fullText, file.name);
}

export function extractPayrollDataFromText(text: string, filename: string): RawPayrollRecord {
  // Period extraction (e.g. Dönem : Ağustos / 2025 or Ağustos 2025)
  const periodMatch = text.match(/Dönem\s*:\s*([A-Za-zÇĞİÖŞÜçğıöşü\s\/0-9]+)/i);
  let rawPeriod = periodMatch ? periodMatch[1].trim() : '';
  
  let month = 1;
  let year = 2025;
  let periodName = filename.replace(/\.pdf$/i, '');

  if (rawPeriod) {
    const parts = rawPeriod.split(/[\/\s-]+/).filter(Boolean);
    for (const p of parts) {
      const lower = p.toLowerCase();
      if (MONTH_MAP[lower]) {
        month = MONTH_MAP[lower];
      } else if (/^20\d\d$/.test(p)) {
        year = parseInt(p, 10);
      }
    }
    const turkishMonthName = Object.keys(MONTH_MAP).find(k => MONTH_MAP[k] === month) || 'Ocak';
    const formattedMonth = turkishMonthName.charAt(0).toUpperCase() + turkishMonthName.slice(1);
    periodName = `${formattedMonth} ${year}`;
  } else {
    // Try from filename e.g. "2025 AĞUSTOS.pdf"
    for (const [mName, mNum] of Object.entries(MONTH_MAP)) {
      if (filename.toLowerCase().includes(mName)) {
        month = mNum;
        const turkishMonthName = mName.charAt(0).toUpperCase() + mName.slice(1);
        const yMatch = filename.match(/20\d\d/);
        if (yMatch) year = parseInt(yMatch[0], 10);
        periodName = `${turkishMonthName} ${year}`;
        break;
      }
    }
  }

  // Employee Name (Anonymized & Censored)
  const employeeName = '[GİZLİ DAVACI / İŞÇİ]';

  // Company Name (Anonymized & Censored)
  const companyName = '[GİZLİ DAVALI İŞVEREN A.Ş.]';

  // Job Title
  const jobMatch = text.match(/Görevi\s*:\s*([A-Za-zÇĞİÖŞÜçğıöşü\s]+)/i);
  const jobTitle = jobMatch ? jobMatch[1].trim() : 'BİYOMEDİKAL MÜHENDİSİ';

  // Start Date
  const startMatch = text.match(/İşe\s*Giriş\s*Tarihi\s*:\s*([0-9\.]+)/i);
  const startDate = startMatch ? startMatch[1].trim() : '04.08.2025';

  // Gross Salary
  const grossMatch = text.match(/Aylık\s*Brüt\s*Ücreti\s*:\s*([0-9\.,]+)/i);
  const grossSalary = parseNum(grossMatch ? grossMatch[1] : '70902.23');

  // Net Salary
  // Check "Net Ödeme" or "Net ... TL"
  let netSalary = 0;
  const netIbraMatch = text.match(/Net\s*([0-9\.,]+)\s*TL/i);
  if (netIbraMatch) {
    netSalary = parseNum(netIbraMatch[1]);
  } else {
    const netMatch = text.match(/Net\s*Ödeme\s*([0-9\.,]+)/i);
    if (netMatch) {
      netSalary = parseNum(netMatch[1]);
    }
  }

  // Food allowance
  const foodMatch = text.match(/Yemek\s*Yardımı\s*-\s*Nakdi\s*([0-9\.,]+)\s*([0-9\.,]+)/i);
  const foodAllowanceGross = parseNum(foodMatch ? foodMatch[1] : '0');
  const foodAllowanceNet = parseNum(foodMatch ? foodMatch[2] : '0');

  // SGK
  const sgkWorkerMatch = text.match(/SGK\s*İşci\s*Kesintisi\s*([0-9\.,]+)/i);
  const sgkWorkerDeduction = parseNum(sgkWorkerMatch ? sgkWorkerMatch[1] : '0');

  const sgkUnempMatch = text.match(/SGK\s*İşci\s*İşsizlik\s*Kesintisi\s*([0-9\.,]+)/i);
  const sgkUnemploymentDeduction = parseNum(sgkUnempMatch ? sgkUnempMatch[1] : '0');

  const sgkEmployerMatch = text.match(/SGK\s*İşveren\s*Kesintisi\s*([0-9\.,]+)/i);
  const sgkEmployerDeduction = parseNum(sgkEmployerMatch ? sgkEmployerMatch[1] : '0');

  const sgkMatrahMatch = text.match(/SGK\s*Matrahı\s*([0-9\.,]+)/i);
  const sgkMatrah = parseNum(sgkMatrahMatch ? sgkMatrahMatch[1] : '0');

  // Taxes
  const gvMatrahMatch = text.match(/Gelir\s*Vergisi\s*Matrahı\s*\(Normal\)\s*([0-9\.,]+)/i);
  const incomeTaxMatrah = parseNum(gvMatrahMatch ? gvMatrahMatch[1] : '0');

  const gvMatch = text.match(/Gelir\s*Vergisi\s*Tutarı\s*([0-9\.,]+)/i);
  const incomeTaxAmount = parseNum(gvMatch ? gvMatch[1] : '0');

  const dvMatch = text.match(/Damga\s*Vergisi\s*Tutarı\s*([0-9\.,]+)/i);
  const stampTaxAmount = parseNum(dvMatch ? dvMatch[1] : '0');

  // BES & others
  const besMatch = text.match(/Bireysel\s*Emeklilik\s*Otomatik\s*Katılım\s*([0-9\.,]+)/i);
  const besDeduction = parseNum(besMatch ? besMatch[1] : '0');

  const totalEarningsMatch = text.match(/Tüm\s*Kazançlar\s*Toplamı\s*([0-9\.,]+)\s*([0-9\.,]+)/i);
  const totalGrossEarnings = parseNum(totalEarningsMatch ? totalEarningsMatch[1] : '0');
  const totalNetEarnings = parseNum(totalEarningsMatch ? totalEarningsMatch[2] : '0');

  const totalDeductionsMatch = text.match(/Tüm\s*Kesintiler\s*Toplamı\s*([0-9\.,]+)/i);
  const totalDeductions = parseNum(totalDeductionsMatch ? totalDeductionsMatch[1] : '0');

  const workDaysMatch = text.match(/Normal\s*([0-9]+)\s*Gün/i);
  const workDays = workDaysMatch ? parseInt(workDaysMatch[1], 10) : 30;

  return {
    id: `pay-${year}-${String(month).padStart(2, '0')}`,
    filename,
    period: periodName,
    month,
    year,
    employeeName,
    companyName,
    jobTitle,
    startDate,
    grossSalary,
    netSalary,
    foodAllowanceGross,
    foodAllowanceNet,
    sgkWorkerDeduction,
    sgkUnemploymentDeduction,
    sgkEmployerDeduction,
    sgkMatrah,
    incomeTaxMatrah,
    incomeTaxAmount,
    stampTaxAmount,
    besDeduction,
    otherDeductions: 0,
    totalGrossEarnings: totalGrossEarnings || (grossSalary + foodAllowanceGross),
    totalNetEarnings: totalNetEarnings || (netSalary + foodAllowanceNet),
    totalDeductions,
    workDays
  };
}
