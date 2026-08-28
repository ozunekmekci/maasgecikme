import React from 'react';
import { SeveranceClaim, AnnualLeaveClaim, CompensationItem } from '../types/payroll';
import { formatTL, formatDateTR } from '../utils/interestCalculator';
import { calculateSeverance, calculateAnnualLeave, calculateCompensationItem } from '../utils/compensationCalculator';
import { Plus, Trash2, Briefcase, Award, Scale, HelpCircle } from 'lucide-react';

interface CompensationModuleProps {
  severance: SeveranceClaim;
  setSeverance: (s: SeveranceClaim | ((prev: SeveranceClaim) => SeveranceClaim)) => void;
  annualLeave: AnnualLeaveClaim;
  setAnnualLeave: (a: AnnualLeaveClaim | ((prev: AnnualLeaveClaim) => AnnualLeaveClaim)) => void;
  compensations: CompensationItem[];
  setCompensations: (c: CompensationItem[] | ((prev: CompensationItem[]) => CompensationItem[])) => void;
  baseGross: number;
}

export const CompensationModule: React.FC<CompensationModuleProps> = ({
  severance,
  setSeverance,
  annualLeave,
  setAnnualLeave,
  compensations,
  setCompensations,
  baseGross
}) => {

  const handleUpdateSeverance = (updates: Partial<SeveranceClaim>) => {
    const updated = { ...severance, ...updates };
    const recalculate = calculateSeverance(
      updated.startDate,
      updated.terminationDate,
      updated.baseGross,
      updated.fringeGross,
      updated.severanceCap
    );
    setSeverance({ ...recalculate, enabled: updated.enabled });
  };

  const handleUpdateAnnualLeave = (updates: Partial<AnnualLeaveClaim>) => {
    const updated = { ...annualLeave, ...updates };
    const recalculated = calculateAnnualLeave(
      updated.nakedGross,
      updated.leaveDays
    );
    setAnnualLeave({ ...recalculated, enabled: updated.enabled });
  };

  const handleAddCompensation = () => {
    const newItem: CompensationItem = {
      id: `comp-${Date.now()}`,
      title: 'İlave Tazminat Talebi',
      enabled: true,
      basis: 'fixed_amount',
      multiplier: 1,
      fixedAmount: 50000,
      calculatedAmount: 50000,
      note: 'Özel alacak / tazminat talebi'
    };
    setCompensations([...compensations, newItem]);
  };

  const handleUpdateCompensation = (id: string, updates: Partial<CompensationItem>) => {
    setCompensations(
      compensations.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        return calculateCompensationItem(updated, baseGross);
      })
    );
  };

  const handleDeleteCompensation = (id: string) => {
    setCompensations(compensations.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Kıdem Tazminatı Kartı */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              A) KIDEM TAZMİNATI HESABI (1475 SAYILI KANUN M.14)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hizmet süresi ve giydirilmiş brüt ücret üzerinden yasal damga vergisi kesintili net tutar
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={severance.enabled}
                onChange={(e) => setSeverance(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <span>Dava İcmaline Dahil Et</span>
            </label>
            <div className="text-right pl-3 border-l border-slate-300 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Net Kıdem Tutarı</span>
              <span className="text-base font-black text-indigo-700 dark:text-indigo-400 font-mono">
                {formatTL(severance.netSeverance)}
              </span>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              İşe Giriş Tarihi
            </label>
            <input
              type="date"
              value={severance.startDate}
              onChange={(e) => handleUpdateSeverance({ startDate: e.target.value })}
              className="w-full px-2.5 py-1.5 font-mono font-medium rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fesih / Çıkış Tarihi
            </label>
            <input
              type="date"
              value={severance.terminationDate}
              onChange={(e) => handleUpdateSeverance({ terminationDate: e.target.value })}
              className="w-full px-2.5 py-1.5 font-mono font-medium rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Çıplak Brüt Maaş (TL)
            </label>
            <input
              type="number"
              step="0.01"
              value={severance.baseGross}
              onChange={(e) => handleUpdateSeverance({ baseGross: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-right"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Aylık Giydirme Ekleri (Yemek vb.)
            </label>
            <input
              type="number"
              step="0.01"
              value={severance.fringeGross}
              onChange={(e) => handleUpdateSeverance({ fringeGross: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-right"
            />
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="mt-4 p-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Hizmet Süresi:</span>
            <span className="font-bold text-slate-900 dark:text-white">{severance.serviceYears} Yıl {severance.serviceDays} Gün</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Giydirilmiş Brüt Ücret:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{formatTL(severance.clothedGross)}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Brüt Kıdem Tutarı:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{formatTL(severance.grossSeverance)}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Damga Vergisi (%0,759):</span>
            <span className="font-bold font-mono text-rose-700 dark:text-rose-400">- {formatTL(severance.stampTax)}</span>
          </div>
        </div>
      </div>

      {/* 2. Yıllık İzin Ücreti Kartı */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              B) YILLIK ÜCRETLİ İZİN ALACAĞI HESABI (4857 SAYILI KANUN M.59)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kullanılmayan izin günlerinin son çıplak brüt ücret üzerinden yasal kesintilerle netleştirilmesi
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={annualLeave.enabled}
                onChange={(e) => setAnnualLeave(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <span>Dava İcmaline Dahil Et</span>
            </label>
            <div className="text-right pl-3 border-l border-slate-300 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Net İzin Tutarı</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {formatTL(annualLeave.netAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kullanılmayan İzin Gün Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={annualLeave.leaveDays}
              onChange={(e) => handleUpdateAnnualLeave({ leaveDays: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-2.5 py-1.5 font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Son Çıplak Brüt Ücret (TL)
            </label>
            <input
              type="number"
              step="0.01"
              value={annualLeave.nakedGross}
              onChange={(e) => handleUpdateAnnualLeave({ nakedGross: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-right"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Günlük Brüt Ücret (TL)
            </label>
            <input
              type="text"
              readOnly
              value={formatTL(annualLeave.dailyGross)}
              className="w-full px-2.5 py-1.5 font-mono rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 cursor-not-allowed text-right"
            />
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="mt-4 p-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Brüt İzin Tutarı:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{formatTL(annualLeave.grossAmount)}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">SGK Kesintisi (%15):</span>
            <span className="font-bold font-mono text-rose-700 dark:text-rose-400">- {formatTL(annualLeave.sgkCut)}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Gelir Vergisi:</span>
            <span className="font-bold font-mono text-rose-700 dark:text-rose-400">- {formatTL(annualLeave.incomeTaxCut)}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Damga Vergisi (%0,759):</span>
            <span className="font-bold font-mono text-rose-700 dark:text-rose-400">- {formatTL(annualLeave.stampTaxCut)}</span>
          </div>
        </div>
      </div>

      {/* 3. Manevi / Diğer Tazminatlar */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              C) DİĞER TAZMİNAT & ALACAK TALEPLERİ (MANEVİ, KÖTÜNİYET, İHBAR VB.)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aylık brüt maaş çarpanı veya sabit tutar esasına dayalı ilave alacak talepleri
            </p>
          </div>

          <button
            onClick={handleAddCompensation}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Talep Ekle</span>
          </button>
        </div>

        <div className="space-y-3 mt-4">
          {compensations.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start sm:items-center space-x-2.5 w-full lg:w-auto">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => handleUpdateCompensation(item.id, { enabled: e.target.checked })}
                  className="w-4 h-4 mt-1 sm:mt-0 rounded text-slate-900 focus:ring-slate-900 shrink-0"
                />
                <div className="space-y-1.5 flex-1 sm:flex-initial">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateCompensation(item.id, { title: e.target.value })}
                    className="w-full sm:w-64 px-2 py-1 font-bold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white block"
                  />
                  <input
                    type="text"
                    value={item.note}
                    onChange={(e) => handleUpdateCompensation(item.id, { note: e.target.value })}
                    placeholder="Gerekçe notu"
                    className="w-full sm:w-64 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 block"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-700">
                <select
                  value={item.basis}
                  onChange={(e) => handleUpdateCompensation(item.id, { basis: e.target.value as any })}
                  className="px-2 py-1 font-semibold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
                >
                  <option value="multiple_of_gross">Aylık Brüt Maaş Çarpanı</option>
                  <option value="fixed_amount">Sabit Tutar</option>
                </select>

                {item.basis === 'multiple_of_gross' ? (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="1"
                      max="36"
                      step="0.5"
                      value={item.multiplier}
                      onChange={(e) => handleUpdateCompensation(item.id, { multiplier: parseFloat(e.target.value) || 1 })}
                      className="w-14 px-1.5 py-1 text-center font-mono font-bold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <span className="text-slate-500 font-semibold text-xs whitespace-nowrap">x Brüt ({formatTL(baseGross)})</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      step="100"
                      value={item.fixedAmount}
                      onChange={(e) => handleUpdateCompensation(item.id, { fixedAmount: parseFloat(e.target.value) || 0 })}
                      className="w-28 px-1.5 py-1 text-right font-mono font-bold rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <span className="text-slate-500 font-semibold text-xs">TL</span>
                  </div>
                )}

                <div className="text-right min-w-[110px] pl-2 sm:pl-3 border-l border-slate-300 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Hesaplanan Tutar</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {formatTL(item.calculatedAmount)}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteCompensation(item.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition ml-auto sm:ml-0"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
