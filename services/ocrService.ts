// services/ocrService.ts
import type { FormData as FormSchema, UploadedFiles } from '../types';

type PartialFormData = Partial<FormSchema>;

/**
 * URL of your backend OCR endpoint.
 * You can change this later if your FastAPI runs on a different port or path.
 * For now, assume: POST http://localhost:8000/ocr-extract-details
 */
const BACKEND_OCR_ENDPOINT = 'http://localhost:8000/ocr-extract-details';

/**
 * Fallback mock data in case backend is not available.
 * This keeps the UI flow working while you debug.
 */
const MOCK_RESULT: PartialFormData = {
  fullName: 'Sample Applicant',
  aadhaarNumber: 'XXXX XXXX 1234',
  accountNumber: '123456789012',
  ifscCode: 'BANK0000001',
  bankName: 'Demo Bank',
  mobileNumber: '9999999999',
  email: 'applicant@example.com',
  dbtOption: 'link_new',
  consent: true,
};

/**
 * Main helper used by your app.
 * Sends Aadhaar + Passbook to backend and expects structured fields in response.
 */
export const extractFormDataFromDocuments = async (
  files: UploadedFiles
): Promise<PartialFormData> => {
  // If nothing uploaded, just return mock
  if (!files.aadhaar && !files.passbook) {
    console.warn(
      'No documents provided to extractFormDataFromDocuments. Returning mock data.'
    );
    return MOCK_RESULT;
  }

  const body = new window.FormData();
  if (files.aadhaar) body.append('aadhaar', files.aadhaar, files.aadhaar.name);
  if (files.passbook)
    body.append('passbook', files.passbook, files.passbook.name);

  try {
    const response = await fetch(BACKEND_OCR_ENDPOINT, {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        'Backend OCR failed with status',
        response.status,
        'body:',
        text
      );
      return MOCK_RESULT;
    }

    const data = await response.json();

    // Flexible handling:
    // 1) If backend returns { extractedFields: {...} }
    if (data && typeof data === 'object' && 'extractedFields' in data) {
      return (data as { extractedFields: PartialFormData }).extractedFields;
    }

    // 2) Or if backend directly returns the fields object
    return data as PartialFormData;
  } catch (error) {
    console.error('Error calling backend OCR endpoint:', error);
    return MOCK_RESULT;
  }
};
