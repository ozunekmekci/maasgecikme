import React, { useState } from 'react';
import { CaseSummary, SeveranceClaim, AnnualLeaveClaim, SalaryClaimRow } from '../types/payroll';
import { formatTL, formatDateTR } from '../utils/interestCalculator';
import { getTcmbRateForMonthYear } from '../data/tcmbRates';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Scale, 
  Calendar,
  CheckCircle2,
  Sliders,
  Type,
  ShieldCheck,
  Info
} from 'lucide-react';

interface MediationDocumentViewProps {
  rows: SalaryClaimRow[];
  summary: CaseSummary;
  severance: SeveranceClaim;
  annualLeave: AnnualLeaveClaim;
  globalInterestRate: number;
}

export const MediationDocumentView: React.FC<MediationDocumentViewProps> = ({
  rows,
  summary,
  severance,
  annualLeave,
  globalInterestRate
}) => {
  // Option: 'option1' (Taban / Faizsiz) | 'option2_fixed' (Tam Paket - %48 Faiz) | 'option2_tcmb' (Tam Paket - TCMB Kademeli)
  const [selectedOption, setSelectedOption] = useState<'option2_tcmb' | 'option2_fixed' | 'option1'>('option2_tcmb');
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<'font-serif' | 'font-sans'>('font-serif');
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic Party Information
  const workerName = isPrivacyMode ? '[GİZLİ BAŞVURAN İŞÇİ]' : 'Özün EKMEKÇİ';
  const workerTc = isPrivacyMode ? '[GİZLİ T.C. NO]' : '28832484010';
  const workerAddress = isPrivacyMode ? '[GİZLİ İKAMET ADRESİ]' : 'Kadınlar Denizi Mah. Kasım Yaman Cad. Korukent Sitesi No: 9/33 Kuşadası / AYDIN';
  const workerBank = 'QNB (QNB Finansbank) Maaş Hesabı';
  const workerIban = isPrivacyMode ? 'TR** **** **** **** **** **** **' : 'TR46 0011 1000 0000 0158 5692 66';
  
  const employerName = isPrivacyMode ? '[GİZLİ DAVALI İŞVEREN A.Ş.]' : 'Promedis Medikal Çözümler Servis ve San. Tic. A.Ş.';
  const employerTaxOffice = isPrivacyMode ? '[GİZLİ V.D.]' : 'Sarıgüllük V.D.';
  const employerTaxNo = isPrivacyMode ? '[GİZLİ VERGİ NO]' : '7330648841';
  const employerAddress = isPrivacyMode ? '[GİZLİ ŞİRKET MERKEZ ADRESİ]' : 'Saray Mah. Dr. Adnan Büyükdeniz Cad. Akkom Ofis Park 2. Blok No: 4/19 Ümraniye / İSTANBUL';
  const employerCeo = isPrivacyMode ? '[GİZLİ YÖNETİM KURULU BAŞKANI]' : 'Onur ARSLANOĞLU';

  // Dynamic Calculations (Only: Maaşlar + Faiz + Kıdem + İzin)
  const wagePrincipal = summary.totalWagePrincipalUnpaid;
  const severanceNet = severance.enabled ? severance.netSeverance : 0;
  const leaveNet = annualLeave.enabled ? annualLeave.netAmount : 0;

  // August 2025 Interest Difference
  const aug2025Row = rows.find(r => r.month === 8 && r.year === 2025);
  const aug2025Interest = aug2025Row ? aug2025Row.accruedInterest : 8358.09;

  // Total Interest: Fixed %48 vs TCMB
  const fixedInterestTotal = summary.totalWageInterest;
  
  const tcmbInterestTotal = rows.reduce((sum, r) => {
    const tRate = getTcmbRateForMonthYear(r.month, r.year);
    const accrued = r.status === 'unpaid' 
      ? (r.netSalary * (tRate / 100) * r.delayDays) / 365
      : (r.status === 'paid' && r.actualPaymentDate) 
        ? (r.netSalary * (tRate / 100) * r.delayDays) / 365 
        : 0;
    return sum + accrued;
  }, 0);

  // Totals for Packages (Strictly: Maaşlar + Faiz + Kıdem + İzin)
  // Seçenek I: Faizsiz Taban Paket (A + C + D)
  const option1Total = wagePrincipal + severanceNet + leaveNet;

  // Seçenek II.A: Tam Paket - %48 Faiz (A + B_sabit + C + D)
  const option2FixedTotal = wagePrincipal + fixedInterestTotal + severanceNet + leaveNet;

  // Seçenek II.B: Tam Paket - TCMB Faiz (A + B_tcmb + C + D)
  const option2TcmbTotal = wagePrincipal + tcmbInterestTotal + severanceNet + leaveNet;

  // Current Active Package Total
  const activePackageTotal = selectedOption === 'option1'
    ? option1Total
    : selectedOption === 'option2_fixed'
      ? option2FixedTotal
      : option2TcmbTotal;

  // Installment Calculations (1st of each month)
  const first7Payment = selectedOption === 'option1' ? 100000 : 120000;
  const eighthPayment = Math.max(0, activePackageTotal - (first7Payment * 7));

  // 8 Installments Schedule (1st of each month starting 01 October 2026)
  const installmentDates = [
    { no: 1, date: '01 Ekim 2026', opt1: 100000, opt2: 120000 },
    { no: 2, date: '01 Kasım 2026', opt1: 100000, opt2: 120000 },
    { no: 3, date: '01 Aralık 2026', opt1: 100000, opt2: 120000 },
    { no: 4, date: '01 Ocak 2027', opt1: 100000, opt2: 120000 },
    { no: 5, date: '01 Şubat 2027', opt1: 100000, opt2: 120000 },
    { no: 6, date: '01 Mart 2027', opt1: 100000, opt2: 120000 },
    { no: 7, date: '01 Nisan 2027', opt1: 100000, opt2: 120000 },
    { 
      no: 8, 
      date: '01 Mayıs 2027', 
      opt1: Math.max(0, option1Total - 700000), 
      opt2: Math.max(0, (selectedOption === 'option2_fixed' ? option2FixedTotal : option2TcmbTotal) - 840000) 
    },
  ];

  // Copy Entire Text
  const handleCopyText = () => {
    const el = document.getElementById('word-document-content');
    if (!el) return;
    navigator.clipboard.writeText(el.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  // Download Word (.doc)
  const handleDownloadWord = () => {
    const el = document.getElementById('word-document-content');
    if (!el) return;
    const htmlContent = el.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>ARABULUCULUK ANLASMA BELGESI VE ODEME PROTOKOLU</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #111; }
  h2 { font-size: 13pt; text-align: center; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
  h3 { font-size: 11.5pt; font-weight: bold; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; }
  table { border-collapse: collapse; width: 100%; margin-top: 8px; margin-bottom: 12px; }
  th, td { border: 1px solid #333; padding: 5px 8px; font-size: 9.5pt; }
  th { background-color: #f2f2f2; font-weight: bold; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .font-bold { font-weight: bold; }
  p { margin-bottom: 6px; }
</style>
</head><body>`;
    const footer = `</body></html>`;
    const completeDoc = header + htmlContent + footer;
    const blob = new Blob(['\ufeff' + completeDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arabuluculuk_Anlasma_Belgesi_${selectedOption}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Office / Word Top Control Bar (Screen Only) */}
      <div className="print:hidden bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-300 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white font-serif flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>ARABULUCULUK ANLAŞMA BELGESİ VE ÖDEME PROTOKOLÜ (WORD STİLİ)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              1 Ekim başlangıçlı 8 taksit takvimi, haklı fesih/zulüm maddesi ve yemek yardımı dahil net hakediş dökümü
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPrivacyMode(!isPrivacyMode)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold transition border ${
                isPrivacyMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
              title="Kişisel isim ve kimlik bilgilerini sansürler / gösterir"
            >
              {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isPrivacyMode ? 'Sansür Modu Açık' : 'Gerçek Bilgiler'}</span>
            </button>

            <button
              onClick={() => setFontFamily(fontFamily === 'font-serif' ? 'font-sans' : 'font-serif')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 transition"
              title="Yazı Tipini Değiştir"
            >
              <Type className="w-3.5 h-3.5" />
              <span>{fontFamily === 'font-serif' ? 'Times New Roman' : 'Calibri / Sans'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition shadow-sm"
              title="Tüm Belge Metnini Kopyala"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
            </button>

            <button
              onClick={handleDownloadWord}
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition shadow-sm"
              title="Microsoft Word (.doc) Dosyası Olarak İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Word (.doc) İndir</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-sm"
              title="Yazdır veya PDF Kaydet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>
          </div>
        </div>

        {/* Option Selector Pill Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Protokolde Geçerli Paket:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedOption('option1')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedOption === 'option1'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm ring-2 ring-slate-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <span>Seçenek I: Taban Paket (Faizsiz)</span>
              <span className="font-mono text-[11px]">({formatTL(option1Total)})</span>
            </button>

            <button
              onClick={() => setSelectedOption('option2_fixed')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedOption === 'option2_fixed'
                  ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <span>Seçenek II.A: %48 Faizli Tam Paket</span>
              <span className="font-mono text-[11px]">({formatTL(option2FixedTotal)})</span>
            </button>

            <button
              onClick={() => setSelectedOption('option2_tcmb')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedOption === 'option2_tcmb'
                  ? 'bg-indigo-700 text-white shadow-sm ring-2 ring-indigo-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Seçenek II.B: TCMB Kademeli Tam Paket</span>
              <span className="font-mono text-[11px]">({formatTL(option2TcmbTotal)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Realistic Word Document Canvas Container */}
      <div className="flex justify-center bg-slate-200 dark:bg-slate-950/80 p-2 sm:p-6 rounded-xl overflow-x-auto print:p-0 print:bg-white">
        
        {/* A4 Page Styling (Word Document Look) */}
        <article 
          id="word-document-content"
          className={`w-full max-w-[850px] min-h-[1100px] bg-white text-slate-900 p-8 sm:p-14 shadow-2xl border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none ${fontFamily} leading-relaxed text-[13px] sm:text-[14px]`}
          style={{ boxSizing: 'border-box' }}
        >
          
          {/* HEADER 1 */}
          <div className="text-center pb-4 mb-4 border-b-2 border-slate-900">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase">
              HUKUKİ DEĞERLENDİRME VE ÖN BİLGİLENDİRME TUTANAĞI
            </h2>
            <p className="text-xs text-slate-600 font-sans mt-1">
              (4857 Sayılı İş Kanunu ve 6325 Sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu Kapsamında)
            </p>
          </div>

          {/* PARTIES METADATA */}
          <div className="space-y-1.5 mb-6 text-xs sm:text-[13px] bg-slate-50/60 p-3.5 rounded border border-slate-200">
            <p><strong>Başvuran (İşçi):</strong> {workerName} (T.C. Kimlik No: {workerTc})</p>
            <p><strong>Karşı Taraf (İşveren):</strong> {employerName} (Vergi No: {employerTaxNo})</p>
            <p><strong>Görevi / Hizmet Süresi:</strong> BİYOMEDİKAL MÜHENDİSİ (Müşteri Yöneticisi / Account Manager) / 04.08.2025 – {formatDateTR(severance.terminationDate)} ({severance.serviceYears} Yıl {severance.serviceDays} Gün)</p>
            <p><strong>Uyuşmazlık Konusu:</strong> Ödenmeyen 12 aylık resmi bordro net ücret alacakları (nakdi yemek yardımı dahil), 4857 sayılı İş Kanunu m. 34 uyarınca mevduat gecikme faizi farkı, kıdem tazminatı ve kullanılmayan yıllık izin ücreti alacaklarının tasfiyesi.</p>
          </div>

          <hr className="border-slate-300 my-4" />

          {/* SECTION I: MEVCUT ALACAKLARIN RESMİ TAHAKKUK VE HUKUKİ TESPİT TABLOSU */}
          <section className="space-y-4 mb-6">
            <h3 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1">
              I. MEVCUT ALACAKLARIN RESMİ TAHAKKUK VE HUKUKİ TESPİT TABLOSU
            </h3>
            
            <p className="text-xs text-slate-700">
              Resmi bordro sistemi (PozitifSmart) ve yasal mevzuat uyarınca tahakkuk eden hak ediş dökümü aşağıdadır:
            </p>

            {/* A. 13 Aylık Net Maaş Dökümü Tablosu */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-400 text-[11px] uppercase">
                    <th className="p-1.5 border border-slate-300 text-center w-8">#</th>
                    <th className="p-1.5 border border-slate-300">Dönem</th>
                    <th className="p-1.5 border border-slate-300 text-right">Bordro Net Maaş (Yemek Dahil)</th>
                    <th className="p-1.5 border border-slate-300 text-center">Muacceliyet / Vade</th>
                    <th className="p-1.5 border border-slate-300">Durum / Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ağustos 2025 (Faiz Farkı) */}
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <td className="p-1.5 border border-slate-300 text-center font-bold">1</td>
                    <td className="p-1.5 border border-slate-300 font-bold">Ağustos 2025</td>
                    <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">47.003,29 TL</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">05.09.2025</td>
                    <td className="p-1.5 border border-slate-300 text-[11px] text-slate-700">
                      05.01.2026'da (4 ay gecikmeyle) ödendi. Yalnızca <strong>{formatTL(aug2025Interest)}</strong> mevduat faiz farkı talep edilmektedir.
                    </td>
                  </tr>

                  {/* 12 Ay Ödenmeyen Maaşlar */}
                  {rows.filter(r => r.status === 'unpaid').map((r, idx) => (
                    <tr key={r.id} className="border-b border-slate-200">
                      <td className="p-1.5 border border-slate-300 text-center font-bold">{idx + 2}</td>
                      <td className="p-1.5 border border-slate-300 font-bold">{r.period}</td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">{formatTL(r.netSalary)}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{formatDateTR(r.dueDate)}</td>
                      <td className="p-1.5 border border-slate-300 text-[11px] text-slate-700">
                        Resmi bordro tahakkuku / Ödenmedi
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Hukuki Açıklama Notu: Yemek Yardımı ve Netlik */}
            <div className="p-2.5 bg-slate-50 rounded border border-slate-300 text-[11px] text-slate-700 space-y-1">
              <p>
                <strong>Hukuki Bilgilendirme ve Dayanak:</strong> Resmi bordrolarda yer alan <em>"Net Ödeme / Toplam Hak Edilen Ücret"</em> hanesi; çıplak net çalışma ücreti ile nakdi yemek yardımının netini (aylık 8.400 TL – 9.240 TL) birlikte ihtiva etmektedir. Bu sebeple talep edilen net maaş hakedişlerine nakdi yemek yardımı tam olarak dahildir. Ayrıca 1475 sayılı Kanun m. 14 uyarınca yemek yardımı kıdem tazminatı hesabında da giydirilmiş brüt ücrete yasal olarak eklenmiştir.
              </p>
            </div>

            {/* B. Dava ve Tasfiye İcmal Tablosu (Sade ve Net) */}
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-400 text-[11px] uppercase">
                    <th className="p-2 border border-slate-300 text-center w-10">Kod</th>
                    <th className="p-2 border border-slate-300">Alacak Kalemi</th>
                    <th className="p-2 border border-slate-300 text-center">Yasal Dayanak</th>
                    <th className="p-2 border border-slate-300 text-right">Hesaplanan Net Tutar</th>
                    <th className="p-2 border border-slate-300">Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-black">A</td>
                    <td className="p-2 border border-slate-300 font-bold">12 Aylık Ödenmeyen Net Maaşlar</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">4857 s.K. m. 32, 34</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-black text-sm">{formatTL(wagePrincipal)}</td>
                    <td className="p-2 border border-slate-300 text-[11px]">Bordrolu net ücret alacakları (yemek yardımı dahil)</td>
                  </tr>

                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-black">B</td>
                    <td className="p-2 border border-slate-300 font-bold">Mevduat Gecikme Faizi Farkı</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">4857 s.K. m. 34</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-black text-sm text-rose-700">
                      {formatTL(selectedOption === 'option2_fixed' ? fixedInterestTotal : tcmbInterestTotal)}
                    </td>
                    <td className="p-2 border border-slate-300 text-[11px]">
                      {selectedOption === 'option2_fixed' ? `Sabit %${globalInterestRate} mevduat faizi` : 'Resmi TCMB ağırlıklı ortalama mevduat faizleri'} (Ağustos gecikme faizi dahil)
                    </td>
                  </tr>

                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-black">C</td>
                    <td className="p-2 border border-slate-300 font-bold">Net Kıdem Tazminatı ({severance.serviceYears} Yıl {severance.serviceDays} Gün)</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">1475 s.K. m. 14</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-black text-sm text-indigo-700">{formatTL(severanceNet)}</td>
                    <td className="p-2 border border-slate-300 text-[11px]">
                      Giydirilmiş brüt {formatTL(severance.clothedGross)} TL üzerinden yasal net alacak
                    </td>
                  </tr>

                  <tr className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-black">D</td>
                    <td className="p-2 border border-slate-300 font-bold">Kullanılmayan Yıllık İzin Ücreti (14 Gün)</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">4857 s.K. m. 59</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-black text-sm text-emerald-700">{formatTL(leaveNet)}</td>
                    <td className="p-2 border border-slate-300 text-[11px]">
                      Çıplak brüt {formatTL(annualLeave.nakedGross)} TL üzerinden yasal kesintiler sonrası net
                    </td>
                  </tr>

                  {/* PACKAGE I TOTAL */}
                  <tr className={`border-t-2 border-slate-900 ${selectedOption === 'option1' ? 'bg-amber-100 font-black' : 'bg-slate-100 font-bold'}`}>
                    <td className="p-2 border border-slate-400 text-center font-black">I</td>
                    <td className="p-2 border border-slate-400" colSpan={2}>
                      SEÇENEK I: ASGARİ TABAN TASFİYE PAKETİ (A+C+D)
                    </td>
                    <td className="p-2 border border-slate-400 text-right font-mono font-black text-sm">
                      {formatTL(option1Total)}
                    </td>
                    <td className="p-2 border border-slate-400 text-[11px]">
                      Faizsiz taban uzlaşma bedeli (Maaşlar + Kıdem + Yıllık İzin)
                    </td>
                  </tr>

                  {/* PACKAGE II TOTAL */}
                  <tr className={`border-t-2 border-slate-900 ${selectedOption !== 'option1' ? 'bg-emerald-100 font-black' : 'bg-slate-100 font-bold'}`}>
                    <td className="p-2 border border-slate-400 text-center font-black">II</td>
                    <td className="p-2 border border-slate-400" colSpan={2}>
                      SEÇENEK II: TAM HAK EDİŞ TASFİYE PAKETİ (A+B+C+D)
                    </td>
                    <td className="p-2 border border-slate-400 text-right font-mono font-black text-sm text-emerald-900">
                      {formatTL(selectedOption === 'option2_fixed' ? option2FixedTotal : option2TcmbTotal)}
                    </td>
                    <td className="p-2 border border-slate-400 text-[11px]">
                      Faizli maaşlar + mevduat faiz farkı + kıdem + yıllık izin
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-slate-300 my-4" />

          {/* SECTION II: 8 TAKSİTLİ PROTOKOL VE ÖDEME TABLOSU */}
          <section className="space-y-3 mb-6">
            <h3 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1">
              II. 8 TAKSİTLİ PROTOKOL VE ÖDEME TABLOSU (1 EKİM BAŞLANGIÇLI)
            </h3>
            <p className="text-xs text-slate-700">
              Aşağıdaki takvim, şirketin 8 aylık ödeme beyanına istinaden; <strong>01 Ekim 2026</strong> tarihi itibarıyla başlatılmış olup, her ayın 1'i vadeli, ilk 7 taksiti net yuvarlak tutarlı, bakiyesi ise 8. son aya yansıtılmış olarak düzenlenmiştir:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-400 text-[11px] uppercase">
                    <th className="p-1.5 border border-slate-300 text-center w-14">Taksit No</th>
                    <th className="p-1.5 border border-slate-300">Kesin Vade Tarihi</th>
                    <th className={`p-1.5 border border-slate-300 text-right ${selectedOption === 'option1' ? 'bg-amber-50 font-black' : ''}`}>
                      Seçenek I: Taban Paket ({formatTL(option1Total)})
                    </th>
                    <th className={`p-1.5 border border-slate-300 text-right ${selectedOption !== 'option1' ? 'bg-emerald-50 font-black' : ''}`}>
                      Seçenek II: Tam Paket ({formatTL(selectedOption === 'option2_fixed' ? option2FixedTotal : option2TcmbTotal)})
                    </th>
                    <th className="p-1.5 border border-slate-300 text-right">Kalan Bakiye (Seçilen Paket)</th>
                  </tr>
                </thead>
                <tbody>
                  {installmentDates.map((item) => {
                    const activeAmount = selectedOption === 'option1' ? item.opt1 : item.opt2;
                    const cumPaid = item.no < 8 ? (selectedOption === 'option1' ? 100000 * item.no : 120000 * item.no) : activePackageTotal;
                    const remaining = Math.max(0, activePackageTotal - cumPaid);

                    return (
                      <tr key={item.no} className="border-b border-slate-200">
                        <td className="p-1.5 border border-slate-300 text-center font-bold">{item.no}. Taksit</td>
                        <td className="p-1.5 border border-slate-300 font-bold">{item.date}</td>
                        <td className={`p-1.5 border border-slate-300 text-right font-mono ${selectedOption === 'option1' ? 'font-black text-slate-900 bg-amber-50/50' : ''}`}>
                          {formatTL(item.opt1)}
                        </td>
                        <td className={`p-1.5 border border-slate-300 text-right font-mono ${selectedOption !== 'option1' ? 'font-black text-emerald-800 bg-emerald-50/50' : ''}`}>
                          {formatTL(item.opt2)}
                        </td>
                        <td className="p-1.5 border border-slate-300 text-right font-mono text-slate-600">
                          {formatTL(remaining)}
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="bg-slate-100 font-black border-t-2 border-slate-800 text-xs">
                    <td className="p-2 border border-slate-400 text-center" colSpan={2}>TOPLAM NET</td>
                    <td className={`p-2 border border-slate-400 text-right font-mono ${selectedOption === 'option1' ? 'bg-amber-100 text-slate-950 font-black' : ''}`}>
                      {formatTL(option1Total)} NET
                    </td>
                    <td className={`p-2 border border-slate-400 text-right font-mono ${selectedOption !== 'option1' ? 'bg-emerald-100 text-emerald-950 font-black' : ''}`}>
                      {formatTL(selectedOption === 'option2_fixed' ? option2FixedTotal : option2TcmbTotal)} NET
                    </td>
                    <td className="p-2 border border-slate-400 text-right font-mono font-bold text-slate-900">
                      0,00 TL
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-slate-300 my-6" />

          {/* OFFICIAL ARABULUCULUK ANLAŞMA METNİ */}
          <div className="pt-2 text-center pb-4 mb-4 border-b-2 border-slate-900">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase">
              6325 SAYILI KANUN UYARINCA DÜZENLENEN ARABULUCULUK ANLAŞMA BELGESİ<br />
              <span className="text-sm font-bold">(RESMİ TUTANAK VE İCRAİ PROTOKOL METNİ)</span>
            </h2>
          </div>

          <div className="space-y-2 mb-6 text-xs sm:text-[13px]">
            <p><strong>BÜRO DOSYA NO:</strong> 2026 / ......</p>
            <p><strong>ARABULUCULUK NO:</strong> 2026 / ......</p>
            <p><strong>ARABULUCU:</strong> ............................................................ (Sicil No: ........)</p>
            
            <div className="pt-2 space-y-2">
              <div>
                <p><strong>1. İŞÇİ (BAŞVURAN):</strong> {workerName} (T.C. Kimlik No: {workerTc})</p>
                <p className="pl-4 text-slate-700"><em>Adres:</em> {workerAddress}</p>
                <p className="pl-4 text-slate-700"><em>Ödeme Hesabı:</em> {workerBank} – {workerIban} (Hesap Sahibi: {workerName})</p>
              </div>

              <div>
                <p><strong>2. İŞVEREN (KARŞI TARAF):</strong> {employerName}</p>
                <p className="pl-4 text-slate-700"><em>Adres:</em> {employerAddress}</p>
                <p className="pl-4 text-slate-700"><em>Vergi Dairesi / No:</em> {employerTaxOffice} / {employerTaxNo}</p>
                <p className="pl-4 text-slate-700"><em>Temsile Yetkili:</em> {employerCeo} (Yönetim Kurulu Başkanı / CEO)</p>
              </div>
            </div>

            <p className="pt-2">
              <strong>UYUŞMAZLIK KONUSU:</strong> İş ilişkisinden doğan ödenmemiş aylık ücretler (nakdi yemek yardımı dahil), mevduat gecikme faizi farkı, kıdem tazminatı ve kullanılmayan yıllık izin ücreti alacaklarının sulhen tasfiyesi.
            </p>
          </div>

          {/* CLAUSES */}
          <div className="space-y-4 text-xs sm:text-[13px] text-justify leading-relaxed">
            <h3 className="font-bold text-sm uppercase tracking-wide border-b border-slate-300 pb-1 text-center">
              ANLAŞMA ŞARTLARI VE KORUYUCU HÜKÜMLER
            </h3>

            {/* Madde 1: Haklı Fesih & Zulüm İbaresi */}
            <div>
              <p><strong>Madde 1: İş Sözleşmesinin Fesih Şekli ve Tarihi</strong></p>
              <p>
                İşçi {workerName}’nin davalı şirkette 04.08.2025 tarihinde başlayan iş sözleşmesi; 12 ay boyunca ücretlerinin ve yasal hak edişlerinin süresinde ve tam olarak ödenmemesi, çalışma koşullarının katlanılamaz biçimde ağırlaştırılması, işçinin maruz kaldığı ağır haksız muameleler ve <strong>gördüğü zulüm üzerine</strong> 4857 sayılı İş Kanunu’nun 24. maddesi uyarınca işçi tarafından haklı nedenle 05.09.2026 tarihi itibarıyla feshedilmiştir. Taraflar, feshe konu tüm uyuşmazlıkların ve işçinin gördüğü haksız muamele ve zulüm dahil her türlü manevi ve hukuki iddialarının, işbu protokolde kararlaştırılan ödemelerin eksiksiz ve süresinde yapılması kaydıyla arabuluculuk kapsamında sulhen tasfiye edileceği konusunda tam mutabakata varmışlardır.
              </p>
            </div>

            {/* Madde 2: Anlaşmaya Varılan Net Tasfiye Bedeli */}
            <div>
              <p><strong>Madde 2: Anlaşmaya Varılan Net Tasfiye Bedeli</strong></p>
              <p>
                Taraflar, yukarıda belirtilen tüm işçilik hak ve alacaklarına karşılık olmak üzere işverenin işçiye net <strong className="text-slate-950 font-black underline">{formatTL(activePackageTotal)}</strong> ödemesi hususunda tam olarak anlaşmışlardır. Bu tutara resmi bordrolarda tahakkuk etmiş olan nakdi yemek yardımı net hakedişleri tam olarak dahildir.
              </p>
            </div>

            {/* Madde 3: Ödeme Takvimi ve Vadeler (Her Ayın 1'i) */}
            <div>
              <p><strong>Madde 3: Ödeme Takvimi ve Vadeler</strong></p>
              <p>
                İşveren, Madde 2'de kabul edilen toplam borcu işçinin QNB (QNB Finansbank) nezdindeki <strong>{workerIban}</strong> IBAN numaralı maaş hesabına aşağıda belirtilen 8 (sekiz) taksit halinde nakden, defaten ve eksiksiz olarak ödeyecektir:
              </p>

              <ul className="list-disc pl-6 space-y-1 font-mono text-xs font-semibold my-2">
                <li>1. Taksit: 01 Ekim 2026 tarihinde {formatTL(first7Payment)}</li>
                <li>2. Taksit: 01 Kasım 2026 tarihinde {formatTL(first7Payment)}</li>
                <li>3. Taksit: 01 Aralık 2026 tarihinde {formatTL(first7Payment)}</li>
                <li>4. Taksit: 01 Ocak 2027 tarihinde {formatTL(first7Payment)}</li>
                <li>5. Taksit: 01 Şubat 2027 tarihinde {formatTL(first7Payment)}</li>
                <li>6. Taksit: 01 Mart 2027 tarihinde {formatTL(first7Payment)}</li>
                <li>7. Taksit: 01 Nisan 2027 tarihinde {formatTL(first7Payment)}</li>
                <li>8. Taksit (Kalan Bakiye): 01 Mayıs 2027 tarihinde {formatTL(eighthPayment)}</li>
              </ul>
            </div>

            {/* Madde 4: Netlik Klozu ve Kesinti Yasağı */}
            <div>
              <p><strong>Madde 4: Netlik Klozu ve Kesinti Yasağı</strong></p>
              <p>
                İşbu tutanakta kararlaştırılan taksit tutarları ve toplam anlaşma bedeli işçinin eline net geçecek tutarlardır. İşveren; gelir vergisi, damga vergisi, SGK işçi veya işveren primi, operasyon masrafı ya da sair adlar altında hiçbir yasal veya özel kesinti yapamaz. Doğabilecek tüm yasal vergi ve harç yükümlülükleri münhasıran işverene aittir.
              </p>
            </div>

            {/* Madde 5: Muacceliyet Şartı */}
            <div>
              <p><strong>Madde 5: Muacceliyet Şartı (İvazsız Vade Kaybı)</strong></p>
              <p>
                İşbu belgenin 3. maddesinde belirtilen taksitlerden herhangi biri vadesinde, eksik veya hiç ödenmediği takdirde; geriye kalan tüm taksitler başka hiçbir ihtarname keşidesine, mehil tayinine veya mahkeme hükmüne gerek kalmaksızın <strong>derhal ve kendiliğinden muaccel hale gelecektir</strong>. Muaccel hale gelen tüm bakiye borç tutarına, temerrüt tarihinden itibaren 4857 sayılı İş Kanunu’nun 34. maddesi uyarınca bankalarca mevduata uygulanan en yüksek mevduat faizi işletilecektir.
              </p>
            </div>

            {/* Madde 6: Kambiyo Güvencesi */}
            <div>
              <p><strong>Madde 6: Kambiyo Güvencesi (Bono / Senet Teslimi)</strong></p>
              <p>
                İşveren, işbu protokolün imza anında, ödeme tablosundaki 8 taksitin her birinin vade ve tutarına birebir uygun olarak düzenlenmiş; şirket kaşeli ve şirket temsilcisi {employerCeo} tarafından şahsi avalist sıfatıyla müteselsil kefil olarak imzalanmış <strong>8 adet kambiyo senedini (bono)</strong> işçiye teminat ve ifa uğruna teslim edecektir. Her taksit ödendikçe ilgili dönemin senedi işverene iade edilecektir. Taksitlerden birinin aksaması halinde işçi bonoları doğrudan kambiyo senetlerine özgü haciz yoluyla (İİK m. 167 vd.) takibe koyma hakkına haizdir.
              </p>
            </div>

            {/* Madde 7: Şarta Bağlı İbra */}
            <div>
              <p><strong>Madde 7: Şarta Bağlı İbra (Geciktirici Şart – TBK m. 170)</strong></p>
              <p>
                İşçi {workerName}; işvereni ancak ve ancak işbu tutanaktaki borcun tamamının, son kuruşuna kadar eksiksiz ve vadelerinde banka hesabına yatırılması şartıyla (TBK m. 170) ibra etmiş sayılacaktır. Taksitlerin kısmen veya tamamen aksaması halinde işbu ibra beyanı kendiliğinden hükümsüz kalacak; işçinin gördüğü haksız muamele ve zulüm dahil olmak üzere tüm yasal dava ve alacak hakları eksiksiz olarak canlanacaktır.
              </p>
            </div>

            {/* Madde 8: Doğrudan İlamlı İcra Gücü */}
            <div>
              <p><strong>Madde 8: Doğrudan İlamlı İcra Gücü (6325 sayılı Kanun m. 18)</strong></p>
              <p>
                İşbu anlaşma belgesi, 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu’nun 18. maddesinin 2. fıkrası uyarınca taraflarca ve arabulucu tarafından imzalanmış olup, icra edilebilirlik şerhi alınmasına gerek kalmaksızın (veya Sulh Hukuk Mahkemesinden derhal icra edilebilirlik şerhi verilmek suretiyle) <strong>İcra ve İflas Kanunu’nun 38. maddesi anlamında ilam niteliğindedir</strong>. Borcun aksaması halinde işçi, ilamlı icra takibi (İİK m. 36 vd.) yoluyla şirketin ve yetkililerin tüm banka hesapları, taşınır/taşınmaz malları ile 3. kişilerdeki hak ve alacaklarına doğrudan haciz tatbik etme yetkisine sahiptir.
              </p>
            </div>

            {/* Madde 9: Arabuluculuk Ücreti */}
            <div>
              <p><strong>Madde 9: Arabuluculuk Ücreti ve Masraflar</strong></p>
              <p>
                İşbu arabuluculuk sürecinden doğan arabuluculuk ücreti ve yasal masrafların tamamı işveren {employerName} tarafından karşılanacaktır.
              </p>
            </div>

            <p className="pt-2">
              Taraflar yukarıdaki şartları hür iradeleriyle, kanuni sonuçlarını tam olarak idrak ederek kabul etmiş ve işbu belge 3 (üç) nüsha olarak imza altına alınmıştır.
            </p>

            <p className="pt-2">Tarih: ..... / 09 / 2026</p>

            {/* SIGNATURE BLOCKS */}
            <div className="grid grid-cols-3 gap-4 pt-10 pb-6 text-center text-xs">
              <div className="space-y-12">
                <p><strong>İŞÇİ (BAŞVURAN)</strong></p>
                <div>
                  <p className="font-bold">{workerName}</p>
                  <p className="text-[11px] text-slate-500">(İmza)</p>
                </div>
              </div>

              <div className="space-y-12">
                <p><strong>İŞVEREN (KARŞI TARAF)</strong></p>
                <div>
                  <p className="font-bold">{employerName}</p>
                  <p className="text-[11px] text-slate-600">Yetkili: {employerCeo}</p>
                  <p className="text-[11px] text-slate-500">(Şirket Kaşesi & İmza)</p>
                </div>
              </div>

              <div className="space-y-12">
                <p><strong>ARABULUCU</strong></p>
                <div>
                  <p className="font-bold">.........................................</p>
                  <p className="text-[11px] text-slate-500">(Sicil No, Kaşe & İmza)</p>
                </div>
              </div>
            </div>

          </div>

        </article>
      </div>

    </div>
  );
};
