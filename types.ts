// types.ts

// App step flow
export enum AppStep {
  AWARENESS = 'AWARENESS',
  UPLOAD = 'UPLOAD',
  VERIFY = 'VERIFY',
  SUCCESS = 'SUCCESS',
}

// Language type used by LANGUAGES in constants.ts and Header
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// ✅ Bank type used by BANKS in constants.ts and BankGrid.tsx
export interface Bank {
  id: string;
  name: string;
  logo: string;
  caption: string;
  redirect: string;
}

// Frontend form data (what React uses for VerificationForm)
export interface FormData {
  fullName: string;
  aadhaarNumber: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  mobileNumber: string;
  email: string;
  dbtOption: 'link_new' | 'change_account' | 'dbt_only';
  signature: string | null;
  consent: boolean;

  // ✅ NEW: comes from Aadhaar back / address block, optional
  aadhaarAddress?: string;
}

// All uploaded files the app tracks
export interface UploadedFiles {
  aadhaar: File | null;      // Aadhaar front
  aadhaarBack: File | null;  // Aadhaar back (optional)
  passbook: File | null;     // Passbook first page
  signature: File | null;    // Signature image (optional)
  dbtForm: File | null;      // Optional custom DBT PDF
}
