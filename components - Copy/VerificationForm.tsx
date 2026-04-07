import React from 'react';
import { FormData } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface VerificationFormProps {
  data: FormData;
  onChange: (data: FormData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  data,
  onChange,
  onGenerate,
  isGenerating,
}) => {
  const handleChange = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const Field: React.FC<{ label: string; field: keyof FormData; type?: string }> = ({
    label,
    field,
    type = 'text',
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 flex justify-between">
        {label}
        {data[field] ? (
          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confident
          </span>
        ) : (
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-sm flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Check
          </span>
        )}
      </label>
      <input
        type={type}
        value={(data[field] as string) || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800"
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Verify Details</h2>
        <p className="text-slate-600">
          Ensure all extracted information is correct before generating your DBT form.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Field label="Full Name" field="fullName" />
        </div>
        <Field label="Aadhaar Number" field="aadhaarNumber" />
        <Field label="Account Number" field="accountNumber" />
        <Field label="IFSC Code" field="ifscCode" />
        <Field label="Bank Name" field="bankName" />
        <Field label="Branch Name" field="branchName" />
        <Field label="Mobile Number" field="mobileNumber" type="tel" />
        <Field label="Email ID" field="email" type="email" />
      </div>

      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <h3 className="font-semibold text-indigo-900 mb-4">DBT Linking Option</h3>
        <div className="space-y-3">
          {[
            { val: 'link_new', label: 'Link Aadhaar & Enable DBT (First Time)' },
            { val: 'change_account', label: 'Change DBT to this Account' },
            { val: 'dbt_only', label: 'Only Enable DBT (Aadhaar already linked)' },
          ].map((opt) => (
            <label key={opt.val} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="dbtOption"
                checked={data.dbtOption === opt.val}
                onChange={() => onChange({ ...data, dbtOption: opt.val as any })}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`
            bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg
            hover:bg-indigo-700 hover:shadow-indigo-200 transition-colors
            ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isGenerating ? 'Generating Form…' : 'Confirm & Generate Form'}
        </button>
      </div>
    </div>
  );
};

export default VerificationForm;
