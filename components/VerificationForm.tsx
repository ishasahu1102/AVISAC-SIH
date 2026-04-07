import React from 'react';
import { FormData } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface VerificationFormProps {
  data: FormData;
  onChange: (data: FormData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  lang: string;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  data,
  onChange,
  onGenerate,
  isGenerating,
  lang,
}) => {
  const t = TRANSLATIONS[lang]?.verify || TRANSLATIONS.en.verify;

  const Field = ({ label, field }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 flex justify-between">
        {label}
        {data[field] ? (
          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {t.confident}
          </span>
        ) : (
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-sm flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {t.check}
          </span>
        )}
      </label>
      <input
        type="text"
        value={data[field] || ''}
        onChange={(e) => onChange({ ...data, [field]: e.target.value })}
        className="px-4 py-2.5 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
        <p className="text-slate-600">{t.subtitle}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Field label={t.fullName} field="fullName" />
        </div>
        <Field label={t.aadhaarNumber} field="aadhaarNumber" />
        <Field label={t.accountNumber} field="accountNumber" />
        <Field label={t.ifscCode} field="ifscCode" />
        <Field label={t.bankName} field="bankName" />
        <Field label={t.branchName} field="branchName" />
        <Field label={t.mobileNumber} field="mobileNumber" />
        <Field label={t.email} field="email" />
      </div>

      <div className="bg-indigo-50 p-6 rounded-xl border">
        <h3 className="font-semibold">{t.optionsTitle}</h3>
        {t.options.map((opt: any) => (
          <label key={opt.val} className="flex items-center gap-3 py-1">
            <input
              type="radio"
              name="dbtOption"
              checked={data.dbtOption === opt.val}
              onChange={() => onChange({ ...data, dbtOption: opt.val })}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 shadow-md"
        >
          {isGenerating ? t.generating : t.generate}
        </button>
      </div>
    </div>
  );
};

export default VerificationForm;
