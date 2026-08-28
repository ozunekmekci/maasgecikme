import React, { useState } from 'react';
import { SalaryClaimRow, CaseSummary, RawPayrollRecord } from '../types/payroll';
import { formatTL } from '../utils/interestCalculator';
import { BarChart, TrendingUp, PieChart, Layers, ArrowUpRight, DollarSign } from 'lucide-react';

interface ChartsViewProps {
  rows: SalaryClaimRow[];
  summary: CaseSummary;
  rawRecords: RawPayrollRecord[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ rows, summary, rawRecords }) => {
  const [activeChart, setActiveChart] = useState<'claims' | 'salary_trend' | 'tax_breakdown'>('claims');

  // Max values for relative scaling
  const maxNetSalary = Math.max(...rows.map(r => r.netSalary), 70000);
  const maxClaim = Math.max(...rows.map(r => r.totalClaim), 85000);

  // Claim category breakdown percentages
  const grandTotal = summary.grandTotalClaim || 1;
  const wagePrincipalPct = ((summary.totalWagePrincipalUnpaid / grandTotal) * 100).toFixed(1);
  const interestPct = ((summary.totalWageInterest / grandTotal) * 100).toFixed(1);
  const severancePct = ((summary.totalSeveranceNet / grandTotal) * 100).toFixed(1);
  const leavePct = ((summary.totalLeaveNet / grandTotal) * 100).toFixed(1);
  const compPct = ((summary.totalOtherCompensations / grandTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Chart Selector Tabs */}
      <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveChart('claims')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
            activeChart === 'claims'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Dava Kalemleri Dağılımı</span>
        </button>

        <button
          onClick={() => setActiveChart('salary_trend')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
            activeChart === 'salary_trend'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Aylık Faiz & Alacak Trendi</span>
        </button>

        <button
          onClick={() => setActiveChart('tax_breakdown')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
            activeChart === 'tax_breakdown'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Vergi & SGK Kesinti Trendi</span>
        </button>
      </div>

      {/* 1. DAVA KALEMLERİ DAĞILIMI */}
      {activeChart === 'claims' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Progress Bars Breakdown */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Toplam Talep Portföyü Analizi</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Genel Toplam: {formatTL(summary.grandTotalClaim)}
              </span>
            </h3>

            {/* Stacked Progress Bar */}
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 dark:bg-slate-800 shadow-inner">
              <div style={{ width: `${wagePrincipalPct}%` }} className="bg-amber-500 hover:opacity-90 transition" title={`Ödenmeyen Maaş: ${wagePrincipalPct}%`} />
              <div style={{ width: `${interestPct}%` }} className="bg-rose-500 hover:opacity-90 transition" title={`İşleyen Faiz: ${interestPct}%`} />
              <div style={{ width: `${severancePct}%` }} className="bg-indigo-600 hover:opacity-90 transition" title={`Kıdem Tazminatı: ${severancePct}%`} />
              <div style={{ width: `${leavePct}%` }} className="bg-emerald-500 hover:opacity-90 transition" title={`Yıllık İzin: ${leavePct}%`} />
              <div style={{ width: `${compPct}%` }} className="bg-purple-600 hover:opacity-90 transition" title={`Manevi Tazminat: ${compPct}%`} />
            </div>

            {/* Legend and Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Ödenmeyen Maaşlar</span>
                </div>
                <div className="text-right font-bold text-amber-700 dark:text-amber-400">
                  {formatTL(summary.totalWagePrincipalUnpaid)} ({wagePrincipalPct}%)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Gecikme Faizleri</span>
                </div>
                <div className="text-right font-bold text-rose-700 dark:text-rose-400">
                  {formatTL(summary.totalWageInterest)} ({interestPct}%)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Kıdem Tazminatı</span>
                </div>
                <div className="text-right font-bold text-indigo-700 dark:text-indigo-400">
                  {formatTL(summary.totalSeveranceNet)} ({severancePct}%)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Yıllık İzin Alacağı</span>
                </div>
                <div className="text-right font-bold text-emerald-700 dark:text-emerald-400">
                  {formatTL(summary.totalLeaveNet)} ({leavePct}%)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 sm:col-span-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Manevi & Ek Tazminatlar</span>
                </div>
                <div className="text-right font-bold text-purple-700 dark:text-purple-400">
                  {formatTL(summary.totalOtherCompensations)} ({compPct}%)
                </div>
              </div>

            </div>
          </div>

          {/* Quick Legal Key Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Yasal & İcra Notları
            </h3>
            
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Mevduat En Yüksek Faiz Talebi</span>
              <p className="text-slate-500 dark:text-slate-400">
                4857 Sayılı Kanun m.34 gereğince, ücret alacaklarına uygulanacak faiz mevduata uygulanan en yüksek faizdir.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Ödenen Ağustos Maaşı Faiz Farkı</span>
              <p className="text-slate-500 dark:text-slate-400">
                05.09.2025 muacceliyet tarihli maaş 05.01.2026'da (122 gün gecikmeyle) ödendiği için anapara ödenmiş sayılmış, sadece 7.855,34 TL faiz farkı talep edilmiştir.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 2. AYLIK FAİZ & ALACAK TRENDİ */}
      {activeChart === 'salary_trend' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Aylık Net Maaş ve İşleyen Gecikme Faizi Gelişimi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Her ay için anapara (mavi) ve biriken gecikme faizi (kırmızı) dağılımı
            </p>
          </div>

          <div className="space-y-3">
            {rows.map((row) => {
              const salaryWidth = Math.min(100, (row.netSalary / maxClaim) * 100);
              const interestWidth = Math.min(100, (row.accruedInterest / maxClaim) * 100);

              return (
                <div key={row.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-28 font-bold">{row.period}</span>
                    <div className="flex items-center space-x-3 text-right">
                      {row.status === 'unpaid' && (
                        <span className="text-sky-600 dark:text-sky-400">Maaş: {formatTL(row.netSalary, false)}</span>
                      )}
                      <span className="text-rose-600 dark:text-rose-400 font-bold">+ Faiz: {formatTL(row.accruedInterest, false)}</span>
                      <span className="text-slate-900 dark:text-white font-extrabold w-28">Toplam: {formatTL(row.totalClaim, false)}</span>
                    </div>
                  </div>

                  <div className="h-4 w-full rounded-lg bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                    {row.status === 'unpaid' && (
                      <div
                        style={{ width: `${salaryWidth}%` }}
                        className="bg-sky-500 hover:bg-sky-400 transition"
                      />
                    )}
                    <div
                      style={{ width: `${interestWidth}%` }}
                      className="bg-rose-500 hover:bg-rose-400 transition"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VERGİ & SGK KESİNTİ TRENDİ */}
      {activeChart === 'tax_breakdown' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bordro Kesinti Analizi (Gelir Vergisi & SGK Kesintileri)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Yıl içindeki gelir vergisi dilimi artışı ve yasal kesintiler
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Dönem</th>
                  <th className="py-2.5 px-3 text-right">Brüt Kazanç</th>
                  <th className="py-2.5 px-3 text-right">Net Maaş</th>
                  <th className="py-2.5 px-3 text-right">Gelir Vergisi</th>
                  <th className="py-2.5 px-3 text-right">SGK İşçi</th>
                  <th className="py-2.5 px-3 text-right">Yemek Yardımı</th>
                  <th className="py-2.5 px-3 text-right">Toplam Kesinti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rawRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{rec.period}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{formatTL(rec.grossSalary, false)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatTL(rec.netSalary, false)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">{formatTL(rec.incomeTaxAmount, false)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">{formatTL(rec.sgkWorkerDeduction, false)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-sky-600 dark:text-sky-400">{formatTL(rec.foodAllowanceNet, false)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-rose-700 dark:text-rose-300">{formatTL(rec.totalDeductions, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
