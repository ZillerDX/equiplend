import React from 'react';
import { Device, UserPersona } from '../types';
import { TRANSLATIONS, Language, formatCategory } from '../translations';
import { Clock, User, CheckCircle2, Bell, ArrowRight, ShieldAlert, Edit2, Trash2 } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  currentUser: UserPersona;
  lang: Language;
  onBorrow: (device: Device) => void;
  onWatch: (device: Device) => void;
  onReturnDirect: (device: Device) => void;
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  currentUser,
  lang,
  onBorrow,
  onWatch,
  onReturnDirect,
  onEdit,
  onDelete
}) => {
  const t = TRANSLATIONS[lang];
  const isAvailable = device.status === 'Available';
  const isMine = device.currentBorrowerEmail?.toLowerCase() === currentUser.email.toLowerCase();
  const isAdmin = currentUser.isAdmin;
  
  // Calculate if overdue
  const isOverdue = device.expectedReturnDateUtc 
    ? new Date() > new Date(device.expectedReturnDateUtc) 
    : false;

  const formatReturnDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Watchers count
  let watchersCount = 0;
  try {
    const list = JSON.parse(device.watchlistEmailsJson || '[]');
    watchersCount = list.length;
  } catch {}

  return (
    <div className="kiosk-card rounded-2xl p-4 flex flex-col justify-between relative group">
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/60">
          <img
            src={device.imageUrl}
            alt={device.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            loading="lazy"
          />
          {/* Status Badge */}
          <div className="absolute top-2.5 left-2.5">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-emerald-700 shadow-sm border border-emerald-200/90 backdrop-blur-md">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap">{t.statusAvailable}</span>
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-rose-700 shadow-sm border border-rose-300 backdrop-blur-md">
                <ShieldAlert className="size-3.5 text-rose-600 shrink-0" />
                <span className="whitespace-nowrap">{t.statusOverdue}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-rose-700 shadow-sm border border-rose-200/90 backdrop-blur-md">
                <User className="size-3.5 text-rose-600 shrink-0" />
                <span className="whitespace-nowrap">{t.statusInUse}</span>
              </span>
            )}
          </div>

          {/* Location Code Pill */}
          {device.locationCode && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-900/70 text-slate-100 backdrop-blur-xs">
              {device.locationCode}
            </div>
          )}

          {/* Admin Management Toolbar Overlay (Shown ONLY for IT Admin) */}
          {isAdmin && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(device);
                }}
                className="size-8 rounded-lg bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                title={t.btnEditDevice}
              >
                <Edit2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(device);
                }}
                className="size-8 rounded-lg bg-white/95 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                title={t.btnDeleteDevice}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold font-mono text-indigo-600 uppercase tracking-wide">
              {device.assetTag}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {formatCategory(device.category, lang)}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={device.name}>
            {device.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed" title={device.specs}>
            {device.specs}
          </p>
        </div>
      </div>

      {/* Footer State & Action Button */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {isAvailable ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>{t.instantBorrow}</span>
              </span>
              <span className="text-[11px]">{t.noLimit}</span>
            </div>
            <button
              type="button"
              onClick={() => onBorrow(device)}
              className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-100 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{t.btnBorrow}</span>
              <ArrowRight className="size-3.5 shrink-0" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="size-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{device.currentBorrowerName}</span>
                </div>
                {isMine && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-700 font-medium shrink-0">
                    {t.heldByMe}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <div className="flex items-center gap-1">
                  <Clock className="size-3 text-slate-400 shrink-0" />
                  <span>{t.expectedReturn}</span>
                </div>
                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                  {formatReturnDate(device.expectedReturnDateUtc)}
                </span>
              </div>
            </div>

            {/* If currently logged in user holds this device -> One-click return */}
            {isMine ? (
              <button
                type="button"
                onClick={() => onReturnDirect(device)}
                className="w-full inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-100 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>{t.btnReturnDirect}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onWatch(device)}
                className="w-full inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-amber-100 transition-all cursor-pointer whitespace-nowrap"
              >
                <Bell className="size-3.5 shrink-0" />
                <span>{t.btnNotifyMe} {watchersCount > 0 ? `(${watchersCount})` : ''}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
