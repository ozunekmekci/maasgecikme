import React, { useState } from 'react';
import { calculateCourtCosts } from '../utils/courtCostCalculator';
import { formatTL } from '../utils/interestCalculator';
import { Scale, Receipt, ShieldCheck, HelpCircle, ArrowUpRight, Coins, Calculator, FileCheck } from 'lucide-react';

interface CourtCostsModuleProps {
  grandTotalClaim: number;
}

export const CourtCostsModule: React.FC<CourtCostsModuleProps> = ({ grandTotalClaim }) => {
  const [customClaim, setCustomClaim] = useState<number>(grandTotalClaim);
  const [isUsingCustom, setIsUsingCustom] = useState<boolean>(false);

  const activeClaim = isUsingCustom ? customClaim : grandTotalClaim;
  const costs = calculateCourtCosts(activeClaim);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <Scale className="w-5 h-5 text-amber-500 shrink-0" />
              <span>İŞ MAHKEMESİ DAVA HARÇ, GİDER AVANSI VE VEKALET ÜCRETİ HESAPLAYICISI</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              (492 Sayılı Harçlar Kanunu, 6100 Sayılı HMK Gider Avansı ve 1136 Sayılı Kanun AAÜT Hükümleri Uyarınca)
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setIsUsingCustom(false);
                setCustomClaim(grandTotalClaim);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                !isUsingCustom
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              Dava İcmalinden Al ({formatTL(grandTotalClaim)})
            </button>
          </div>
        </div>

        {/* Custom Input Bar */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 shrink-0">
            <Calculator className="w-4 h-4 text-sky-600" />
            <span>Hesaplamaya Esas Dava Değeri (Müddeabih):</span>
          </label>
          <div className="relative flex-1 max-w-xs">
            <input
              type="number"
              step="100"
              value={activeClaim}
              onChange={(e) => {
                setIsUsingCustom(true);
                setCustomClaim(parseFloat(e.target.value) || 0);
              }}
              className="w-full pl-3 pr-8 py-1.5 text-xs font-black rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
            <span className="absolute right-2.5 top-1.5 text-slate-400 font-bold">TL</span>
          </div>
        </div>
      </div>

      {/* 2. Key Cost Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-300 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
            <span>Dava Konusu Değer</span>
            <Coins className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {formatTL(costs.claimAmount)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Toplam Talep Edilen Dava Tutarı
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-300 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
            <span>Peşin Dava Açılış Masrafı</span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono">
            {formatTL(costs.totalInitialLawsuitCost)}
          </div>
          <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-400 font-medium">
            Peşin Harçlar + HMK Gider Avansı
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-300 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
            <span>Karşı Vekalet Ücreti (AAÜT)</span>
            <Scale className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
            {formatTL(costs.statutoryAttorneyFee)}
          </div>
          <p className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
            Mahkemece Davalıya Yükletilecek Ücret
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-lg p-4 border-2 border-slate-800 dark:border-slate-600 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black text-amber-300 uppercase tracking-wider border-b border-slate-700 pb-2 mb-2">
            <span>Kazanıldığında Toplam Tahsilat</span>
            <ShieldCheck className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono">
            {formatTL(costs.totalNetRecovery)}
          </div>
          <p className="mt-1 text-[11px] text-slate-300 font-medium">
            Alacak + Masraflar + Vekalet Ücreti
          </p>
        </div>

      </div>

      {/* 3. Detailed Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sol Kolon: Harçlar Detayı */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              1. DAVA HARÇLARI DÖKÜMÜ (492 SAYILI KANUN)
            </h3>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              Toplam: {formatTL(costs.totalInitialFees)}
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">Başvurma Harcı (Maktu 2026)</td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatTL(costs.applicationFee)}</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-rose-50/30 dark:bg-rose-950/20">
                <td className="p-2.5">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block">Peşin Karar ve İlam Harcı (1/4)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Nisbi Harcın (Binde 68,31: {formatTL(costs.fullProportionalFee)}) dörtte biri</span>
                </td>
                <td className="p-2.5 text-right font-mono font-black text-rose-700 dark:text-rose-400">{formatTL(costs.advanceProportionalFee)}</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">Vekalet Harcı</td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatTL(costs.proxyFee)}</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">Baro Pulu</td>
                <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatTL(costs.baroStamp)}</td>
              </tr>
              <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <td className="p-2.5">PEŞİN YATIRILACAK TOPLAM HARÇ</td>
                <td className="p-2.5 text-right font-mono font-black text-slate-950 dark:text-white">{formatTL(costs.totalInitialFees)}</td>
              </tr>
              <tr className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 text-[11px]">
                <td className="p-2.5">Bakiye Karar ve İlam Harcı (3/4 - Dava Sonunda Davalıdan Alınır)</td>
                <td className="p-2.5 text-right font-mono">{formatTL(costs.remainingJudgmentFee)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sağ Kolon: Gider Avansı & AAÜT */}
        <div className="space-y-6">
          
          {/* Gider Avansı */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
                2. HMK GİDER AVANSI TARİFESİ
              </h3>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                Toplam: {formatTL(costs.totalAdvanceCost)}
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">Tebligat Gideri (2 Taraf x 2 Tebligat)</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatTL(costs.notificationCost)}</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">Resmi İş Hukuku Bilirkişi Ücreti</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatTL(costs.expertCost)}</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">Dosya, Müzekkere & Posta Masrafları</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatTL(costs.postalAndMiscCost)}</td>
                </tr>
                <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                  <td className="p-2.5">TOPLAM GİDER AVANSI</td>
                  <td className="p-2.5 text-right font-mono font-black text-slate-950 dark:text-white">{formatTL(costs.totalAdvanceCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal Notes */}
          <div className="p-4 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>Yargılama Giderlerinin İadesi & Rücu Kuralı</span>
            </h4>
            <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed">
              6100 Sayılı HMK m. 326 gereğince; dava haklı bulunup kabul edildiğinde, davacının dava açarken ödediği <strong>peşin harçlar, başvurma harcı ve gider avansının tamamı</strong> ile mahkemece hükmedilen <strong>karşı vekalet ücreti</strong> davalı işverenden tahsil edilerek davacıya iade edilir.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
