import React, { useState } from 'react';
import { CaseSummary, SeveranceClaim, AnnualLeaveClaim, SalaryClaimRow } from '../types/payroll';
import { formatTL, formatDateTR } from '../utils/interestCalculator';
import { getTcmbRateForMonthYear } from '../data/tcmbRates';
import { 
  Handshake, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Scale, 
  Coins, 
  FileText, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Percent,
  Sliders
} from 'lucide-react';

interface MediationPlanModuleProps {
  rows: SalaryClaimRow[];
  summary: CaseSummary;
  severance: SeveranceClaim;
  annualLeave: AnnualLeaveClaim;
  globalInterestRate: number;
}

export const MediationPlanModule: React.FC<MediationPlanModuleProps> = ({
  rows,
  summary,
  severance,
  annualLeave,
  globalInterestRate
}) => {
  // Option selection: 'no_interest' (Seçenek 1) | 'with_interest_fixed' (Seçenek 2A) | 'with_interest_tcmb' (Seçenek 2B)
  const [selectedOption, setSelectedOption] = useState<'no_interest' | 'with_interest_fixed' | 'with_interest_tcmb'>('with_interest_fixed');
  const [copied, setCopied] = useState<boolean>(false);

  // Excluded: Manevi Tazminat
  const severanceNet = severance.enabled ? severance.netSeverance : 0;
  const leaveNet = annualLeave.enabled ? annualLeave.netAmount : 0;
  const wagePrincipal = summary.totalWagePrincipalUnpaid;

  // 1. Seçenek: Faizsiz Maaşlar + Kıdem + İzin
  const option1Total = wagePrincipal + severanceNet + leaveNet;

  // 2.A Seçenek: Sabit Faizli Maaşlar (%48) + Kıdem + İzin
  const fixedInterestWageTotal = summary.totalWageClaims;
  const option2AFixedTotal = fixedInterestWageTotal + severanceNet + leaveNet;

  // 2.B Seçenek: TCMB Kademeli Faizli Maaşlar + Kıdem + İzin
  const tcmbWageInterestTotal = rows.reduce((sum, r) => {
    const tRate = getTcmbRateForMonthYear(r.month, r.year);
    const accrued = r.status === 'unpaid' 
      ? (r.netSalary * (tRate / 100) * r.delayDays) / 365
      : (r.status === 'paid' && r.actualPaymentDate) 
        ? (r.netSalary * (tRate / 100) * r.delayDays) / 365 
        : 0;
    const principal = r.status === 'unpaid' ? r.netSalary : 0;
    return sum + principal + accrued;
  }, 0);
  const option2BTcmbTotal = tcmbWageInterestTotal + severanceNet + leaveNet;

  // Current selected total
  const currentTotal = selectedOption === 'no_interest'
    ? option1Total
    : selectedOption === 'with_interest_fixed'
      ? option2AFixedTotal
      : option2BTcmbTotal;

  // Custom fixed payment for first 7 months
  const defaultFirst7Monthly = selectedOption === 'no_interest'
    ? 100000
    : 120000;

  const [first7MonthsPayment, setFirst7MonthsPayment] = useState<number>(defaultFirst7Monthly);

  // Recalculate 8th installment
  const totalFirst7 = first7MonthsPayment * 7;
  const eighthInstallment = Math.max(0, currentTotal - totalFirst7);

  // Installment Dates (1st of each month from October 2026 to May 2027)
  const installmentDates = [
    { no: 1, date: '01.10.2026', monthName: 'Ekim 2026 Başı' },
    { no: 2, date: '01.11.2026', monthName: 'Kasım 2026 Başı' },
    { no: 3, date: '01.12.2026', monthName: 'Aralık 2026 Başı' },
    { no: 4, date: '01.01.2027', monthName: 'Ocak 2027 Başı' },
    { no: 5, date: '01.02.2027', monthName: 'Şubat 2027 Başı' },
    { no: 6, date: '01.03.2027', monthName: 'Mart 2027 Başı' },
    { no: 7, date: '01.04.2027', monthName: 'Nisan 2027 Başı' },
    { no: 8, date: '01.05.2027', monthName: 'Mayıs 2027 Başı (Kapanış)' },
  ];

  // Agreement Legal Text for copy
  const optionTitle = selectedOption === 'no_interest'
    ? 'Seçenek 1 (Faizsiz Anapara + Kıdem + İzin)'
    : selectedOption === 'with_interest_fixed'
      ? `Seçenek 2.A (Sabit %${globalInterestRate} Faizli Maaşlar + Kıdem + İzin)`
      : 'Seçenek 2.B (TCMB Kademeli Faizli Maaşlar + Kıdem + İzin)';

  const mediationClauseText = `ARABULUCULUK ÖDEME VE ANLAŞMA PROTOKOLÜ ŞARTI:
İşbu anlaşma gereğince işveren; işçinin ödenmeyen ücret alacakları (yemek yardımı dahil), gecikme faizi farkları, kıdem tazminatı ve yıllık izin alacaklarına mahsuben toplam ${formatTL(currentTotal)} tutarındaki borcu, işçinin QNB nezdindeki TR46 0011 1000 0000 0158 5692 66 IBAN numaralı maaş hesabına aşağıda belirtilen 8 (sekiz) taksit halinde nakden ve defaten ödemeyi gayrikabili rücu kabul, beyan ve taahhüt eder:

1. Taksit: 01.10.2026 tarihinde ${formatTL(first7MonthsPayment)}
2. Taksit: 01.11.2026 tarihinde ${formatTL(first7MonthsPayment)}
3. Taksit: 01.12.2026 tarihinde ${formatTL(first7MonthsPayment)}
4. Taksit: 01.01.2027 tarihinde ${formatTL(first7MonthsPayment)}
5. Taksit: 01.02.2027 tarihinde ${formatTL(first7MonthsPayment)}
6. Taksit: 01.03.2027 tarihinde ${formatTL(first7MonthsPayment)}
7. Taksit: 01.04.2027 tarihinde ${formatTL(first7MonthsPayment)}
8. Taksit (Bakiye Kalan): 01.05.2027 tarihinde ${formatTL(eighthInstallment)}

MUACCELİYET VE CEZAİ ŞART:
Taksitlerden herhangi birinin vadesinde tam ve eksiksiz olarak ödenmemesi halinde, kalan tüm taksitler muaccel hale gelecek ve borcun tamamına 4857 sayılı İş Kanunu m.34 uyarınca bankalarca mevduata uygulanan en yüksek faiz işletilecektir.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mediationClauseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <Handshake className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>ARABULUCULUK 8 TAKSİTLİ ÖDEME PLANI VE ANLAŞMA PROTOKOLÜ</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              (Ekim 2026 Sonu Başlangıçlı • Manevi Tazminat Hariç • İlk 7 Ay Sabit, 8. Ay Kalan Bakiye)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm transition hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Metin Kopyalandı!' : 'Anlaşma Metnini Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* 3 Main Scenario Option Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
          
          {/* SEÇENEK 1: FAİZSİZ */}
          <button
            onClick={() => {
              setSelectedOption('no_interest');
              setFirst7MonthsPayment(100000);
            }}
            className={`p-4 rounded-lg text-left transition border-2 flex flex-col justify-between ${
              selectedOption === 'no_interest'
                ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800 shadow-md ring-1 ring-slate-900 dark:ring-white'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                <span>1. SEÇENEK: FAİZSİZ PAKET</span>
                {selectedOption === 'no_interest' && <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Faizsiz Net Maaşlar + Kıdem + Yıllık İzin
              </p>
            </div>
            <div className="pt-3">
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">
                {formatTL(option1Total)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Faiz talep edilmeyen uzlaşma</span>
            </div>
          </button>

          {/* SEÇENEK 2.A: SABİT FAİZLİ (%48) */}
          <button
            onClick={() => {
              setSelectedOption('with_interest_fixed');
              setFirst7MonthsPayment(120000);
            }}
            className={`p-4 rounded-lg text-left transition border-2 flex flex-col justify-between ${
              selectedOption === 'with_interest_fixed'
                ? 'border-rose-600 bg-rose-50/50 dark:border-rose-500 dark:bg-rose-950/30 shadow-md ring-1 ring-rose-500'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1">
                <span>2.A SEÇENEK: %48 FAİZLİ PAKET</span>
                {selectedOption === 'with_interest_fixed' && <CheckCircle2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                %48 Faizli Maaşlar + Kıdem + İzin
              </p>
            </div>
            <div className="pt-3">
              <span className="text-xl font-black text-rose-700 dark:text-rose-400 font-mono block">
                {formatTL(option2AFixedTotal)}
              </span>
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold">İş Kanunu m.34 Yasal Mevduat</span>
            </div>
          </button>

          {/* SEÇENEK 2.B: TCMB KADEMELİ FAİZLİ */}
          <button
            onClick={() => {
              setSelectedOption('with_interest_tcmb');
              setFirst7MonthsPayment(120000);
            }}
            className={`p-4 rounded-lg text-left transition border-2 flex flex-col justify-between ${
              selectedOption === 'with_interest_tcmb'
                ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 shadow-md ring-1 ring-indigo-500'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>2.B SEÇENEK: TCMB KADEMELİ</span>
                </span>
                {selectedOption === 'with_interest_tcmb' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                TCMB Dönemsel Oranlar + Kıdem + İzin
              </p>
            </div>
            <div className="pt-3">
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono block">
                {formatTL(option2BTcmbTotal)}
              </span>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold">Resmi TCMB 1-3 Ay Ortalaması</span>
            </div>
          </button>

        </div>
      </div>

      {/* 2. Taksit Simülasyonu & Ayar Çubuğu */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>İlk 7 Ay Ödenecek Sabit Aylık Taksit Tutarı (TL):</span>
            </label>
            <p className="text-[11px] text-slate-500">
              İlk 7 ay bu sabit tutar ödenir, kalan tüm bakiye 8. (Son) taksite devrolur.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-40">
              <input
                type="number"
                step="5000"
                value={first7MonthsPayment}
                onChange={(e) => setFirst7MonthsPayment(parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-8 py-1.5 text-xs font-black rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="absolute right-2.5 top-1.5 text-slate-400 font-bold text-xs">TL</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center space-x-1">
              {[100000, 110000, 120000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setFirst7MonthsPayment(preset)}
                  className={`px-2 py-1.5 rounded text-xs font-bold transition ${
                    first7MonthsPayment === preset
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {preset / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 8 Taksitlik Resmi Ödeme Tablosu */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden font-sans">
        <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>8 TAKSİTLİK PROTOKOL ÖDEME PLANI ({optionTitle})</span>
          </h3>
          <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400">
            Toplam Protokol Tutarı: {formatTL(currentTotal)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-300 dark:border-slate-700 text-[11px] uppercase">
                <th className="p-2.5 border border-slate-300 dark:border-slate-700 text-center w-14">Taksit</th>
                <th className="p-2.5 border border-slate-300 dark:border-slate-700">Vade / Ödeme Tarihi</th>
                <th className="p-2.5 border border-slate-300 dark:border-slate-700">Dönem Açıklaması</th>
                <th className="p-2.5 border border-slate-300 dark:border-slate-700 text-right">Ödenecek Taksit Tutarı</th>
                <th className="p-2.5 border border-slate-300 dark:border-slate-700 text-right">Kalan Borç Bakiyesi</th>
                <th className="p-2.5 border border-slate-300 dark:border-slate-700 text-center">Durum</th>
              </tr>
            </thead>
            <tbody>
              {installmentDates.map((item) => {
                const isLast = item.no === 8;
                const installmentAmount = isLast ? eighthInstallment : first7MonthsPayment;
                
                // Cumulative paid up to this installment
                const cumPaid = item.no < 8 
                  ? first7MonthsPayment * item.no 
                  : currentTotal;
                const remainingAfter = Math.max(0, currentTotal - cumPaid);

                return (
                  <tr 
                    key={item.no}
                    className={`border-b border-slate-200 dark:border-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isLast ? 'bg-amber-50/40 dark:bg-amber-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center font-mono font-bold">
                      {item.no}. Taksit
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white">
                      {item.date}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.monthName}</span>
                      {isLast && <span className="text-[10px] text-amber-700 dark:text-amber-300 ml-2 font-bold">(Son Kapanış Taksiti)</span>}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono font-black text-sm text-slate-950 dark:text-white">
                      {formatTL(installmentAmount)}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono text-slate-500 dark:text-slate-400">
                      {formatTL(remainingAfter)}
                    </td>
                    <td className="p-2.5 border border-slate-300 dark:border-slate-700 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Protokole Bağlanacak
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-900 text-white dark:bg-slate-950 font-black text-sm border-t-2 border-slate-900">
                <td className="p-3 border border-slate-700 text-center font-serif text-amber-300" colSpan={3}>
                  TOPLAM PROTOKOL ÖDEMESİ (8 TAKSİT TAMAMI)
                </td>
                <td className="p-3 border border-slate-700 text-right font-mono text-emerald-300 text-base">
                  {formatTL(currentTotal)}
                </td>
                <td className="p-3 border border-slate-700 text-right font-mono text-slate-300">
                  0,00 TL
                </td>
                <td className="p-3 border border-slate-700 text-center text-xs text-amber-300 font-sans font-normal">
                  Tamamı Kapanır
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Arabuluculuk Hukuki Güvence ve Protokol Notları */}
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-3 text-xs">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 uppercase font-serif">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Arabuluculuk Anlaşma Belgesi Hazırlarken Mutlaka Eklenmesi Gereken Şartlar:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">1. İlam Niteliğinde Belge (İİK m. 38):</span>
            Arabuluculuk son tutanağı ve anlaşma belgesi adliyeden **"İcra Edilebilirlik Şerhi"** alınarak veya avukatlarca imzalanarak doğrudan mahkeme ilamı gücüne kavuşturulmalıdır.
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">2. Muacceliyet & İcra Şartı:</span>
            "Taksitlerden herhangi biri vadesinde ödenmezse, kalan tüm taksitler hiçbir ihtar ve mehile gerek kalmaksızın derhal muaccel olur ve en yüksek mevduat faiziyle icraya konur" şartı mutlaka yazılmalıdır.
          </div>
        </div>
      </div>

    </div>
  );
};
