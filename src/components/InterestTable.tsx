import React, { useState } from 'react';
import { SalaryClaimRow, SeveranceClaim, AnnualLeaveClaim, CompensationItem, CaseSummary, RawPayrollRecord } from '../types/payroll';
import { formatTL, formatDateTR, getTurkeyDateString } from '../utils/interestCalculator';
import { getTcmbRateForMonthYear, TCMB_HISTORICAL_DEPOSIT_RATES } from '../data/tcmbRates';
import { 
  Calendar, 
  Percent, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Eye, 
  Info, 
  Sliders, 
  Check,
  Scale,
  Building,
  User,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  HeartHandshake
} from 'lucide-react';

interface InterestTableProps {
  rows: SalaryClaimRow[];
  severance: SeveranceClaim;
  setSeverance: React.Dispatch<React.SetStateAction<SeveranceClaim>>;
  annualLeave: AnnualLeaveClaim;
  setAnnualLeave: React.Dispatch<React.SetStateAction<AnnualLeaveClaim>>;
  compensations: CompensationItem[];
  setCompensations: React.Dispatch<React.SetStateAction<CompensationItem[]>>;
  summary: CaseSummary;
  globalInterestRate: number;
  setGlobalInterestRate: (rate: number) => void;
  isTcmbGradualMode: boolean;
  setIsTcmbGradualMode: (val: boolean) => void;
  calculationDate: string;
  setCalculationDate: (date: string) => void;
  dueDay: number;
  setDueDay: (day: number) => void;
  onUpdateRow: (id: string, updates: Partial<SalaryClaimRow>) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
  onSelectPayrollDetail: (record: RawPayrollRecord) => void;
  baseGross: number;
}

export const InterestTable: React.FC<InterestTableProps> = ({
  rows,
  severance,
  setSeverance,
  annualLeave,
  setAnnualLeave,
  compensations,
  setCompensations,
  summary,
  globalInterestRate,
  setGlobalInterestRate,
  isTcmbGradualMode,
  setIsTcmbGradualMode,
  calculationDate,
  setCalculationDate,
  dueDay,
  setDueDay,
  onUpdateRow,
  onDeleteRow,
  onAddRow,
  onSelectPayrollDetail,
  baseGross
}) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isTazminatExpanded, setIsTazminatExpanded] = useState<boolean>(false);

  const applyPresetRate = (rate: number) => {
    setIsTcmbGradualMode(false);
    setGlobalInterestRate(rate);
  };

  const setDateToday = () => {
    const today = getTurkeyDateString();
    setCalculationDate(today);
  };

  const employeeName = rows[0]?.rawRecord?.employeeName || '[GİZLİ DAVACI / İŞÇİ]';
  const companyName = rows[0]?.rawRecord?.companyName || '[GİZLİ DAVALI İŞVEREN A.Ş.]';
  const jobTitle = rows[0]?.rawRecord?.jobTitle || 'BİYOMEDİKAL MÜHENDİSİ';

  return (
    <div className="space-y-6">
      
      {/* 1. Official Case & Parties Card (Bilirkişi Raporu Başlığı) */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm font-sans">
        
        {/* Title Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 dark:border-slate-100 mb-4">
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white font-serif">
            İŞÇİLİK ALACAKLARI VE GECİKME FAİZİ HESAP TABLOSU
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">
            (4857 Sayılı İş Kanunu m. 34, m. 59 ve 1475 Sayılı İş Kanunu m. 14 Hükümleri Uyarınca)
          </p>
        </div>

        {/* 2-Column Parties & Case Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold">DAVACI (İŞÇİ):</span>
              <span className="font-semibold">{employeeName}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">GÖREVİ:</span>
              <span>{jobTitle}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">İşe Giriş:</span>
                <span className="font-bold text-slate-900 dark:text-white">04.08.2025</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Fesih / Çıkış:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatDateTR(severance.terminationDate)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold">DAVALI (İŞVEREN):</span>
              <span className="font-semibold truncate" title={companyName}>{companyName}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">HİZMET SÜRESİ:</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">{severance.serviceYears} Yıl {severance.serviceDays} Gün</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Hesaplama Tarihi:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatDateTR(calculationDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Uygulanan Faiz:</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  {isTcmbGradualMode ? 'TCMB Kademeli Mevduat Faizi' : `Yıllık %${globalInterestRate} (m.34)`}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Dinamik Parametre & Ayar Paneli (TCMB Kademeli / Sabit Faiz Seçicisi) */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-300 dark:border-slate-700 shadow-sm font-sans">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Faiz Modu ve Oranı */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                <Percent className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Faiz Hesaplama Modu</span>
              </label>
              
              <button
                onClick={() => setIsTcmbGradualMode(!isTcmbGradualMode)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  isTcmbGradualMode
                    ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-500/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isTcmbGradualMode ? 'TCMB Kademeli Faiz Aktif' : 'TCMB Kademeli Faizi Aç'}</span>
              </button>
            </div>

            {!isTcmbGradualMode ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-28">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="0.5"
                    value={globalInterestRate}
                    onChange={(e) => setGlobalInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">%</span>
                </div>

                <div className="flex items-center space-x-1">
                  {[48, 50, 45, 24].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => applyPresetRate(preset)}
                      className={`px-2 py-1.5 rounded text-xs font-bold transition-all ${
                        globalInterestRate === preset
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      %{preset} {preset === 48 ? '(Varsayılan)' : preset === 24 ? '(Yasal)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold block">TCMB En Yüksek Mevduat Oranları (1-3 Ay) Otomatik Uygulanıyor:</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  Her dönemin muacceliyet tarihindeki resmi TCMB ağırlıklı ortalama mevduat faiz oranı (Ağustos %53.20, Eylül %52.80, Ekim %51.50... vb.) işletilmektedir.
                </span>
              </div>
            )}
          </div>

          {/* Hesaplama Tarihi */}
          <div className="flex-1">
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Hesaplama Tarihi (TR Saati)</span>
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={calculationDate}
                onChange={(e) => setCalculationDate(e.target.value)}
                className="px-2 py-1.5 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <button
                onClick={() => setCalculationDate('2026-08-28')}
                className="px-2.5 py-1.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition"
              >
                28.08.2026
              </button>
              <button
                onClick={setDateToday}
                className="px-2.5 py-1.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition"
              >
                Bugün
              </button>
            </div>
          </div>

          {/* Muacceliyet Günü */}
          <div className="flex-1">
            <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Muacceliyet Günü</span>
            </label>
            <select
              value={dueDay}
              onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
              className="px-2 py-1.5 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={5}>Takip eden ayın 5'i (Varsayılan)</option>
              <option value={1}>Takip eden ayın 1'i</option>
              <option value={10}>Takip eden ayın 10'u</option>
              <option value={15}>Takip eden ayın 15'i</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. Resmi Bilirkişi Formatlı Ana Tablo */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden font-sans">
        
        {/* Table Header Bar */}
        <div className="p-3 sm:p-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2 font-serif">
              <span>1. ÖDENMEYEN VE GECİKMELİ ÖDENEN MAAŞLAR FAİZ HESAP TABLOSU</span>
              <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {rows.length} Dönem
              </span>
            </h3>
          </div>

          <button
            onClick={onAddRow}
            className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs font-bold rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Dönem Ekle</span>
          </button>
        </div>

        {/* Mobile Scroll Indicator Helper */}
        <div className="sm:hidden px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span>↔ Tabloyu sağa/sola kaydırarak tüm sütunları görebilirsiniz</span>
        </div>

        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left text-xs border-collapse border border-slate-300 dark:border-slate-700 min-w-[720px] sm:min-w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-300 dark:border-slate-700 text-[11px] uppercase">
                <th className="p-2 border border-slate-300 dark:border-slate-700">Dönem</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-right">Bordro Net Maaş (TL)</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Muacceliyet</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Fiili Ödeme</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Gecikme Günü</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Yıllık Faiz</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-right">İşleyen Faiz (TL)</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-right font-black">Talep Edilen Toplam (TL)</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700">Durum / Not</th>
                <th className="p-2 border border-slate-300 dark:border-slate-700 text-center w-16">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isPaid = row.status === 'paid';
                const isEditing = editingRowId === row.id;

                return (
                  <tr 
                    key={row.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-800 ${
                      isPaid ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                    }`}
                  >
                    {/* Dönem */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.period}
                          onChange={(e) => onUpdateRow(row.id, { period: e.target.value })}
                          className="px-1.5 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 w-28 font-bold"
                        />
                      ) : (
                        <span>{row.period}</span>
                      )}
                    </td>

                    {/* Net Maaş */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={row.netSalary}
                          onChange={(e) => onUpdateRow(row.id, { netSalary: parseFloat(e.target.value) || 0 })}
                          className="px-1.5 py-0.5 text-xs text-right rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 w-24 font-mono font-bold"
                        />
                      ) : (
                        <span>{formatTL(row.netSalary, false)}</span>
                      )}
                    </td>

                    {/* Muacceliyet Tarihi */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) => onUpdateRow(row.id, { dueDate: e.target.value })}
                          className="px-1 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
                        />
                      ) : (
                        <span>{formatDateTR(row.dueDate)}</span>
                      )}
                    </td>

                    {/* Fiili Ödeme Tarihi */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="date"
                          value={row.actualPaymentDate || ''}
                          onChange={(e) => onUpdateRow(row.id, { 
                            actualPaymentDate: e.target.value || undefined,
                            status: e.target.value ? 'paid' : 'unpaid'
                          })}
                          className="px-1 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
                        />
                      ) : (
                        <span className={row.actualPaymentDate ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                          {row.actualPaymentDate ? formatDateTR(row.actualPaymentDate) : '-'}
                        </span>
                      )}
                    </td>

                    {/* Gecikme Günü */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-amber-700 dark:text-amber-400 whitespace-nowrap">
                      {row.delayDays} gün
                    </td>

                    {/* Faiz Oranı */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono font-medium whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          step="1"
                          value={row.annualInterestRate}
                          onChange={(e) => onUpdateRow(row.id, { annualInterestRate: parseFloat(e.target.value) || 0 })}
                          className="px-1 py-0.5 text-xs text-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 w-14 font-mono font-bold"
                        />
                      ) : (
                        <span>%{row.annualInterestRate}</span>
                      )}
                    </td>

                    {/* İşleyen Faiz */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-right font-mono font-bold text-rose-700 dark:text-rose-400 whitespace-nowrap">
                      {formatTL(row.accruedInterest, false)}
                    </td>

                    {/* Talep Edilen Toplam */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-right font-mono font-black text-slate-950 dark:text-sky-300 whitespace-nowrap">
                      {formatTL(row.totalClaim, false)}
                    </td>

                    {/* Durum / Not */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-[11px]">
                      {isEditing ? (
                        <div className="flex flex-col space-y-1">
                          <select
                            value={row.status}
                            onChange={(e) => onUpdateRow(row.id, { status: e.target.value as any })}
                            className="px-1.5 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          >
                            <option value="unpaid">Ödenmedi</option>
                            <option value="paid">Ödendi</option>
                            <option value="partial">Kısmi Ödendi</option>
                          </select>
                          <input
                            type="text"
                            value={row.note}
                            onChange={(e) => onUpdateRow(row.id, { note: e.target.value })}
                            className="px-1.5 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          {row.status === 'paid' ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Ödendi (Faiz Farkı)
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              Ödenmedi
                            </span>
                          )}
                          <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs">{row.note}</span>
                        </div>
                      )}
                    </td>

                    {/* İşlemler */}
                    <td className="p-2 border border-slate-300 dark:border-slate-700 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        {row.rawRecord && (
                          <button
                            onClick={() => onSelectPayrollDetail(row.rawRecord!)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            title="Bordro Detayı"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingRowId(isEditing ? null : row.id)}
                          className={`p-1 rounded ${isEditing ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                          title={isEditing ? 'Kaydet' : 'Düzenle'}
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Sliders className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDeleteRow(row.id)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {/* 1. TOPLAM ÜCRET ALACAĞI ROW */}
              <tr className="bg-slate-100 dark:bg-slate-800 font-black border-t-2 border-slate-900 dark:border-slate-100 text-xs">
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-serif">
                  TOPLAM ÜCRET ALACAĞI
                </td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono">
                  {formatTL(summary.totalWagePrincipalUnpaid, false)}
                </td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono text-rose-700 dark:text-rose-400">
                  {formatTL(summary.totalWageInterest, false)}
                </td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono font-black text-sm text-slate-950 dark:text-sky-300">
                  {formatTL(summary.totalWageClaims, false)}
                </td>
                <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400" colSpan={2}>
                  11 Ay Maaş + Ağustos Faiz Farkı
                </td>
              </tr>

              {/* SECTION 2: TAZMİNAT VE DİĞER HAKLAR */}
              {severance.enabled && (
                <tr className="bg-slate-50/80 dark:bg-slate-850 border-t border-slate-300 dark:border-slate-700 font-semibold text-xs">
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-serif">
                    Kıdem Tazminatı ({severance.serviceYears} Yıl {severance.serviceDays} Gün)
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono">
                    {formatTL(severance.netSeverance, false)}
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center font-mono">{formatDateTR(severance.terminationDate)}</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatTL(severance.netSeverance, false)}
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400" colSpan={2}>
                    {severance.note}
                  </td>
                </tr>
              )}

              {annualLeave.enabled && (
                <tr className="bg-slate-50/80 dark:bg-slate-850 border-t border-slate-300 dark:border-slate-700 font-semibold text-xs">
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-serif">
                    Yıllık İzin Ücreti ({annualLeave.leaveDays} Gün)
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono">
                    {formatTL(annualLeave.netAmount, false)}
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center font-mono">{formatDateTR(calculationDate)}</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatTL(annualLeave.netAmount, false)}
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400" colSpan={2}>
                    {annualLeave.note}
                  </td>
                </tr>
              )}

              {compensations.filter(c => c.enabled).map((c) => (
                <tr key={c.id} className="bg-slate-50/80 dark:bg-slate-850 border-t border-slate-300 dark:border-slate-700 font-semibold text-xs">
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-serif">
                    {c.title}
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono">
                    {formatTL(c.calculatedAmount, false)}
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right text-slate-400">-</td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatTL(c.calculatedAmount, false)}
                  </td>
                  <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400" colSpan={2}>
                    {c.note}
                  </td>
                </tr>
              ))}

              {/* SECTION 3: GENEL DAVA TOPLAMI */}
              <tr className="bg-slate-900 text-white dark:bg-slate-950 font-black text-sm border-t-4 border-slate-900 dark:border-white">
                <td className="p-3 border border-slate-700 font-serif text-amber-300 uppercase">
                  GENEL DAVA TOPLAMI
                </td>
                <td className="p-3 border border-slate-700 text-right font-mono text-slate-200">
                  {formatTL(
                    summary.totalWagePrincipalUnpaid + summary.totalSeveranceNet + summary.totalLeaveNet + summary.totalOtherCompensations, 
                    false
                  )}
                </td>
                <td className="p-3 border border-slate-700 text-center text-slate-400">-</td>
                <td className="p-3 border border-slate-700 text-center text-slate-400">-</td>
                <td className="p-3 border border-slate-700 text-center text-slate-400">-</td>
                <td className="p-3 border border-slate-700 text-center text-slate-400">-</td>
                <td className="p-3 border border-slate-700 text-right font-mono text-rose-400">
                  {formatTL(summary.totalWageInterest, false)}
                </td>
                <td className="p-3 border border-slate-700 text-right font-mono font-black text-base text-emerald-300">
                  {formatTL(summary.grandTotalClaim, false)} TL
                </td>
                <td className="p-3 border border-slate-700 text-[11px] font-sans text-slate-300 font-normal" colSpan={2}>
                  Dava İcmali (Masraflar Hariç)
                </td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>

      {/* 4. Sadeleştirilmiş Hızlı Tazminat Parametreleri Paneli (Accordion) */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden font-sans">
        <button
          onClick={() => setIsTazminatExpanded(!isTazminatExpanded)}
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition text-left"
        >
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              TAZMİNAT & İZİN ALACAKLARI PARAMETRELERİ
            </span>
            <span className="hidden sm:inline text-[11px] font-semibold text-slate-500">
              (Kıdem: {formatTL(severance.netSeverance)}, İzin: {formatTL(annualLeave.netAmount)}, Manevi: {formatTL(compensations[0]?.calculatedAmount || 0)})
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-500 shrink-0">
            <span className="text-xs font-semibold">{isTazminatExpanded ? 'Gizle' : 'Düzenle'}</span>
            {isTazminatExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isTazminatExpanded && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Kıdem Tazminatı Kartı */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">1. Kıdem Tazminatı (1475 m.14)</span>
                  <input
                    type="checkbox"
                    checked={severance.enabled}
                    onChange={(e) => setSeverance(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded text-slate-900 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Çıplak Brüt Ücret (TL):</label>
                  <input
                    type="number"
                    value={severance.baseGross}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setSeverance(prev => ({
                        ...prev,
                        baseGross: val,
                        clothedGross: val + prev.fringeGross
                      }));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Nakdi Yemek / Yan Hak Brüt (TL):</label>
                  <input
                    type="number"
                    value={severance.fringeGross}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setSeverance(prev => ({
                        ...prev,
                        fringeGross: val,
                        clothedGross: prev.baseGross + val
                      }));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>
                <div className="pt-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex justify-between">
                  <span>Hesaplanan Net Kıdem:</span>
                  <span className="font-mono">{formatTL(severance.netSeverance)}</span>
                </div>
              </div>

              {/* Yıllık İzin Kartı */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">2. Yıllık İzin Ücreti (4857 m.59)</span>
                  <input
                    type="checkbox"
                    checked={annualLeave.enabled}
                    onChange={(e) => setAnnualLeave(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded text-slate-900 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Kullanılmayan İzin Günü:</label>
                  <input
                    type="number"
                    value={annualLeave.leaveDays}
                    onChange={(e) => {
                      const days = parseInt(e.target.value, 10) || 0;
                      setAnnualLeave(prev => ({
                        ...prev,
                        leaveDays: days
                      }));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Çıplak Brüt Maaş (TL):</label>
                  <input
                    type="number"
                    value={annualLeave.nakedGross}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setAnnualLeave(prev => ({
                        ...prev,
                        nakedGross: val
                      }));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>
                <div className="pt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex justify-between">
                  <span>Hesaplanan Net İzin:</span>
                  <span className="font-mono">{formatTL(annualLeave.netAmount)}</span>
                </div>
              </div>

              {/* Manevi Tazminat Kartı */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">3. Manevi Tazminat Talebi</span>
                  <input
                    type="checkbox"
                    checked={compensations[0]?.enabled || false}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setCompensations(prev => prev.map((c, i) => i === 0 ? { ...c, enabled } : c));
                    }}
                    className="rounded text-slate-900 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Brüt Maaş Çarpanı (Ay):</label>
                  <input
                    type="number"
                    value={compensations[0]?.multiplier || 6}
                    onChange={(e) => {
                      const mult = parseFloat(e.target.value) || 0;
                      setCompensations(prev => prev.map((c, i) => i === 0 ? {
                        ...c,
                        multiplier: mult,
                        calculatedAmount: baseGross * mult
                      } : c));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Sabit Tutar Talebi (TL):</label>
                  <input
                    type="number"
                    value={compensations[0]?.calculatedAmount || 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCompensations(prev => prev.map((c, i) => i === 0 ? {
                        ...c,
                        calculatedAmount: val,
                        fixedAmount: val
                      } : c));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>
                <div className="pt-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 flex justify-between">
                  <span>Talep Edilen Tutar:</span>
                  <span className="font-mono">{formatTL(compensations[0]?.calculatedAmount || 0)}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};
