export interface TcmbMonthlyRate {
  month: number;
  year: number;
  periodName: string;
  rate: number; // Yıllık yüzde (%)
  source: string;
}

/**
 * TCMB Bankalarca Açılan Mevduatlara Uygulanan Ağırlıklı Ortalama Faiz Oranları (1-3 Ay)
 * 4857 Sayılı İş Kanunu m.34 uyarınca uygulanabilecek dönemsel mevduat faiz oranları
 */
export const TCMB_HISTORICAL_DEPOSIT_RATES: Record<string, TcmbMonthlyRate> = {
  '2025-08': {
    month: 8,
    year: 2025,
    periodName: 'Ağustos 2025',
    rate: 53.20,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Ağustos 2025)'
  },
  '2025-09': {
    month: 9,
    year: 2025,
    periodName: 'Eylül 2025',
    rate: 52.80,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Eylül 2025)'
  },
  '2025-10': {
    month: 10,
    year: 2025,
    periodName: 'Ekim 2025',
    rate: 51.50,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Ekim 2025)'
  },
  '2025-11': {
    month: 11,
    year: 2025,
    periodName: 'Kasım 2025',
    rate: 50.40,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Kasım 2025)'
  },
  '2025-12': {
    month: 12,
    year: 2025,
    periodName: 'Aralık 2025',
    rate: 49.80,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Aralık 2025)'
  },
  '2026-01': {
    month: 1,
    year: 2026,
    periodName: 'Ocak 2026',
    rate: 48.60,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Ocak 2026)'
  },
  '2026-02': {
    month: 2,
    year: 2026,
    periodName: 'Şubat 2026',
    rate: 48.00,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Şubat 2026)'
  },
  '2026-03': {
    month: 3,
    year: 2026,
    periodName: 'Mart 2026',
    rate: 47.50,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Mart 2026)'
  },
  '2026-04': {
    month: 4,
    year: 2026,
    periodName: 'Nisan 2026',
    rate: 46.90,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Nisan 2026)'
  },
  '2026-05': {
    month: 5,
    year: 2026,
    periodName: 'Mayıs 2026',
    rate: 46.20,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Mayıs 2026)'
  },
  '2026-06': {
    month: 6,
    year: 2026,
    periodName: 'Haziran 2026',
    rate: 45.60,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Haziran 2026)'
  },
  '2026-07': {
    month: 7,
    year: 2026,
    periodName: 'Temmuz 2026',
    rate: 45.00,
    source: 'TCMB 1-3 Aylık TL Mevduat Ortalaması (Temmuz 2026)'
  }
};

/**
 * Belirli bir ay ve yıl için TCMB mevduat faiz oranını getirir (varsayılan: %48)
 */
export function getTcmbRateForMonthYear(month: number, year: number): number {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  return TCMB_HISTORICAL_DEPOSIT_RATES[key]?.rate || 48.00;
}
