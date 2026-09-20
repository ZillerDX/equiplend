import React, { useState } from 'react';
import { Device, UserPersona } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { Bell, X, Check, Mail } from 'lucide-react';
import { getApiUrl } from '../api';

interface WatchModalProps {
  device: Device;
  currentUser: UserPersona;
  lang: Language;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const WatchModal: React.FC<WatchModalProps> = ({ device, currentUser, lang, onClose, onSuccess }) => {
  const t = TRANSLATIONS[lang];
  const [email, setEmail] = useState(currentUser.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(getApiUrl(`/api/devices/${device.id}/watch`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: currentUser.name
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Subscription failed');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(email);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-amber-500 shrink-0" />
            <h3 className="text-base font-semibold text-slate-800">
              {t.watchModalTitle}
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

        <form onSubmit={handleSubscribe} className="p-6 space-y-4">
          <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <img
              src={device.imageUrl}
              alt={device.name}
              className="size-14 object-cover rounded-lg bg-white border border-slate-200/80 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-slate-500 font-semibold">{device.assetTag}</span>
              <h4 className="text-sm font-bold text-slate-900 truncate">{device.name}</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {t.statusInUse}: {device.currentBorrowerName || 'Staff Member'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.watchEmailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
              />
              <Mail className="size-4 text-slate-400 absolute left-3 top-3 shrink-0" />
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-amber-900 text-xs leading-relaxed">
            {t.watchHint}
          </div>

          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            {isSuccess ? (
              <div className="inline-flex items-center justify-center h-10 px-5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg gap-1.5">
                <Check className="size-4 shrink-0" />
                <span>{t.subscribedSuccess}</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center h-10 px-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium text-xs rounded-lg shadow-sm shadow-amber-200 whitespace-nowrap transition-all disabled:opacity-50 gap-2 cursor-pointer"
              >
                <Bell className="size-3.5 shrink-0" />
                <span>{isSubmitting ? '...' : t.btnSubscribeWatch}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
