import { GoogleGenAI, Type } from "@google/genai";
import { FormData } from "../types";

// Helper to convert file to Base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractDataWithGemini = async (
  files: { aadhaar: File | null; passbook: File | null },
  apiKey?: string
): Promise<Partial<FormData>> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fullName: "Rahul Kumar Sharma",
          aadhaarNumber: "XXXX-XXXX-1234",
          accountNumber: "123456789012",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
          mobileNumber: "9876543210",
          email: "rahul.sample@email.com",
          dbtOption: "link_new"
        });
      }, 2000);
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const parts = [];
    
    if (files.aadhaar) {
      const aadhaarData = await fileToGenerativePart(files.aadhaar);
      parts.push({
        inlineData: {
          mimeType: files.aadhaar.type,
          data: aadhaarData
        }
      });
    }

    if (files.passbook) {
      const passbookData = await fileToGenerativePart(files.passbook);
      parts.push({
        inlineData: {
          mimeType: files.passbook.type,
          data: passbookData
        }
      });
    }

    parts.push({
      text: "Extract the following details from the provided documents: Full Name, Aadhaar Number (last 4 digits preferred or full), Account Number, IFSC Code, Bank Name, Mobile Number (if visible), Email (if visible). Return the data as a JSON object."
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            aadhaarNumber: { type: Type.STRING },
            accountNumber: { type: Type.STRING },
            ifscCode: { type: Type.STRING },
            bankName: { type: Type.STRING },
            mobileNumber: { type: Type.STRING },
            email: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as Partial<FormData>;
    }
    throw new Error("No data returned");

  } catch (error) {
    console.error("Gemini Extraction Failed:", error);
    // Fallback to mock data on error for demo robustness
    return {
      fullName: "Failed to Extract",
      aadhaarNumber: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    };
  }
};
