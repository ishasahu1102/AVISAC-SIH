import React from 'react';
import { UploadCloud, FileText, IdCard, BookOpen, Image as ImageIcon } from 'lucide-react';
import type { UploadedFiles } from '../types';
import { TRANSLATIONS } from '../constants';

type Props = {
  files: UploadedFiles;
  onFileChange: (type: keyof UploadedFiles, file: File) => void;
  onScan: () => void;
  isScanning: boolean;
  lang: string;
};

const UploadSection: React.FC<Props> = ({ files, onFileChange, onScan, isScanning, lang }) => {
  const t = TRANSLATIONS[lang]?.upload || TRANSLATIONS.en.upload;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, key: keyof UploadedFiles) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(key, file);
  };

  const handleViewFile = (file: File | null | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderFileRow = (
    label: string,
    description: string,
    icon: React.ReactNode,
    key: keyof UploadedFiles,
    accept: string
  ) => {
    const file = files[key];

    return (
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-50 p-2">{icon}</div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
            {file && (
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="truncate max-w-[200px] text-slate-700">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleViewFile(file)}
                  className="rounded-full border border-indigo-200 px-2 py-0.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  {t.view}
                </button>
              </div>
            )}
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700">
          <UploadCloud className="mr-1 h-4 w-4" />
          {file ? t.changeFile : t.upload}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFileInput(e, key)}
          />
        </label>
      </div>
    );
  };

  // ✅ Aadhaar back description: optional + only for plastic / PVC (no extra translation key)
  const aadhaarBackDescription =
    `${t.aadhaarBackDesc} ` +
    '(Only required for plastic / PVC Aadhaar cards. For normal paper Aadhaar, you can skip this upload.)';

  return (
    <section className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[3fr,2fr]">
      <div className="space-y-4">
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <IdCard className="h-5 w-5 text-indigo-600" />
            {t.title}
          </h2>
          <p className="text-sm text-slate-600">{t.subtitle}</p>

          <div className="space-y-3">
            {renderFileRow(
              t.aadhaarFront,
              t.aadhaarFrontDesc,
              <IdCard className="h-5 w-5 text-indigo-600" />,
              'aadhaar',
              'image/*'
            )}

            {renderFileRow(
              t.aadhaarBack,
              aadhaarBackDescription,
              <IdCard className="h-5 w-5 text-emerald-600" />,
              'aadhaarBack',
              'image/*'
            )}

            {renderFileRow(
              t.passbook,
              t.passbookDesc,
              <BookOpen className="h-5 w-5 text-indigo-600" />,
              'passbook',
              'image/*'
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            {t.optional}
          </h3>
          <div className="space-y-3">
            {renderFileRow(
              t.dbtForm,
              t.dbtFormDesc,
              <FileText className="h-5 w-5 text-amber-600" />,
              'dbtForm',
              'application/pdf'
            )}
            {renderFileRow(
              t.signature,
              t.signatureDesc,
              <ImageIcon className="h-5 w-5 text-sky-600" />,
              'signature',
              'image/*'
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm p-6 flex flex-col justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t.scanTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc list-inside">
            {t.scanTips.map((tip: string, i: number) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          disabled={isScanning}
          onClick={onScan}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 shadow-md"
        >
          {isScanning ? t.scanning : t.scanNow}
        </button>
      </div>
    </section>
  );
};

export default UploadSection;
