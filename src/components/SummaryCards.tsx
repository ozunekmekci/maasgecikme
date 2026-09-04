import React from 'react';
import { CaseSummary, SeveranceClaim, AnnualLeaveClaim, CompensationItem } from '../types/payroll';
import { formatTL } from '../utils/interestCalculator';
import { Scale, Wallet, TrendingUp, ArrowUpRight, Briefcase, Award, HeartHandshake } from 'lucide-react';

interface SummaryCardsProps {
  summary: CaseSummary;
  activeRate: number;
  severance: SeveranceClaim;
  annualLeave: AnnualLeaveClaim;
  compensations?: CompensationItem[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  summary, 
  activeRate, 
  severance, 
  annualLeave,
  compensations = []
}) => {
  const moralCompensation = compensations.find(c => c.title.toLowerCase().includes('manevi')) || compensations[0];
  const moralAmount = moralCompensation ? moralCompensation.calculatedAmount : summary.totalOtherCompensations;
  const moralSubtitle = moralCompensation && moralCompensation.basis === 'multiple_of_gross'
    ? `(${moralCompensation.multiplier} Aylık Brüt Maaş Karşılığı)`
    : '(6 Aylık Brüt Maaş Karşılığı)';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3 mb-6 font-sans">
      
      {/* 1. Ödenmeyen Anapara */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-3 sm:p-3.5 border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
          <span>Ödenmeyen Net Maaş</span>
          <Wallet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {formatTL(summary.totalWagePrincipalUnpaid)}
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Ödenmeyen Net Maaş Anapara Alacağı
          </p>
        </div>
      </div>

      {/* 2. Toplam İşleyen Faiz */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-3 sm:p-3.5 border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
          <span>Toplam Gecikme Faizi</span>
          <TrendingUp className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-400 tracking-tight font-mono">
            {formatTL(summary.totalWageInterest)}
          </div>
          <p className="mt-0.5 text-[10px] text-rose-700 dark:text-rose-400 font-medium">
            Yıllık %{activeRate} (m.34 En Yüksek Mevduat)
          </p>
        </div>
      </div>

      {/* 3. Toplam Ücret Alacağı */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-3 sm:p-3.5 border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
          <span>Toplam Ücret Alacağı</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-sky-800 dark:text-sky-300 tracking-tight font-mono">
            {formatTL(summary.totalWageClaims)}
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Maaşlar + Ağustos Faiz Farkı
          </p>
        </div>
      </div>

      {/* 4. Kıdem Tazminatı */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-3 sm:p-3.5 border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
          <span>Kıdem Tazminatı</span>
          <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-400 tracking-tight font-mono">
            {formatTL(severance.netSeverance)}
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Net Tutar ({severance.serviceYears} Yıl {severance.serviceDays} Gün)
          </p>
        </div>
      </div>

      {/* 5. Yıllık İzin Ücreti */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-3 sm:p-3.5 border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
          <span>Yıllık İzin Ücreti</span>
          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-tight font-mono">
            {formatTL(annualLeave.netAmount)}
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {annualLeave.leaveDays} Gün Kullanılmayan İzin Net
          </p>
        </div>
      </div>

      {/* 6. Manevi Tazminat Talebi */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-3 sm:p-3.5 border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
          <span>Manevi Tazminat</span>
          <HeartHandshake className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-400 tracking-tight font-mono">
            {formatTL(moralAmount)}
          </div>
          <p className="mt-0.5 text-[10px] text-purple-700 dark:text-purple-400 font-semibold">
            {moralSubtitle}
          </p>
        </div>
      </div>

      {/* 7. GENEL DAVA TOPLAMI (Spans neatly across remaining columns on tablet/desktop) */}
      <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-1 bg-slate-900 dark:bg-slate-950 text-white rounded-lg p-3 sm:p-3.5 border-2 border-slate-800 dark:border-slate-600 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wider border-b border-slate-700 pb-1 mb-1">
          <span>Genel Dava İcmali</span>
          <Scale className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-emerald-300 tracking-tight font-mono">
            {formatTL(summary.grandTotalClaim)}
          </div>
          <p className="mt-0.5 text-[10px] text-slate-300 font-medium">
            Ücret + Kıdem + İzin + Tazminatlar
          </p>
        </div>
      </div>

    </div>
  );
};
