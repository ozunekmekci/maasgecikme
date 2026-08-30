import React, { useState, useEffect, useMemo } from 'react';
import { 
  RawPayrollRecord, 
  SalaryClaimRow, 
  SeveranceClaim, 
  AnnualLeaveClaim, 
  CompensationItem 
} from './types/payroll';
import { 
  DEFAULT_RAW_PAYROLLS, 
  DEFAULT_CALCULATION_DATE, 
  DEFAULT_ANNUAL_INTEREST_RATE,
  DEFAULT_SEVERANCE,
  DEFAULT_ANNUAL_LEAVE,
  DEFAULT_COMPENSATIONS
} from './data/defaultBordroData';
import { 
  buildSalaryClaimRows, 
  calculateSingleRow, 
  calculateCaseSummary,
  getDueDateForMonthYear,
  getTurkeyDateString,
  getMillisecondsUntilTurkeyMidnight
} from './utils/interestCalculator';
import { getTcmbRateForMonthYear } from './data/tcmbRates';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { InterestTable } from './components/InterestTable';
import { CourtCostsModule } from './components/CourtCostsModule';
import { ChartsView } from './components/ChartsView';
import { CourtReportView } from './components/CourtReportView';
import { PayrollDetailModal } from './components/PayrollDetailModal';

export const App: React.FC = () => {
  // State
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'interest' | 'court_costs' | 'analytics' | 'report'>('interest');
  
  // Interest Settings
  const [globalInterestRate, setGlobalInterestRate] = useState<number>(DEFAULT_ANNUAL_INTEREST_RATE);
  const [isTcmbGradualMode, setIsTcmbGradualMode] = useState<boolean>(false);
  const [calculationDate, setCalculationDate] = useState<string>(DEFAULT_CALCULATION_DATE);
  const [dueDay, setDueDay] = useState<number>(5);

  // Data
  const [rawRecords, setRawRecords] = useState<RawPayrollRecord[]>(DEFAULT_RAW_PAYROLLS);
  const [rows, setRows] = useState<SalaryClaimRow[]>(() => {
    return buildSalaryClaimRows(DEFAULT_RAW_PAYROLLS, DEFAULT_ANNUAL_INTEREST_RATE, DEFAULT_CALCULATION_DATE, 5);
  });

  const [severance, setSeverance] = useState<SeveranceClaim>(DEFAULT_SEVERANCE);
  const [annualLeave, setAnnualLeave] = useState<AnnualLeaveClaim>(DEFAULT_ANNUAL_LEAVE);
  const [compensations, setCompensations] = useState<CompensationItem[]>(DEFAULT_COMPENSATIONS);

  // Detail Modal
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<RawPayrollRecord | null>(null);

  // Dark Mode side effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Turkey Midnight (00:00 Europe/Istanbul) Live Rollover Effect
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    const scheduleTurkeyMidnightRollover = () => {
      const msUntilMidnight = getMillisecondsUntilTurkeyMidnight();
      
      timerId = setTimeout(() => {
        setRows(prevRows => prevRows.map(row => calculateSingleRow({ ...row })));
        scheduleTurkeyMidnightRollover();
      }, msUntilMidnight + 100);
    };

    scheduleTurkeyMidnightRollover();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // Recalculate rows when global rate, TCMB mode, calculation date or dueDay change
  useEffect(() => {
    setRows(prevRows => {
      return prevRows.map(row => {
        const rateToApply = isTcmbGradualMode 
          ? getTcmbRateForMonthYear(row.month, row.year)
          : globalInterestRate;

        const updatedRow = {
          ...row,
          annualInterestRate: rateToApply,
          calculationDate,
          dueDate: getDueDateForMonthYear(row.month, row.year, dueDay)
        };
        return calculateSingleRow(updatedRow);
      });
    });
  }, [globalInterestRate, isTcmbGradualMode, calculationDate, dueDay]);

  // Base gross for compensations (from first record or severance)
  const baseGross = rawRecords[0]?.grossSalary || 70902.23;

  // Real-time Summary
  const summary = useMemo(() => {
    return calculateCaseSummary(rows, severance, annualLeave, compensations);
  }, [rows, severance, annualLeave, compensations]);

  // Handlers
  const handleUpdateRow = (id: string, updates: Partial<SalaryClaimRow>) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.id !== id) return row;
        const rateToApply = isTcmbGradualMode 
          ? getTcmbRateForMonthYear(row.month, row.year)
          : globalInterestRate;
        const merged = { ...row, ...updates, annualInterestRate: updates.annualInterestRate || rateToApply, calculationDate };
        return calculateSingleRow(merged);
      });
    });
  };

  const handleDeleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRow = () => {
    const newMonth = rows.length > 0 ? (rows[rows.length - 1].month % 12) + 1 : 1;
    const newYear = rows.length > 0 ? (newMonth === 1 ? rows[rows.length - 1].year + 1 : rows[rows.length - 1].year) : 2026;
    const periodName = `Yeni Dönem ${newMonth}/${newYear}`;
    const dueDate = getDueDateForMonthYear(newMonth, newYear, dueDay);
    const rateToApply = isTcmbGradualMode ? getTcmbRateForMonthYear(newMonth, newYear) : globalInterestRate;

    const newRow = calculateSingleRow({
      id: `custom-pay-${Date.now()}`,
      period: periodName,
      month: newMonth,
      year: newYear,
      netSalary: 60000,
      dueDate,
      status: 'unpaid',
      calculationDate,
      delayDays: 0,
      annualInterestRate: rateToApply,
      accruedInterest: 0,
      totalClaim: 0,
      note: 'Ödenmedi'
    });

    setRows([...rows, newRow]);
  };

  const handleResetToDefaults = () => {
    setRawRecords(DEFAULT_RAW_PAYROLLS);
    setGlobalInterestRate(DEFAULT_ANNUAL_INTEREST_RATE);
    setIsTcmbGradualMode(false);
    setCalculationDate(DEFAULT_CALCULATION_DATE);
    setDueDay(5);
    setRows(buildSalaryClaimRows(DEFAULT_RAW_PAYROLLS, DEFAULT_ANNUAL_INTEREST_RATE, DEFAULT_CALCULATION_DATE, 5));
    setSeverance(DEFAULT_SEVERANCE);
    setAnnualLeave(DEFAULT_ANNUAL_LEAVE);
    setCompensations(DEFAULT_COMPENSATIONS);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Cards Overview */}
        <SummaryCards
          summary={summary}
          activeRate={isTcmbGradualMode ? 48.6 : globalInterestRate}
          severance={severance}
          annualLeave={annualLeave}
          compensations={compensations}
        />

        {/* Tab 1: Interest Calculator Table */}
        {activeTab === 'interest' && (
          <InterestTable
            rows={rows}
            severance={severance}
            setSeverance={setSeverance}
            annualLeave={annualLeave}
            setAnnualLeave={setAnnualLeave}
            compensations={compensations}
            setCompensations={setCompensations}
            summary={summary}
            globalInterestRate={globalInterestRate}
            setGlobalInterestRate={setGlobalInterestRate}
            isTcmbGradualMode={isTcmbGradualMode}
            setIsTcmbGradualMode={setIsTcmbGradualMode}
            calculationDate={calculationDate}
            setCalculationDate={setCalculationDate}
            dueDay={dueDay}
            setDueDay={setDueDay}
            onUpdateRow={handleUpdateRow}
            onDeleteRow={handleDeleteRow}
            onAddRow={handleAddRow}
            onSelectPayrollDetail={(rec) => setSelectedPayrollRecord(rec)}
            baseGross={baseGross}
          />
        )}

        {/* Tab 2: Court Fees & Costs Module */}
        {activeTab === 'court_costs' && (
          <CourtCostsModule
            grandTotalClaim={summary.grandTotalClaim}
          />
        )}

        {/* Tab 3: Payroll Analytics & Charts */}
        {activeTab === 'analytics' && (
          <ChartsView
            rows={rows}
            summary={summary}
            rawRecords={rawRecords}
          />
        )}

        {/* Tab 4: Court-ready Official Bilirkişi Report */}
        {activeTab === 'report' && (
          <CourtReportView
            rows={rows}
            severance={severance}
            annualLeave={annualLeave}
            compensations={compensations}
            summary={summary}
            calculationDate={calculationDate}
            globalInterestRate={globalInterestRate}
            rawRecord={rawRecords[0]}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white/60 dark:bg-slate-900/60 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Maaş & Gecikme Faizi Hesaplayıcı • 4857 Sayılı İş Kanunu m.34 & 492 Sayılı Harçlar Kanunu Hükümleri
        </p>
      </footer>

      {/* Modals */}
      <PayrollDetailModal
        record={selectedPayrollRecord}
        onClose={() => setSelectedPayrollRecord(null)}
      />

    </div>
  );
};
