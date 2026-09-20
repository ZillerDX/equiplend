import React, { useState } from 'react';
import { Device, UserPersona } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { CustomSelect } from './CustomSelect';
import { RotateCcw, X, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getApiUrl } from '../api';

interface ReturnModalProps {
  device: Device;
  currentUser: UserPersona;
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ device, currentUser, lang, onClose, onSuccess }) => {
  const t = TRANSLATIONS[lang];
  const [condition, setCondition] = useState(t.condPerfect);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(getApiUrl(`/api/devices/${device.id}/return`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnedBy: currentUser.name,
          condition: condition
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Return failed');
      }

      // Celebrate disciplined return
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
      setIsSubmitting(false);
    }
  };

  const isOverdue = device.expectedReturnDateUtc && new Date() > new Date(device.expectedReturnDateUtc);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <RotateCcw className="size-4 text-emerald-600 shrink-0" />
            <h3 className="text-base font-semibold text-slate-800">
              {t.returnModalTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-5 shrink-0" />
          </button>
        </div>

        <form onSubmit={handleReturn} className="p-6 space-y-4">
          <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <img
              src={device.imageUrl}
              alt={device.name}
              className="size-16 object-cover rounded-lg bg-white border border-slate-200/80 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-slate-500 font-semibold">{device.assetTag}</span>
              <h4 className="text-sm font-bold text-slate-900 truncate">{device.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{t.heldByMe}: {device.currentBorrowerName}</p>
            </div>
          </div>

          {isOverdue && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              <ShieldAlert className="size-4 shrink-0 text-rose-600" />
              <span>{lang === 'TH' ? 'อุปกรณ์นี้เกินกำหนดคืน แต่กำลังนำส่งคืน ขอบคุณที่ร่วมรักษาวินัย' : 'This device is overdue. Thank you for returning it now.'}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.conditionLabel}
            </label>
            <CustomSelect
              value={condition}
              onChange={setCondition}
              options={[
                { value: t.condPerfect, label: t.condPerfect },
                { value: t.condMinorScratch, label: t.condMinorScratch },
                { value: t.condIssue, label: t.condIssue },
                { value: t.condMissingAccessory, label: t.condMissingAccessory }
              ]}
            />
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
              {t.oneClickBannerTitle}
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-700">
              {t.oneClickBannerDesc}
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center h-10 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-lg shadow-sm shadow-emerald-200 whitespace-nowrap transition-all disabled:opacity-50 gap-2 cursor-pointer"
            >
              <RotateCcw className="size-3.5 shrink-0" />
              <span>{isSubmitting ? t.returnSubmitting : t.btnConfirmReturn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
