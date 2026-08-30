import React, { useState } from 'react';
import { SalaryClaimRow, CaseSummary, RawPayrollRecord } from '../types/payroll';
import { formatTL } from '../utils/interestCalculator';
import { 
  TrendingUp, 
  PieChart, 
  Layers, 
  DollarSign, 
  Percent, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  BarChart2,
  Activity
} from 'lucide-react';

interface ChartsViewProps {
  rows: SalaryClaimRow[];
  summary: CaseSummary;
  rawRecords: RawPayrollRecord[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ rows, summary, rawRecords }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tax_analysis' | 'interest_growth'>('overview');

  // Key Analytics Calculations
  const grandTotal = summary.grandTotalClaim || 1;
  const wagePrincipalPct = ((summary.totalWagePrincipalUnpaid / grandTotal) * 100).toFixed(1);
  const interestPct = ((summary.totalWageInterest / grandTotal) * 100).toFixed(1);
  const severancePct = ((summary.totalSeveranceNet / grandTotal) * 100).toFixed(1);
  const leavePct = ((summary.totalLeaveNet / grandTotal) * 100).toFixed(1);
  const compPct = ((summary.totalOtherCompensations / grandTotal) * 100).toFixed(1);

  // Interest Yield Ratio
  const interestYield = summary.totalWagePrincipalUnpaid > 0
    ? ((summary.totalWageInterest / summary.totalWagePrincipalUnpaid) * 100).toFixed(1)
    : '0';

  // Average delay days for unpaid rows
  const unpaidRows = rows.filter(r => r.status === 'unpaid');
  const avgDelay = unpaidRows.length > 0
    ? Math.round(unpaidRows.reduce((sum, r) => sum + r.delayDays, 0) / unpaidRows.length)
    : 0;

  // Max interest month
  const maxInterestRow = [...rows].sort((a, b) => b.accruedInterest - a.accruedInterest)[0];

  // Max values for relative scaling
  const maxNetSalary = Math.max(...rows.map(r => r.netSalary), 75000);
  const maxTotalClaim = Math.max(...rows.map(r => r.totalClaim), 90000);
  const maxIncomeTax = Math.max(...rawRecords.map(r => r.incomeTaxAmount), 15000);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header & Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <Activity className="w-5 h-5 text-sky-600 shrink-0" />
              <span>GELİŞMİŞ BORDRO, VERGİ VE GECİKME FAİZİ ANALİZ PANELİ</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Maaş alacakları, vergi dilimi artış dinamikleri ve dönemsel faiz getirisinin finansal analitiği
            </p>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Portföy & Alacak Trendi
            </button>
            <button
              onClick={() => setActiveTab('interest_growth')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'interest_growth'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Aylık Faiz Yükü
            </button>
            <button
              onClick={() => setActiveTab('tax_analysis')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'tax_analysis'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vergi Dilimi Eğrisi
            </button>
          </div>
        </div>

        {/* Quick Analytical KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Faiz Verimi (Getiri Oranı):</span>
            <span className="text-base font-black text-rose-700 dark:text-rose-400 font-mono">%{interestYield}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Ortalama Gecikme Süresi:</span>
            <span className="text-base font-black text-amber-700 dark:text-amber-400 font-mono">{avgDelay} Gün</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">En Çok Faiz Biriken Ay:</span>
            <span className="text-base font-black text-indigo-700 dark:text-indigo-400 font-mono">{maxInterestRow?.period || '-'}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Ödenmeyen Maaş Sayısı:</span>
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">{unpaidRows.length} Ay</span>
          </div>
        </div>

      </div>

      {/* 2. Tab Contents */}

      {/* TAB 1: OVERVIEW & PORTFOLIO BREAKDOWN */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Portfolio Progress Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
                Dava Alacak Kalemlerinin Oransal Portföy Dağılımı
              </h3>
              <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400">
                Genel Toplam: {formatTL(summary.grandTotalClaim)}
              </span>
            </div>

            {/* Stacked Bar */}
            <div className="h-7 w-full rounded-md overflow-hidden flex bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner">
              <div style={{ width: `${wagePrincipalPct}%` }} className="bg-amber-500 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Maaş Anapara: ${wagePrincipalPct}%`}>
                {parseFloat(wagePrincipalPct) > 8 ? `${wagePrincipalPct}%` : ''}
              </div>
              <div style={{ width: `${interestPct}%` }} className="bg-rose-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Gecikme Faizi: ${interestPct}%`}>
                {parseFloat(interestPct) > 5 ? `${interestPct}%` : ''}
              </div>
              <div style={{ width: `${severancePct}%` }} className="bg-indigo-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Kıdem Tazminatı: ${severancePct}%`}>
                {parseFloat(severancePct) > 4 ? `${severancePct}%` : ''}
              </div>
              <div style={{ width: `${leavePct}%` }} className="bg-emerald-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Yıllık İzin: ${leavePct}%`}>
                {parseFloat(leavePct) > 3 ? `${leavePct}%` : ''}
              </div>
              <div style={{ width: `${compPct}%` }} className="bg-purple-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Manevi Tazminat: ${compPct}%`}>
                {parseFloat(compPct) > 8 ? `${compPct}%` : ''}
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Maaş Anapara</span>
                </div>
                <div className="font-mono font-black text-amber-800 dark:text-amber-300 text-sm">
                  {formatTL(summary.totalWagePrincipalUnpaid)}
                </div>
                <span className="text-[10px] text-slate-500">Portföy payı: %{wagePrincipalPct}</span>
              </div>

              <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Gecikme Faizi</span>
                </div>
                <div className="font-mono font-black text-rose-800 dark:text-rose-300 text-sm">
                  {formatTL(summary.totalWageInterest)}
                </div>
                <span className="text-[10px] text-slate-500">Portföy payı: %{interestPct}</span>
              </div>

              <div className="p-3 rounded bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Kıdem Tazminatı</span>
                </div>
                <div className="font-mono font-black text-indigo-800 dark:text-indigo-300 text-sm">
                  {formatTL(summary.totalSeveranceNet)}
                </div>
                <span className="text-[10px] text-slate-500">Portföy payı: %{severancePct}</span>
              </div>

              <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Yıllık İzin</span>
                </div>
                <div className="font-mono font-black text-emerald-800 dark:text-emerald-300 text-sm">
                  {formatTL(summary.totalLeaveNet)}
                </div>
                <span className="text-[10px] text-slate-500">Portföy payı: %{leavePct}</span>
              </div>

              <div className="p-3 rounded bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Manevi Tazminat</span>
                </div>
                <div className="font-mono font-black text-purple-800 dark:text-purple-300 text-sm">
                  {formatTL(summary.totalOtherCompensations)}
                </div>
                <span className="text-[10px] text-slate-500">Portföy payı: %{compPct}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MONTHLY INTEREST LOAD & SALARY COMPARISON */}
      {activeTab === 'interest_growth' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              Dönem Bazında Anapara ve Biriken Faiz Büyüme Grafiği
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Her dönemin net maaş anaparası (mavi) ve geçen sürede oluşan gecikme faizi (kırmızı)
            </p>
          </div>

          <div className="space-y-3">
            {rows.map((row) => {
              const salaryPct = (row.netSalary / maxTotalClaim) * 100;
              const interestPct = (row.accruedInterest / maxTotalClaim) * 100;

              return (
                <div key={row.id} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold w-28 text-slate-900 dark:text-white">{row.period}</span>
                      <span className="text-[11px] font-mono text-slate-500">({row.delayDays} gün gecikme - %{row.annualInterestRate})</span>
                    </div>
                    <div className="flex items-center space-x-3 text-right font-mono">
                      {row.status === 'unpaid' && (
                        <span className="text-sky-700 dark:text-sky-300">Maaş: {formatTL(row.netSalary, false)}</span>
                      )}
                      <span className="text-rose-700 dark:text-rose-400 font-bold">+ Faiz: {formatTL(row.accruedInterest, false)}</span>
                      <span className="text-slate-950 dark:text-white font-black">Toplam: {formatTL(row.totalClaim, false)}</span>
                    </div>
                  </div>

                  <div className="h-5 w-full rounded bg-slate-100 dark:bg-slate-800 flex overflow-hidden border border-slate-200 dark:border-slate-700">
                    {row.status === 'unpaid' && (
                      <div
                        style={{ width: `${salaryPct}%` }}
                        className="bg-sky-600 transition hover:opacity-90"
                        title={`Maaş: ${formatTL(row.netSalary)}`}
                      />
                    )}
                    <div
                      style={{ width: `${interestPct}%` }}
                      className="bg-rose-600 transition hover:opacity-90"
                      title={`Faiz: ${formatTL(row.accruedInterest)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TAX BRACKET CURVE & SGK BURDEN */}
      {activeTab === 'tax_analysis' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              Gelir Vergisi Dilimi Artış Eğrisi ve Yasal Kesinti Yükü
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aynı brüt kazançla (70.902 TL) kümülatif matrah artışı sebebiyle gelir vergisinin yükselişi ve net maaş erimesi
            </p>
          </div>

          {/* Visual Tax Progression Bars */}
          <div className="space-y-3">
            {rawRecords.map((rec) => {
              const taxPct = (rec.incomeTaxAmount / maxIncomeTax) * 100;
              const netPct = (rec.netSalary / maxNetSalary) * 100;

              return (
                <div key={rec.id} className="p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-1">
                    <span className="font-bold text-slate-900 dark:text-white">{rec.period}</span>
                    <div className="flex items-center space-x-4 font-mono text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Brüt: {formatTL(rec.grossSalary, false)}</span>
                      <span className="text-rose-700 dark:text-rose-400 font-bold">Gelir Vergisi: {formatTL(rec.incomeTaxAmount, false)}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">Net Maaş: {formatTL(rec.netSalary, false)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Gelir Vergisi Tutarı</span>
                      <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div style={{ width: `${taxPct}%` }} className="h-full bg-rose-600 transition" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Net Maaş Oranı</span>
                      <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div style={{ width: `${netPct}%` }} className="h-full bg-emerald-600 transition" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
