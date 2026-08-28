import React from 'react';
import { RawPayrollRecord } from '../types/payroll';
import { formatTL } from '../utils/interestCalculator';
import { X, FileText, Building2, User, Calendar, DollarSign, Percent, Shield } from 'lucide-react';

interface PayrollDetailModalProps {
  record: RawPayrollRecord | null;
  onClose: () => void;
}

export const PayrollDetailModal: React.FC<PayrollDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Bordro Zarfı Detayı - {record.period}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {record.companyName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Employee & Job Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 block font-medium">Personel:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Görevi:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.jobTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">İşe Giriş Tarihi:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.startDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Çalışılan Gün:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{record.workDays} Gün</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Aylık Brüt Ücret:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{formatTL(record.grossSalary)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Net Ödeme:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatTL(record.netSalary)}</span>
            </div>
          </div>

          {/* Kazançlar ve Sosyal Yardımlar */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center space-x-2 text-sm">
              <span>Kazançlar & Ek Haklar</span>
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Kalem</th>
                    <th className="py-2 px-3 text-right">Brüt Tutar</th>
                    <th className="py-2 px-3 text-right">Net Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3">Normal Mesai ({record.workDays} Gün)</td>
                    <td className="py-2 px-3 text-right font-medium">{formatTL(record.grossSalary)}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatTL(record.netSalary)}</td>
                  </tr>
                  {record.foodAllowanceGross > 0 && (
                    <tr>
                      <td className="py-2 px-3">Yemek Yardımı (Nakdi)</td>
                      <td className="py-2 px-3 text-right font-medium">{formatTL(record.foodAllowanceGross)}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatTL(record.foodAllowanceNet)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50/50 dark:bg-slate-800/40 font-bold">
                    <td className="py-2 px-3">Tüm Kazançlar Toplamı</td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-white">{formatTL(record.totalGrossEarnings)}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">{formatTL(record.totalNetEarnings)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Yasal ve Özel Kesintiler */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center space-x-2 text-sm">
              <span>Yasal ve Özel Kesintiler</span>
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Kesinti Türü</th>
                    <th className="py-2 px-3 text-right">Matrah</th>
                    <th className="py-2 px-3 text-right">Kesinti Tutarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3">SGK İşçi Primi (%14)</td>
                    <td className="py-2 px-3 text-right text-slate-500">{formatTL(record.sgkMatrah || 78368)}</td>
                    <td className="py-2 px-3 text-right font-medium text-rose-600 dark:text-rose-400">{formatTL(record.sgkWorkerDeduction)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">SGK İşçi İşsizlik (%1)</td>
                    <td className="py-2 px-3 text-right text-slate-500">{formatTL(record.sgkMatrah || 78368)}</td>
                    <td className="py-2 px-3 text-right font-medium text-rose-600 dark:text-rose-400">{formatTL(record.sgkUnemploymentDeduction)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Gelir Vergisi Tutarı</td>
                    <td className="py-2 px-3 text-right text-slate-500">{formatTL(record.incomeTaxMatrah || 64848)}</td>
                    <td className="py-2 px-3 text-right font-medium text-rose-600 dark:text-rose-400">{formatTL(record.incomeTaxAmount)}</td>
                  </tr>
                  {record.stampTaxAmount > 0 && (
                    <tr>
                      <td className="py-2 px-3">Damga Vergisi</td>
                      <td className="py-2 px-3 text-right text-slate-500">-</td>
                      <td className="py-2 px-3 text-right font-medium text-rose-600 dark:text-rose-400">{formatTL(record.stampTaxAmount)}</td>
                    </tr>
                  )}
                  {record.besDeduction > 0 && (
                    <tr>
                      <td className="py-2 px-3">Bireysel Emeklilik (BES)</td>
                      <td className="py-2 px-3 text-right text-slate-500">-</td>
                      <td className="py-2 px-3 text-right font-medium text-rose-600 dark:text-rose-400">{formatTL(record.besDeduction)}</td>
                    </tr>
                  )}
                  {record.otherDeductions > 0 && (
                    <tr>
                      <td className="py-2 px-3">Özel Kesintiler (Ceza vb.)</td>
                      <td className="py-2 px-3 text-right text-slate-500">-</td>
                      <td className="py-2 px-3 text-right font-medium text-rose-600 dark:text-rose-400">{formatTL(record.otherDeductions)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50/50 dark:bg-slate-800/40 font-bold">
                    <td className="py-2 px-3" colSpan={2}>Tüm Kesintiler Toplamı</td>
                    <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400">{formatTL(record.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition"
          >
            Tamam
          </button>
        </div>

      </div>
    </div>
  );
};
