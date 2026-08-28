import React from 'react';
import { SalaryClaimRow, SeveranceClaim, AnnualLeaveClaim, CompensationItem, CaseSummary, RawPayrollRecord } from '../types/payroll';
import { formatTL, formatDateTR } from '../utils/interestCalculator';
import { Printer, Download, Scale, CheckCircle } from 'lucide-react';

interface CourtReportViewProps {
  rows: SalaryClaimRow[];
  severance: SeveranceClaim;
  annualLeave: AnnualLeaveClaim;
  compensations: CompensationItem[];
  summary: CaseSummary;
  calculationDate: string;
  globalInterestRate: number;
  rawRecord?: RawPayrollRecord;
}

export const CourtReportView: React.FC<CourtReportViewProps> = ({
  rows,
  severance,
  annualLeave,
  compensations,
  summary,
  calculationDate,
  globalInterestRate,
  rawRecord
}) => {
  const handlePrint = () => {
    window.print();
  };

  const employeeName = rawRecord?.employeeName || '[GİZLİ DAVACI / İŞÇİ]';
  const companyName = rawRecord?.companyName || '[GİZLİ DAVALI İŞVEREN A.Ş.]';
  const jobTitle = rawRecord?.jobTitle || 'BİYOMEDİKAL MÜHENDİSİ';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Action Bar (Hidden on print) */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Scale className="w-4 h-4 text-sky-500 shrink-0" />
            <span>Resmi Bilirkişi / Arabuluculuk Alacak & Faiz Hesap Raporu</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Mahkemeye veya arabulucuya sunulabilecek A4 formatında hazır resmi döküm.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Yazdır / PDF Kaydet</span>
        </button>
      </div>

      {/* Printable Report Page */}
      <div className="bg-white text-slate-900 p-4 sm:p-8 md:p-12 rounded-xl shadow-md border border-slate-200 print:border-none print:shadow-none print:p-0 font-serif leading-relaxed text-sm">
        
        {/* Report Header */}
        <div className="text-center pb-4 sm:pb-6 border-b-2 border-slate-900 space-y-1">
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase">
            İŞÇİLİK ALACAKLARI VE GECİKME FAİZİ HESAP BİLİRKİŞİ RAPORU
          </h2>
          <p className="text-[11px] sm:text-xs font-sans text-slate-600">
            (4857 Sayılı İş Kanunu m. 34, m. 59 ve 1475 Sayılı İş Kanunu m. 14 Hükümleri Uyarınca)
          </p>
        </div>

        {/* Parties & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4 text-xs font-sans border-b border-slate-300">
          <div className="space-y-1">
            <div><span className="font-bold">DAVACI (İŞÇİ):</span> {employeeName}</div>
            <div><span className="font-bold">GÖREVİ:</span> {jobTitle}</div>
            <div><span className="font-bold">İŞE GİRİŞ TARİHİ:</span> 04.08.2025</div>
            <div><span className="font-bold">İŞTEN ÇIKIŞ / FESİH:</span> {formatDateTR(severance.terminationDate)}</div>
          </div>
          <div className="space-y-1">
            <div><span className="font-bold">DAVALI (İŞVEREN):</span> {companyName}</div>
            <div><span className="font-bold">HESAPLAMA TARİHİ:</span> {formatDateTR(calculationDate)}</div>
            <div><span className="font-bold">HİZMET SÜRESİ:</span> {severance.serviceYears} Yıl {severance.serviceDays} Gün</div>
            <div><span className="font-bold">UYGULANAN FAİZ:</span> Yıllık %{globalInterestRate} (En Yüksek Mevduat Faizi)</div>
          </div>
        </div>

        {/* Section 1: Delayed Wage Claims */}
        <div className="pt-6 space-y-3">
          <h3 className="font-sans font-bold text-sm text-slate-900 uppercase">
            1. ÖDENMEYEN VE GECİKMELİ ÖDENEN MAAŞLAR FAİZ HESAP TABLOSU
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-sans border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-1.5 border border-slate-300">Dönem</th>
                  <th className="p-1.5 border border-slate-300 text-right">Bordro Net Maaş</th>
                  <th className="p-1.5 border border-slate-300 text-center">Muacceliyet</th>
                  <th className="p-1.5 border border-slate-300 text-center">Fiili Ödeme</th>
                  <th className="p-1.5 border border-slate-300 text-center">Gecikme</th>
                  <th className="p-1.5 border border-slate-300 text-center">Faiz Oranı</th>
                  <th className="p-1.5 border border-slate-300 text-right">İşleyen Faiz</th>
                  <th className="p-1.5 border border-slate-300 text-right font-black">Talep Edilen Toplam</th>
                  <th className="p-1.5 border border-slate-300">Durum / Not</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-200">
                    <td className="p-1.5 border border-slate-300 font-semibold">{r.period}</td>
                    <td className="p-1.5 border border-slate-300 text-right">{formatTL(r.netSalary, false)}</td>
                    <td className="p-1.5 border border-slate-300 text-center">{formatDateTR(r.dueDate)}</td>
                    <td className="p-1.5 border border-slate-300 text-center">{r.actualPaymentDate ? formatDateTR(r.actualPaymentDate) : '-'}</td>
                    <td className="p-1.5 border border-slate-300 text-center">{r.delayDays} gün</td>
                    <td className="p-1.5 border border-slate-300 text-center">%{r.annualInterestRate}</td>
                    <td className="p-1.5 border border-slate-300 text-right font-medium">{formatTL(r.accruedInterest, false)}</td>
                    <td className="p-1.5 border border-slate-300 text-right font-bold">{formatTL(r.totalClaim, false)}</td>
                    <td className="p-1.5 border border-slate-300 text-[10px] text-slate-600">{r.note}</td>
                  </tr>
                ))}
                
                {/* Total Wage Row */}
                <tr className="bg-slate-100 font-black border-t-2 border-slate-800 text-xs">
                  <td className="p-1.5 border border-slate-300">TOPLAM ÜCRET ALACAĞI</td>
                  <td className="p-1.5 border border-slate-300 text-right">{formatTL(summary.totalWagePrincipalUnpaid, false)}</td>
                  <td className="p-1.5 border border-slate-300 text-center">-</td>
                  <td className="p-1.5 border border-slate-300 text-center">-</td>
                  <td className="p-1.5 border border-slate-300 text-center">-</td>
                  <td className="p-1.5 border border-slate-300 text-center">-</td>
                  <td className="p-1.5 border border-slate-300 text-right">{formatTL(summary.totalWageInterest, false)}</td>
                  <td className="p-1.5 border border-slate-300 text-right font-black">{formatTL(summary.totalWageClaims, false)}</td>
                  <td className="p-1.5 border border-slate-300 text-[10px]">11 Ay Maaş + Ağustos Faiz Farkı</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Severance & Leave & Compensation Claims */}
        <div className="pt-6 space-y-3 page-break">
          <h3 className="font-sans font-bold text-sm text-slate-900 uppercase">
            2. TAZMİNAT VE DİĞER İŞÇİLİK HAKLARI HESABI
          </h3>

          <div className="space-y-3 text-xs font-sans">
            {severance.enabled && (
              <div className="p-3 border border-slate-300 rounded bg-slate-50 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>A) Kıdem Tazminatı Alacağı:</span>
                  <span>{formatTL(severance.netSeverance)}</span>
                </div>
                <p className="text-slate-600">
                  Davacı işçinin 04.08.2025 - {formatDateTR(severance.terminationDate)} tarihleri arasındaki hizmet süresi {severance.serviceYears} Yıl {severance.serviceDays} Gün olup; son aylık çıplak brüt ücreti {formatTL(severance.baseGross)} ve nakdi yemek yardımı brütü {formatTL(severance.fringeGross)} eklenerek bulunan Giydirilmiş Brüt Ücret {formatTL(severance.clothedGross)} üzerinden hesaplanmıştır.
                </p>
                <div className="text-[11px] text-slate-700 font-mono">
                  [Brüt Kıdem: {formatTL(severance.grossSeverance)}] - [%0,759 Damga Vergisi: {formatTL(severance.stampTax)}] = <strong>Net Kıdem: {formatTL(severance.netSeverance)}</strong>
                </div>
              </div>
            )}

            {annualLeave.enabled && (
              <div className="p-3 border border-slate-300 rounded bg-slate-50 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>B) Yıllık İzin Ücreti Alacağı:</span>
                  <span>{formatTL(annualLeave.netAmount)}</span>
                </div>
                <p className="text-slate-600">
                  Davacının hak kazandığı ancak kullandırılmayan {annualLeave.leaveDays} günlük yıllık ücretli izin hakkı, son çıplak brüt ücret ({formatTL(annualLeave.nakedGross)}) üzerinden yasal SGK ve vergi kesintileri yapılarak netleştirilmiştir.
                </p>
                <div className="text-[11px] text-slate-700 font-mono">
                  [Brüt İzin: {formatTL(annualLeave.grossAmount)}] - [SGK + Vergi: {formatTL(annualLeave.sgkCut + annualLeave.incomeTaxCut + annualLeave.stampTaxCut)}] = <strong>Net İzin: {formatTL(annualLeave.netAmount)}</strong>
                </div>
              </div>
            )}

            {compensations.filter(c => c.enabled).map((c, idx) => (
              <div key={c.id} className="p-3 border border-slate-300 rounded bg-slate-50 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>{String.fromCharCode(67 + idx)}) {c.title}:</span>
                  <span>{formatTL(c.calculatedAmount)}</span>
                </div>
                <p className="text-slate-600">
                  {c.note} ({c.basis === 'multiple_of_gross' ? `${c.multiplier} Aylık Brüt Maaş Karşılığı: ${c.multiplier} x ${formatTL(severance.baseGross)}` : 'Sabit Tutar Talebi'})
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Genel Dava İcmali */}
        <div className="pt-6 space-y-3">
          <h3 className="font-sans font-bold text-sm text-slate-900 uppercase">
            3. GENEL DAVA İCMALİ VE TALEP SONUCU
          </h3>

          <table className="w-full text-left text-xs font-sans border border-slate-400 border-collapse">
            <thead className="bg-slate-200 font-bold">
              <tr>
                <th className="p-2 border border-slate-300">Alacak Kalemi</th>
                <th className="p-2 border border-slate-300 text-right">Anapara Tutarı (TL)</th>
                <th className="p-2 border border-slate-300 text-right">İşleyen Faiz (TL)</th>
                <th className="p-2 border border-slate-300 text-right font-black">Toplam Talep (TL)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 font-semibold">1. Ücret Alacakları ve Faiz Farkları</td>
                <td className="p-2 border border-slate-300 text-right">{formatTL(summary.totalWagePrincipalUnpaid, false)}</td>
                <td className="p-2 border border-slate-300 text-right font-medium text-rose-600">{formatTL(summary.totalWageInterest, false)}</td>
                <td className="p-2 border border-slate-300 text-right font-bold">{formatTL(summary.totalWageClaims, false)}</td>
              </tr>
              {severance.enabled && (
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">2. Kıdem Tazminatı (Net)</td>
                  <td className="p-2 border border-slate-300 text-right">{formatTL(severance.netSeverance, false)}</td>
                  <td className="p-2 border border-slate-300 text-right text-slate-400">-</td>
                  <td className="p-2 border border-slate-300 text-right font-bold">{formatTL(severance.netSeverance, false)}</td>
                </tr>
              )}
              {annualLeave.enabled && (
                <tr>
                  <td className="p-2 border border-slate-300 font-semibold">3. Yıllık İzin Ücreti (Net)</td>
                  <td className="p-2 border border-slate-300 text-right">{formatTL(annualLeave.netAmount, false)}</td>
                  <td className="p-2 border border-slate-300 text-right text-slate-400">-</td>
                  <td className="p-2 border border-slate-300 text-right font-bold">{formatTL(annualLeave.netAmount, false)}</td>
                </tr>
              )}
              {compensations.filter(c => c.enabled).map((c, i) => (
                <tr key={c.id}>
                  <td className="p-2 border border-slate-300 font-semibold">{4 + i}. {c.title}</td>
                  <td className="p-2 border border-slate-300 text-right">{formatTL(c.calculatedAmount, false)}</td>
                  <td className="p-2 border border-slate-300 text-right text-slate-400">-</td>
                  <td className="p-2 border border-slate-300 text-right font-bold">{formatTL(c.calculatedAmount, false)}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-900">
                <td className="p-3 border border-slate-400">GENEL DAVA TOPLAMI</td>
                <td className="p-3 border border-slate-400 text-right">
                  {formatTL(
                    summary.totalWagePrincipalUnpaid + summary.totalSeveranceNet + summary.totalLeaveNet + summary.totalOtherCompensations, 
                    false
                  )}
                </td>
                <td className="p-3 border border-slate-400 text-right text-rose-700">{formatTL(summary.totalWageInterest, false)}</td>
                <td className="p-3 border border-slate-400 text-right text-base text-slate-950">
                  {formatTL(summary.grandTotalClaim, false)} TL
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Box */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs font-sans">
          <div>
            <p className="font-bold">Hesaplayan / Davacı Vekili</p>
            <p className="mt-8">İmza</p>
          </div>
          <div>
            <p className="font-bold">Rapor Tarihi</p>
            <p className="mt-8">{formatDateTR(calculationDate)}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
