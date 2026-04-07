import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string | null, consent: boolean) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (canvas) {
       onSave(hasSignature ? canvas.toDataURL() : null, consent);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
       <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Digital Signature</h2>
        <p className="text-slate-600">Sign below to authorize the DBT seeding request.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[200px] bg-white cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
          <button onClick={clear} className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600">
            <Eraser className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
        <input 
          type="checkbox" 
          id="consent" 
          checked={consent} 
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <label htmlFor="consent" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
          I hereby confirm my identity and give my consent to use my Aadhaar details for the purpose of authentication and mapping to my bank account for DBT benefits as per NPCI guidelines.
        </label>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleComplete}
          disabled={!consent || !hasSignature}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all flex items-center gap-2
            ${!consent || !hasSignature 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5'}
          `}
        >
           <Check className="w-5 h-5" />
           Generate Form
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
