import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface UploadSectionProps {
  files: {
    aadhaar: File | null;
    passbook: File | null;
    dbtForm: File | null;
    signature: File | null;
  };
  onFileChange: (type: 'aadhaar' | 'passbook' | 'dbtForm' | 'signature', file: File) => void;
  onScan: () => void;
  isScanning: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  files,
  onFileChange,
  onScan,
  isScanning,
}) => {
  const [previewImages, setPreviewImages] = useState({
    aadhaar: '',
    passbook: '',
    dbtForm: '',
    signature: '',
  });

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // ensures image is small but readable
      maxWidthOrHeight: 1000, // optimum for OCR
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Compression failed:', error);
      return file; // fallback to original
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'aadhaar' | 'passbook' | 'dbtForm' | 'signature'
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    let processedFile = file;

    // Only compress if it's an image
    if (file.type.startsWith('image/')) {
      processedFile = await compressImage(file);
    }

    onFileChange(type, processedFile);

    // For images, show preview; for others (like PDF), just keep name in UI below
    if (processedFile.type.startsWith('image/')) {
      setPreviewImages((prev) => ({
        ...prev,
        [type]: URL.createObjectURL(processedFile),
      }));
    } else {
      setPreviewImages((prev) => ({
        ...prev,
        [type]: '',
      }));
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white text-sm">
            1
          </span>
          Upload Required Documents
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Please upload clear images / scanned copies. These will be used only to auto-fill your DBT
          scholarship form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aadhaar upload card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Aadhaar Card (Front)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Upload a clear image of the front side of your Aadhaar card.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'aadhaar')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
            />
            {previewImages.aadhaar && (
              <div className="mt-1">
                <p className="text-xs text-slate-500 mb-1">Preview:</p>
                <img
                  src={previewImages.aadhaar}
                  className="w-full h-40 object-contain rounded-lg border border-slate-200 bg-white"
                />
              </div>
            )}
            {files.aadhaar && !previewImages.aadhaar && (
              <p className="text-xs text-slate-500 mt-1">
                Selected: <span className="font-medium">{files.aadhaar.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Passbook upload card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Bank Passbook (First Page)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Upload the first page showing your name, account number and IFSC clearly.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'passbook')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
            />
            {previewImages.passbook && (
              <div className="mt-1">
                <p className="text-xs text-slate-500 mb-1">Preview:</p>
                <img
                  src={previewImages.passbook}
                  className="w-full h-40 object-contain rounded-lg border border-slate-200 bg-white"
                />
              </div>
            )}
            {files.passbook && !previewImages.passbook && (
              <p className="text-xs text-slate-500 mt-1">
                Selected: <span className="font-medium">{files.passbook.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Optional DBT PDF + Signature row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DBT form upload */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Optional: Bank DBT Form (PDF/Image)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            If your bank has its own DBT form, upload it here. Otherwise the default DBT form will be used.
          </p>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => handleFileUpload(e, 'dbtForm')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-900"
          />
          {files.dbtForm && (
            <p className="text-xs text-slate-500 mt-2">
              Selected: <span className="font-medium">{files.dbtForm.name}</span>
            </p>
          )}
        </div>

        {/* Signature upload */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Optional: Signature (Image)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Upload a clear photo/scan of your signature if you want it to appear on the filled form.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'signature')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-900"
          />
          {previewImages.signature && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-1">Signature Preview:</p>
              <img
                src={previewImages.signature}
                className="h-20 w-auto object-contain rounded-lg border border-slate-200 bg-white"
              />
            </div>
          )}
          {files.signature && !previewImages.signature && (
            <p className="text-xs text-slate-500 mt-2">
              Selected: <span className="font-medium">{files.signature.name}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          🔒 Your documents are processed securely using OCR only to extract data for this form. They are not shared with third parties.
        </p>
        <button
          onClick={onScan}
          disabled={isScanning}
          className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
            isScanning
              ? 'bg-indigo-300 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isScanning ? 'Scanning…' : 'Extract Details'}
        </button>
      </div>
    </section>
  );
};

export default UploadSection;
