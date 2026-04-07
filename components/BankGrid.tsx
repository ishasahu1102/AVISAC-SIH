import React, { useState } from 'react';
import { BANKS, EXTERNAL_LINKS, TRANSLATIONS } from '../constants';
import { ExternalLink, Download, Building } from 'lucide-react';

interface BankGridProps {
  onDownload: () => void;
  lang: string; // 🔹 Accept language prop
}

const BankGrid: React.FC<BankGridProps> = ({ onDownload, lang }) => {
  const [isListingVisible, setIsListingVisible] = useState(false);
  const t = TRANSLATIONS[lang]?.bankGrid || TRANSLATIONS.en.bankGrid;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn">
      {/* Top success card */}
      <div className="bg-emerald-50 p-10 rounded-3xl border border-emerald-100 text-center space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-emerald-800">{t.formReady}</h2>
          <p className="text-emerald-700 mt-3 max-w-2xl mx-auto">
            {t.successMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 hover:shadow-emerald-200 transition-all hover:-translate-y-1"
          >
            <Download className="w-5 h-5" />
            {t.downloadPdf}
          </button>

          <button
            onClick={() => setIsListingVisible(true)}
            className="inline-flex items-center gap-2 bg-white text-emerald-800 px-8 py-4 rounded-xl font-bold border border-emerald-200 shadow hover:border-emerald-400 hover:bg-emerald-100 transition-colors"
          >
            <Building className="w-5 h-5" />
            {t.findBankHelp}
          </button>
        </div>

        <p className="text-xs uppercase tracking-wider text-emerald-700">
          {t.completionNote}
        </p>
      </div>

      {/* Bank listing section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-800">
            {isListingVisible ? t.chooseBank : t.tapToView}
          </h3>
          <p className="text-sm text-slate-500">{t.portalDescription}</p>
        </div>

        {isListingVisible ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {BANKS.map((bank) => (
              <a
                key={bank.id}
                href={bank.redirect}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <img
                    src={bank.logo}
                    alt={`${bank.name} logo`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{bank.name}</h4>
                <p className="text-xs text-slate-500">{bank.caption}</p>
                <div className="mt-4 w-full py-2 bg-slate-50 text-indigo-600 text-xs font-bold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {t.visitPortal}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-dashed border-slate-300 rounded-2xl py-12 px-6 text-slate-500">
            {t.whenClicked}
          </div>
        )}
      </div>

      {/* Helpful links */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">{t.helpfulLinks}</h3>
        <p className="text-sm text-slate-600">{t.helpfulLinksText}</p>

        <ul className="space-y-2 text-sm">
          <li>
            📄{' '}
            <a
              href={EXTERNAL_LINKS.centralDbtSchemes}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              {t.linkCentralDbt}
            </a>
          </li>
          <li>
            💳{' '}
            <a
              href={EXTERNAL_LINKS.aadhaarDbtStatus}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              {t.linkAadhaarStatus}
            </a>
          </li>
        </ul>

        <p className="text-xs text-slate-500">{t.approvalNote}</p>
      </div>
    </div>
  );
};

export default BankGrid;
