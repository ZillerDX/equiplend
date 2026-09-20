import React, { useState } from 'react';
import { Device, UserPersona } from '../types';
import { TRANSLATIONS, Language, formatCategory } from '../translations';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';
import { getApiUrl } from '../api';

interface BorrowModalProps {
  device: Device;
  currentUser: UserPersona;
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({ device, currentUser, lang, onClose, onSuccess }) => {
  const t = TRANSLATIONS[lang];

  // Default expected return: 3 days from now
  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [returnDate, setReturnDate] = useState<string>(defaultDate());
  const [reason, setReason] = useState<string>(
    lang === 'TH' ? 'นำไปใช้ทดสอบระบบและทำงานประจำสัปดาห์' : 'Sprint feature testing & validation'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(getApiUrl(`/api/devices/${device.id}/borrow`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrowerName: currentUser.name,
          borrowerEmail: currentUser.email,
          borrowerDepartment: currentUser.department,
          expectedReturnDateUtc: new Date(returnDate + 'T17:00:00Z').toISOString(),
          reason: reason
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Checkout failed');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              {device.assetTag}
            </span>
            <h3 className="text-base font-semibold text-slate-800">
              {t.borrowModalTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5 shrink-0" />
          </button>
        </div>

        {/* Device Summary Card */}
        <div className="p-6">
          <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-5">
            <img
              src={device.imageUrl}
              alt={device.name}
              className="size-18 object-cover rounded-lg bg-white border border-slate-200/80 shrink-0"
            />
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">{formatCategory(device.category, lang)}</span>
              <h4 className="text-sm font-bold text-slate-900 truncate" title={device.name}>{device.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{device.specs}</p>
              <div className="mt-1 text-[11px] text-slate-400">
                {lang === 'TH' ? 'จุดจัดเก็บ:' : 'Location:'} <span className="text-slate-700 font-medium">{device.locationCode || (lang === 'TH' ? 'คลังอุปกรณ์กลาง' : 'IT Central Storage')}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleBorrow} className="space-y-4">
            {/* Borrower Profile Display */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t.borrowerProfile}
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-lg border border-slate-200 text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{currentUser.name}</div>
                  <div className="text-slate-500">{currentUser.email} • {currentUser.department}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                  <CheckCircle2 className="size-3 shrink-0" />
                  {t.verifiedBadge}
                </span>
              </div>
            </div>

            {/* Expected Return Date Picker */}
            <div className="relative z-30">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{t.expectedReturnDate}</span>
                <span className="text-[11px] text-indigo-600 font-normal">{t.returnHint}</span>
              </label>
              <CustomDatePicker
                value={returnDate}
                onChange={setReturnDate}
                lang={lang}
              />
            </div>

            {/* Borrow Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.reasonLabel}
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t.reasonPlaceholder}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* IT Policy Pill */}
            <div className="flex items-start gap-2 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-amber-900 text-xs">
              <ShieldCheck className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-semibold">{t.itPolicyTitle}</span> {t.itPolicyText}
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center h-10 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs rounded-lg shadow-sm shadow-indigo-200 whitespace-nowrap transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? t.borrowSubmitting : t.btnConfirmBorrow}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
