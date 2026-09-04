import React from 'react';
import { 
  Scale, 
  Table, 
  BarChart3, 
  FileText, 
  Sun, 
  Moon, 
  RotateCcw,
  Receipt
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'interest' | 'mediation' | 'mediation_document' | 'court_costs' | 'analytics' | 'report';
  setActiveTab: (tab: 'interest' | 'mediation' | 'mediation_document' | 'court_costs' | 'analytics' | 'report') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onResetToDefaults: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onResetToDefaults
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-300 dark:border-slate-800 transition-colors shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4rem] py-2 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white border border-slate-700 shadow-sm shrink-0">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-black tracking-wide uppercase text-slate-900 dark:text-white font-serif whitespace-nowrap">
                  BİLİRKİŞİ HESAP SİSTEMİ
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  İş Kanunu m.34
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs">
                Maaş Gecikme Faizi, Arabuluculuk & Dava İcmali
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Laptop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setActiveTab('interest')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'interest'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Faiz & Alacak Tablosu</span>
            </button>

            <button
              onClick={() => setActiveTab('mediation')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'mediation'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-600 dark:text-white shadow-sm ring-2 ring-emerald-500/50'
                  : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <span className="font-serif">🤝</span>
              <span>Arabuluculuk & 8 Taksit</span>
            </button>

            <button
              onClick={() => setActiveTab('mediation_document')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'mediation_document'
                  ? 'bg-blue-800 text-white dark:bg-blue-600 dark:text-white shadow-sm ring-2 ring-blue-500/50'
                  : 'text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📄 Arabuluculuk Belgesi</span>
            </button>

            <button
              onClick={() => setActiveTab('court_costs')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'court_costs'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Dava Harç & Masrafları</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Gelişmiş Analiz</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'report'
                  ? 'bg-indigo-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bilirkişi Raporu</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={onResetToDefaults}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 text-xs font-semibold"
              title="Varsayılana Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sıfırla</span>
            </button>

            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
              title="Tema Değiştir"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>

        {/* Secondary Sub-Navbar for Mobile / Tablet (< 1024px) */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 pb-2 pt-1 border-t border-slate-200 dark:border-slate-800 font-sans">
          <button
            onClick={() => setActiveTab('interest')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'interest' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Faiz & Alacak</span>
          </button>

          <button
            onClick={() => setActiveTab('mediation')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'mediation' ? 'bg-emerald-800 text-white dark:bg-emerald-600 dark:text-white' : 'text-emerald-700 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>🤝 8 Taksit</span>
          </button>

          <button
            onClick={() => setActiveTab('mediation_document')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'mediation_document' ? 'bg-blue-800 text-white dark:bg-blue-600 dark:text-white' : 'text-blue-700 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 Anlaşma Belgesi</span>
          </button>

          <button
            onClick={() => setActiveTab('court_costs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'court_costs' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-rose-500" />
            <span>Dava Harçları</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'analytics' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analiz</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'report' ? 'bg-indigo-900 text-white dark:bg-indigo-600 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rapor</span>
          </button>
        </div>

      </div>
    </header>
  );
};
