import React, { useState } from 'react';
import Header from './Header';
import Awareness from './Awareness';
import UploadSection from './UploadSection';
import VerificationForm from './VerificationForm';
import BankGrid from './BankGrid';
import ProgressBar from './ProgressBar';

// 👇 Import enum as value, types with alias to avoid clash with browser FormData
import { AppStep } from '../types';
import type { FormData as FormState, UploadedFiles } from '../types';

import { EXTERNAL_LINKS } from '../constants';

// 🔌 Backend endpoints – HARD-CODED for local dev
// Frontend: http://localhost:4173
// Backend:  http://localhost:8000  (FastAPI)
const OCR_ENDPOINT = 'http://localhost:8000/ocr-extract-details';
const PDF_ENDPOINT = 'http://localhost:8000/fill-dbt-form';

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [step, setStep] = useState<AppStep>(AppStep.AWARENESS);

  const [files, setFiles] = useState<UploadedFiles>({
    aadhaar: null,
    aadhaarBack: null,
    passbook: null,
    signature: null,
    dbtForm: null,
  });

  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    aadhaarNumber: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    mobileNumber: '',
    email: '',
    dbtOption: 'link_new',
    signature: null,
    consent: false,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔢 Progress for ProgressBar (SIGN step is no longer used)
  const progress = (() => {
    switch (step) {
      case AppStep.AWARENESS:
        return 10;
      case AppStep.UPLOAD:
        return 40;
      case AppStep.VERIFY:
        return 80;
      case AppStep.SUCCESS:
        return 100;
      default:
        return 0;
    }
  })();

  // 🔁 File change handler for UploadSection
  const handleFileChange = (type: keyof UploadedFiles, file: File) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  // 🧠 Call backend OCR to extract fields from Aadhaar + Passbook
  const handleScan = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const formDataToSend = new FormData();
      if (files.aadhaar) formDataToSend.append('aadhaar', files.aadhaar);
      if (files.aadhaarBack)
        formDataToSend.append('aadhaar_back', files.aadhaarBack); // Aadhaar back (optional)
      if (files.passbook) formDataToSend.append('passbook', files.passbook);
      if (files.dbtForm) formDataToSend.append('dbt_form', files.dbtForm); // optional
      if (files.signature)
        formDataToSend.append('signature_image', files.signature); // optional, backend may ignore

      const res = await fetch(OCR_ENDPOINT, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OCR failed: ${text.slice(0, 200)}`);
      }

      const payload = await res.json();
      // Expecting { extractedFields: Partial<FormState>, ... } from backend
      const extracted = (payload?.extractedFields || {}) as Partial<FormState>;

      setFormData((prev) => ({
        ...prev,
        ...extracted,
      }));

      setStep(AppStep.VERIFY);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract details. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // 🧾 Generate DBT PDF directly after verification (no SignaturePad screen)
  const handleGenerateForm = async () => {
    try {
      setError(null);
      setIsGenerating(true);

      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName || '');
      formDataToSend.append('aadhaarNumber', formData.aadhaarNumber || '');
      formDataToSend.append('accountNumber', formData.accountNumber || '');
      formDataToSend.append('ifscCode', formData.ifscCode || '');
      formDataToSend.append('bankName', formData.bankName || '');
      formDataToSend.append('branchName', formData.branchName || '');
      formDataToSend.append('mobileNumber', formData.mobileNumber || '');
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('dbtOption', formData.dbtOption || 'link_new');

      // Signature & consent are optional / not used by backend for now
      formDataToSend.append('signature', formData.signature || '');
      formDataToSend.append('consent', 'true');

      // Optional DBT PDF upload – user’s own bank form
      if (files.dbtForm) {
        formDataToSend.append('dbt_form', files.dbtForm);
      }

      const res = await fetch(PDF_ENDPOINT, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`PDF generation failed: ${text.slice(0, 200)}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setStep(AppStep.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate DBT form.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ⬇️ Download handler passed into BankGrid
  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'DBT_Application_Filled.pdf';
    a.click();
  };

  // 🔁 Simple reset (if you want a "Start again" later)
  const resetFlow = () => {
    setStep(AppStep.AWARENESS);
    setFiles({
      aadhaar: null,
      aadhaarBack: null,
      passbook: null,
      signature: null,
      dbtForm: null,
    });
    setFormData({
      fullName: '',
      aadhaarNumber: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      mobileNumber: '',
      email: '',
      dbtOption: 'link_new',
      signature: null,
      consent: false,
    });
    setPdfUrl(null);
    setError(null);
  };

  // 🔙 Back button behaviour (for all steps)
  const handleBackStep = () => {
    if (step === AppStep.UPLOAD) {
      setStep(AppStep.AWARENESS);
    } else if (step === AppStep.VERIFY) {
      setStep(AppStep.UPLOAD);
    } else if (step === AppStep.SUCCESS) {
      setStep(AppStep.VERIFY);
    }
  };

  // 🔐 Placeholder: Back to Login (replace URL when login is ready)
  const handleBackToLogin = () => {
    // TODO: replace with real login route / URL
    // e.g. window.location.href = 'https://your-login-page.com';
    window.location.href = '/login';
  };

  // 🧮 Which main content to show
  const renderContent = () => {
    switch (step) {
      case AppStep.AWARENESS:
        return (
          <Awareness
            lang={currentLang}
            onStart={() => setStep(AppStep.UPLOAD)}
          />
        );

      case AppStep.UPLOAD:
        return (
          <UploadSection
            lang={currentLang}       
            files={files}
            onFileChange={handleFileChange}
            onScan={handleScan}
            isScanning={isScanning}
          />
        );

      case AppStep.VERIFY:
        return (
          <VerificationForm
            lang={currentLang}       
            data={formData}
            onChange={setFormData}
            onGenerate={handleGenerateForm}
            isGenerating={isGenerating}
          />
        );

      case AppStep.SUCCESS:
        return (
          <div className="space-y-10">
            <BankGrid
              lang={currentLang}      
              onDownload={handleDownloadPdf}
            />

            {/* Helpful links section right below BankGrid */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800">
                Helpful links for SC/ST scholarship & Aadhaar–DBT
              </h3>
              <ul className="space-y-2 text-sm text-indigo-700">
                <li>
                  <a
                    href={EXTERNAL_LINKS.centralDbtSchemes}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-indigo-900"
                  >
                    Central DBT portal – Pre & Post Matric Scholarships (SC/ST)
                  </a>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.aadhaarDbtStatus}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-indigo-900"
                  >
                    Aadhaar–Bank linking info & DBT status (guide)
                  </a>
                </li>
              </ul>

              <div className="pt-3">
                <button
                  onClick={resetFlow}
                  className="text-xs text-slate-500 underline hover:text-slate-700"
                >
                  Start a new DBT form
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,153,51,0.18) 0%, rgba(255,255,255,0.96) 50%, rgba(19,136,8,0.18) 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        canGoBack={step !== AppStep.AWARENESS}
        onBack={handleBackStep}
        onLoginClick={handleBackToLogin}
      />

      <ProgressBar percentage={progress} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100/60 p-4 sm:p-6">
          {error && (
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {isGenerating && (
            <div className="max-w-3xl mx-auto bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm p-3 rounded-lg">
              Generating your DBT form PDF. Please wait…
            </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
