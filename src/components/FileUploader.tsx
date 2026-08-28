import React, { useState, useRef } from 'react';
import { parsePdfFile } from '../utils/pdfParser';
import { RawPayrollRecord } from '../types/payroll';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X, FolderOpen, Sparkles } from 'lucide-react';
import { DEFAULT_RAW_PAYROLLS } from '../data/defaultBordroData';

interface FileUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onPayrollsLoaded: (payrolls: RawPayrollRecord[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  isOpen,
  onClose,
  onPayrollsLoaded
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; status: 'pending' | 'success' | 'error'; error?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    setIsLoading(true);
    const files = Array.from(fileList).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    
    setUploadedFiles(files.map(f => ({ name: f.name, status: 'pending' })));

    const parsedRecords: RawPayrollRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const record = await parsePdfFile(file);
        parsedRecords.push(record);
        setUploadedFiles(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'success' } : item));
      } catch (err: any) {
        console.error(`Error parsing ${file.name}:`, err);
        setUploadedFiles(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: err.message || 'Hata' } : item));
      }
    }

    setIsLoading(false);
    if (parsedRecords.length > 0) {
      onPayrollsLoaded(parsedRecords);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const loadDefaultFolderPayrolls = () => {
    onPayrollsLoaded(DEFAULT_RAW_PAYROLLS);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shrink-0">
              <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Bordro PDF Yükleme & Analiz
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Bordro zarflarınızı yükleyin, otomatik ayrıştırılsın
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Quick Preset Button */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-200/80 dark:border-sky-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Hazır BORDRO Klasöründeki Dosyalar (12 Ay)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Ağustos 2025 - Temmuz 2026 arasındaki 12 bordroyu tek tıkla yükleyin
                </p>
              </div>
            </div>

            <button
              onClick={loadDefaultFolderPayrolls}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition whitespace-nowrap text-center"
            >
              Klasörü Yükle
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept=".pdf,application/pdf"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 rounded-full bg-white dark:bg-slate-800 text-sky-500 shadow-sm border border-slate-200 dark:border-slate-700">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Bordro PDF dosyalarını buraya sürükleyip bırakın
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  veya bilgisayarınızdan seçmek için tıklayın
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-300">{file.name}</span>
                  </div>

                  <div>
                    {file.status === 'pending' && (
                      <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ayrıştırıldı</span>
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-semibold">
                        <AlertCircle className="w-4 h-4" />
                        <span>Hata</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
