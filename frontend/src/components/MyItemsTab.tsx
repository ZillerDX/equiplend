import React from 'react';
import { Device, UserPersona } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { RotateCcw, Clock, AlertTriangle, CheckCircle2, ShieldCheck, Box } from 'lucide-react';

interface MyItemsTabProps {
  items: Device[];
  currentUser: UserPersona;
  lang: Language;
  onReturn: (device: Device) => void;
  onBrowseMore: () => void;
}

export const MyItemsTab: React.FC<MyItemsTabProps> = ({
  items,
  currentUser,
  lang,
  onReturn,
  onBrowseMore
}) => {
  const t = TRANSLATIONS[lang];
  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-900">{t.myItemsTitle}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {items.length} {t.itemsCountUnit}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {currentUser.name} ({currentUser.email}) • {currentUser.department}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>{t.myItemsRule}</span>
        </div>
      </div>

      {items.length === 0 ? (
        /* Actionable Empty State per frontend-design standard */
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center max-w-lg mx-auto shadow-xs">
          <div className="size-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Box className="size-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {t.myItemsEmptyTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            {t.myItemsEmptyDesc}
          </p>
          <button
            type="button"
            onClick={onBrowseMore}
            className="inline-flex items-center justify-center h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-100 transition-all cursor-pointer whitespace-nowrap"
          >
            {t.browseKioskBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((device) => {
            const isOverdue = device.expectedReturnDateUtc 
              ? now > new Date(device.expectedReturnDateUtc) 
              : false;
            
            const expectedDate = device.expectedReturnDateUtc 
              ? new Date(device.expectedReturnDateUtc).toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : '-';

            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={device.imageUrl}
                      alt={device.name}
                      className="size-20 rounded-xl object-cover border border-slate-200/80 bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[11px] font-mono font-bold text-indigo-600">
                          {device.assetTag}
                        </span>
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="size-3 shrink-0" />
                            {t.overdueBadge}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="size-3 shrink-0" />
                            {t.inScheduleBadge}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate" title={device.name}>
                        {device.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {device.specs}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Location: <span className="font-medium text-slate-600">{device.locationCode || 'Central'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 mb-4 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">{t.borrowedOn}</span>
                      <span className="font-medium text-slate-700">
                        {device.borrowedAtUtc ? new Date(device.borrowedAtUtc).toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-US') : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="size-3.5 text-slate-400" />
                        {t.dueOn}
                      </span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {expectedDate}
                      </span>
                    </div>
                    {device.borrowReason && (
                      <div className="pt-1 border-t border-slate-200/60 text-[11px] text-slate-500 italic truncate">
                        "{device.borrowReason}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onReturn(device)}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-100 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="size-4 shrink-0" />
                    <span>{t.btnReturnOneClick}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
