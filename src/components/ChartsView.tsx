import React, { useState } from 'react';
import { SalaryClaimRow, CaseSummary, RawPayrollRecord } from '../types/payroll';
import { formatTL, formatDateTR } from '../utils/interestCalculator';
import { getTcmbRateForMonthYear } from '../data/tcmbRates';
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
  Activity,
  Zap,
  Sliders,
  Scale,
  Flame,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface ChartsViewProps {
  rows: SalaryClaimRow[];
  summary: CaseSummary;
  rawRecords: RawPayrollRecord[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ rows, summary, rawRecords }) => {
  const [activeTab, setActiveTab] = useState<'cumulative' | 'scenarios' | 'tax_anatomy' | 'heatmap'>('cumulative');
  const [simulationRate, setSimulationRate] = useState<number>(48);

  // Key Analytics Calculations
  const grandTotal = summary.grandTotalClaim || 1;
  const wagePrincipal = summary.totalWagePrincipalUnpaid;
  const interestTotal = summary.totalWageInterest;
  
  const wagePrincipalPct = ((wagePrincipal / grandTotal) * 100).toFixed(1);
  const interestPct = ((interestTotal / grandTotal) * 100).toFixed(1);
  const severancePct = ((summary.totalSeveranceNet / grandTotal) * 100).toFixed(1);
  const leavePct = ((summary.totalLeaveNet / grandTotal) * 100).toFixed(1);
  const compPct = ((summary.totalOtherCompensations / grandTotal) * 100).toFixed(1);

  // Interest Yield
  const interestYield = wagePrincipal > 0
    ? ((interestTotal / wagePrincipal) * 100).toFixed(1)
    : '0';

  // Daily Accruing Interest Speed (TL/Gün)
  const dailyInterestSpeed = rows
    .filter(r => r.status === 'unpaid')
    .reduce((sum, r) => sum + (r.netSalary * (r.annualInterestRate / 100) / 365), 0);

  // Unpaid rows & delay stats
  const unpaidRows = rows.filter(r => r.status === 'unpaid');
  const avgDelay = unpaidRows.length > 0
    ? Math.round(unpaidRows.reduce((sum, r) => sum + r.delayDays, 0) / unpaidRows.length)
    : 0;
  const maxDelayRow = [...unpaidRows].sort((a, b) => b.delayDays - a.delayDays)[0];
  const maxInterestRow = [...rows].sort((a, b) => b.accruedInterest - a.accruedInterest)[0];

  // Cumulative Progression Data
  let cumSalary = 0;
  let cumInterest = 0;
  const cumulativeData = rows.map((r) => {
    if (r.status === 'unpaid') cumSalary += r.netSalary;
    cumInterest += r.accruedInterest;
    return {
      period: r.period,
      monthlySalary: r.netSalary,
      monthlyInterest: r.accruedInterest,
      cumSalary,
      cumInterest,
      cumTotal: cumSalary + cumInterest,
      delayDays: r.delayDays,
      status: r.status
    };
  });

  const maxCumTotal = cumulativeData[cumulativeData.length - 1]?.cumTotal || 800000;

  // 12 Months Deductions Totals
  const totalGrossSum = rawRecords.reduce((sum, r) => sum + (r.grossSalary || 0), 0);
  const totalNetSum = rawRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
  const totalIncomeTaxSum = rawRecords.reduce((sum, r) => sum + (r.incomeTaxAmount || 0), 0);
  const totalSgkWorkerSum = rawRecords.reduce((sum, r) => sum + (r.sgkWorkerDeduction || 0) + (r.sgkUnemploymentDeduction || 0), 0);
  const totalStampTaxSum = rawRecords.reduce((sum, r) => sum + (r.stampTaxAmount || 0), 0);
  const totalFoodAllowanceSum = rawRecords.reduce((sum, r) => sum + (r.foodAllowanceGross || 0), 0);

  // Scenarios Simulation
  const calcScenario = (rate: number) => {
    let simInterest = 0;
    rows.forEach(r => {
      if (r.status === 'unpaid') {
        simInterest += (r.netSalary * (rate / 100) * r.delayDays) / 365;
      } else if (r.status === 'paid' && r.actualPaymentDate) {
        simInterest += (r.netSalary * (rate / 100) * r.delayDays) / 365;
      }
    });
    return simInterest;
  };

  const legalInterest = calcScenario(24);
  const mevduat48 = calcScenario(48);
  const mevduat50 = calcScenario(50);
  const customSimInterest = calcScenario(simulationRate);

  // TCMB Gradual Interest Total
  const tcmbGradualTotal = rows.reduce((sum, r) => {
    const tRate = getTcmbRateForMonthYear(r.month, r.year);
    return sum + ((r.netSalary * (tRate / 100) * r.delayDays) / 365);
  }, 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Card & Sub-navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <Activity className="w-5 h-5 text-sky-600 shrink-0" />
              <span>GELİŞMİŞ BORDRO, VERGİ VE GECİKME FAİZİ ANALİZ PANELİ</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Kümülatif alacak büyümesi, dönemsel faiz simülasyonları, bordro kesinti anatomisi ve gecikme ısı matrisi
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('cumulative')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'cumulative'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Kümülatif Büyüme</span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'scenarios'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Faiz Senaryoları</span>
            </button>

            <button
              onClick={() => setActiveTab('tax_anatomy')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'tax_anatomy'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-indigo-500" />
              <span>Bordro Anatomisi</span>
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'heatmap'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Gecikme Isı Matrisi</span>
            </button>
          </div>
        </div>

        {/* 4 Key Analytics Performance Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>Günlük İşleyen Faiz Hızı:</span>
              <Clock className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-base font-black text-rose-700 dark:text-rose-400 font-mono">
              +{formatTL(dailyInterestSpeed)} / Gün
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Her gün alacağa eklenen faiz</span>
          </div>

          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>Faiz / Anapara Verimi:</span>
              <Percent className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-base font-black text-amber-700 dark:text-amber-400 font-mono">
              %{interestYield}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Maaş anaparasının faiz karşılığı</span>
          </div>

          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>Ortalama Gecikme Süresi:</span>
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">
              {avgDelay} Gün ({unpaidRows.length} Ay Ödenmedi)
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">En eski: {maxDelayRow?.period} ({maxDelayRow?.delayDays} gün)</span>
          </div>

          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>En Yüksek Faiz Biriken Ay:</span>
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-base font-black text-indigo-700 dark:text-indigo-400 font-mono">
              {maxInterestRow?.period} ({formatTL(maxInterestRow?.accruedInterest || 0)})
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">329 Günlük birikim</span>
          </div>
        </div>

      </div>

      {/* 2. Tab Contents */}

      {/* TAB 1: KÜMÜLATİF BÜYÜME VE PORTFÖY DAĞILIMI */}
      {activeTab === 'cumulative' && (
        <div className="space-y-6">
          
          {/* Portfolio Breakdown Stacked Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
                Dava Alacak Portföyünün Bütçesel Dağılımı
              </h3>
              <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400">
                Genel Dava İcmali: {formatTL(summary.grandTotalClaim)}
              </span>
            </div>

            {/* Stacked Percentage Bar */}
            <div className="h-8 w-full rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner">
              <div style={{ width: `${wagePrincipalPct}%` }} className="bg-amber-500 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Maaş Anapara: ${wagePrincipalPct}%`}>
                {parseFloat(wagePrincipalPct) > 8 ? `Maaş %${wagePrincipalPct}` : ''}
              </div>
              <div style={{ width: `${interestPct}%` }} className="bg-rose-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Gecikme Faizi: ${interestPct}%`}>
                {parseFloat(interestPct) > 6 ? `Faiz %${interestPct}` : ''}
              </div>
              <div style={{ width: `${severancePct}%` }} className="bg-indigo-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Kıdem: ${severancePct}%`}>
                {parseFloat(severancePct) > 4 ? `Kıdem %${severancePct}` : ''}
              </div>
              <div style={{ width: `${leavePct}%` }} className="bg-emerald-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`İzin: ${leavePct}%`}>
                {parseFloat(leavePct) > 3 ? `İzin` : ''}
              </div>
              <div style={{ width: `${compPct}%` }} className="bg-purple-600 hover:opacity-90 transition flex items-center justify-center text-[10px] text-white font-bold" title={`Manevi: ${compPct}%`}>
                {parseFloat(compPct) > 8 ? `Manevi %${compPct}` : ''}
              </div>
            </div>

            {/* 5 Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Maaş Anapara</span>
                </div>
                <div className="font-mono font-black text-amber-800 dark:text-amber-300 text-sm">
                  {formatTL(summary.totalWagePrincipalUnpaid)}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Toplam pay: %{wagePrincipalPct}</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Gecikme Faizi</span>
                </div>
                <div className="font-mono font-black text-rose-800 dark:text-rose-300 text-sm">
                  {formatTL(summary.totalWageInterest)}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Toplam pay: %{interestPct}</span>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Kıdem Tazminatı</span>
                </div>
                <div className="font-mono font-black text-indigo-800 dark:text-indigo-300 text-sm">
                  {formatTL(summary.totalSeveranceNet)}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Toplam pay: %{severancePct}</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Yıllık İzin</span>
                </div>
                <div className="font-mono font-black text-emerald-800 dark:text-emerald-300 text-sm">
                  {formatTL(summary.totalLeaveNet)}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Toplam pay: %{leavePct}</span>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Manevi Tazminat</span>
                </div>
                <div className="font-mono font-black text-purple-800 dark:text-purple-300 text-sm">
                  {formatTL(summary.totalOtherCompensations)}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Toplam pay: %{compPct}</span>
              </div>
            </div>
          </div>

          {/* Cumulative Step Progression Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
                  Aydan Aya Kümülatif Alacak & Faiz Büyüme Eğrisi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Her ay ödenmeyen maaşların birikimi ve üzerine eklenen kümülatif gecikme faizi
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400">
                Son Kümülatif: {formatTL(cumulativeData[cumulativeData.length - 1]?.cumTotal || 0)}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {cumulativeData.map((d, index) => {
                const salaryWidth = (d.cumSalary / maxCumTotal) * 100;
                const interestWidth = (d.cumInterest / maxCumTotal) * 100;

                return (
                  <div key={d.period} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 text-[11px] font-mono text-slate-400">{index + 1}.</span>
                        <span className="font-bold w-28 text-slate-900 dark:text-white">{d.period}</span>
                        {d.status === 'paid' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Ödendi (Faiz Farkı)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-right font-mono text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400">Anapara: {formatTL(d.cumSalary, false)}</span>
                        <span className="text-rose-700 dark:text-rose-400 font-bold">+ Faiz: {formatTL(d.cumInterest, false)}</span>
                        <span className="text-slate-950 dark:text-white font-black text-xs">Kümülatif: {formatTL(d.cumTotal, false)}</span>
                      </div>
                    </div>

                    <div className="h-5 w-full rounded bg-slate-100 dark:bg-slate-800 flex overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        style={{ width: `${salaryWidth}%` }}
                        className="bg-amber-500 transition-all hover:opacity-90"
                        title={`Kümülatif Maaş: ${formatTL(d.cumSalary)}`}
                      />
                      <div
                        style={{ width: `${interestWidth}%` }}
                        className="bg-rose-600 transition-all hover:opacity-90"
                        title={`Kümülatif Faiz: ${formatTL(d.cumInterest)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: FAİZ SENARYO DUYARLILIK ANALİZİ */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Farklı Faiz Oranları & Yasal Karşılaştırma Matrisi</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Yasal Faiz (%24), En Yüksek Mevduat (%48), TCMB Kademeli Faiz ve Özel Simülasyon Oranının karşılaştırması
              </p>
            </div>

            {/* Interactive Simulation Slider */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-sky-600" />
                  <span>Özel Faiz Oranı Simülatörü:</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-black text-sm text-rose-700 dark:text-rose-400">%{simulationRate}</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    → Toplam Faiz: {formatTL(customSimInterest)}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="80"
                step="0.5"
                value={simulationRate}
                onChange={(e) => setSimulationRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>%10 (Düşük)</span>
                <span>%24 (Yasal Faiz)</span>
                <span>%48 (Mevduat)</span>
                <span>%60 (Ticari Avans)</span>
                <span>%80 (Maksimum)</span>
              </div>
            </div>

            {/* 4-Column Scenario Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              
              {/* Senaryo 1: Yasal Faiz */}
              <div className="p-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  1. YASAL FAİZ (3095 s.K.)
                </span>
                <div className="text-lg font-black text-slate-700 dark:text-slate-300 font-mono">
                  {formatTL(legalInterest)}
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>Yıllık Oran:</span>
                    <span className="font-bold">%24,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Alacak:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTL(wagePrincipal + legalInterest)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  *İş Kanunu m.34 mevduat faizinden mahrum kalınan senaryo (Kayba yol açar).
                </p>
              </div>

              {/* Senaryo 2: Varsayılan %48 */}
              <div className="p-4 rounded-lg border-2 border-slate-900 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 block">
                  2. MEVDUAT FAİZİ (VARSAYILAN %48)
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {formatTL(mevduat48)}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>Yıllık Oran:</span>
                    <span className="font-bold">%48,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Alacak:</span>
                    <span className="font-bold text-sky-700 dark:text-sky-300">{formatTL(wagePrincipal + mevduat48)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  ✓ Yasal faize göre +{formatTL(mevduat48 - legalInterest)} daha avantajlı.
                </p>
              </div>

              {/* Senaryo 3: TCMB Kademeli Oranlar */}
              <div className="p-4 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                  3. TCMB DÖNEMSEL KADEMELİ FAİZ
                </span>
                <div className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono">
                  {formatTL(tcmbGradualTotal)}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-rose-200 dark:border-rose-900">
                  <div className="flex justify-between">
                    <span>Ortalama Oran:</span>
                    <span className="font-bold">~%49,30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Alacak:</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">{formatTL(wagePrincipal + tcmbGradualTotal)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                  ★ Resmi TCMB 1-3 aylık mevduat ortalamaları ile tam uyumlu.
                </p>
              </div>

              {/* Senaryo 4: Özel Simülasyon */}
              <div className="p-4 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block">
                  4. ÖZEL SİMÜLASYON (%{simulationRate})
                </span>
                <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
                  {formatTL(customSimInterest)}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-indigo-200 dark:border-indigo-900">
                  <div className="flex justify-between">
                    <span>Seçilen Oran:</span>
                    <span className="font-bold">%{simulationRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Alacak:</span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">{formatTL(wagePrincipal + customSimInterest)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Faiz farkı: {customSimInterest >= mevduat48 ? '+' : ''}{formatTL(customSimInterest - mevduat48)}
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 3: BORDRO KESİNTİ ANATOMİSİ & VERGİ DİLİMİ EĞRİSİ */}
      {activeTab === 'tax_anatomy' && (
        <div className="space-y-6">
          
          {/* Total 12-Month Deductions Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
                12 Aylık Toplam Bordro Kazanç ve Yasal Kesinti Anatomisi
              </h3>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                Toplam Brüt Kazanç: {formatTL(totalGrossSum)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Toplam Net Maaş Hakedişi:</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">{formatTL(totalNetSum)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">%{(totalNetSum / totalGrossSum * 100).toFixed(1)} net ele geçen</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Toplam Gelir Vergisi Kesintisi:</span>
                <span className="text-base font-black text-rose-700 dark:text-rose-400 font-mono">{formatTL(totalIncomeTaxSum)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">%{(totalIncomeTaxSum / totalGrossSum * 100).toFixed(1)} vergi payı</span>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Toplam SGK İşçi Payı (%15):</span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-400 font-mono">{formatTL(totalSgkWorkerSum)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">%14 SGK + %1 İşsizlik</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Damga Vergisi & Yemek:</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
                  {formatTL(totalStampTaxSum + totalFoodAllowanceSum)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Yemek: {formatTL(totalFoodAllowanceSum)}</span>
              </div>
            </div>
          </div>

          {/* Month by Month Tax Bracket Curve */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
                Dönemsel Gelir Vergisi Dilimi Tırmanışı (%15 → %20 → %27)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Brüt kazanç aynı kalmasına rağmen kümülatif gelir vergisi matrahı yükseldikçe vergi miktarı 5.764 TL'den 11.345 TL'ye çıkar ve net maaş erir.
              </p>
            </div>

            <div className="space-y-2.5">
              {rawRecords.map((rec) => {
                const taxBracket = rec.incomeTaxAmount > 10000 ? '%27 Dilim' : rec.incomeTaxAmount > 7000 ? '%20 Dilim' : '%15 Dilim';
                const taxBracketColor = rec.incomeTaxAmount > 10000 
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' 
                  : rec.incomeTaxAmount > 7000
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';

                return (
                  <div key={rec.id} className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold w-28 text-slate-900 dark:text-white">{rec.period}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${taxBracketColor}`}>
                        {taxBracket}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 font-mono text-[11px]">
                      <span className="text-slate-500">Brüt: {formatTL(rec.grossSalary, false)}</span>
                      <span className="text-rose-700 dark:text-rose-400 font-bold">Vergi: {formatTL(rec.incomeTaxAmount, false)}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black text-xs">Net: {formatTL(rec.netSalary, false)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: GECİKME ISI MATRİSİ */}
      {activeTab === 'heatmap' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif flex items-center space-x-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Dönemsel Gecikme Günü ve Faiz Şiddeti Isı Matrisi</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kırmızı/koyu tonlar en yüksek gecikme ve en yüksek faiz biriken dönemleri gösterir
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((row) => {
              const isPaid = row.status === 'paid';
              const heatIntensity = isPaid 
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                : row.delayDays > 250
                  ? 'border-rose-400 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 ring-1 ring-rose-300 dark:ring-rose-900'
                  : row.delayDays > 150
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40';

              const badgeColor = isPaid 
                ? 'bg-emerald-600 text-white'
                : row.delayDays > 250 
                  ? 'bg-rose-700 text-white' 
                  : 'bg-amber-600 text-white';

              return (
                <div key={row.id} className={`p-3.5 rounded-lg border ${heatIntensity} space-y-2 text-xs transition-all hover:shadow-sm`}>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{row.period}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${badgeColor}`}>
                      {isPaid ? 'Ödendi' : `${row.delayDays} Gün`}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Net Maaş:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatTL(row.netSalary)}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 dark:text-rose-400">
                      <span>İşleyen Faiz:</span>
                      <span className="font-black">{formatTL(row.accruedInterest)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700 text-xs font-black">
                      <span>Toplam Talep:</span>
                      <span>{formatTL(row.totalClaim)}</span>
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
