import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, Sparkles, X } from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  minDate?: string;
  lang?: Language;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  value, 
  onChange, 
  minDate, 
  lang = 'EN' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  // Temporary selected date state while modal is open
  const [tempDate, setTempDate] = useState<string>(value);

  // Selected date components or today
  const activeDate = tempDate ? new Date(tempDate + 'T00:00:00') : new Date();
  
  // Calendar viewing month & year
  const [viewYear, setViewYear] = useState(activeDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(activeDate.getMonth()); // 0-indexed

  // Min date limit (default today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : today;

  // Open modal handler syncs temp state
  const handleOpen = () => {
    setTempDate(value);
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setIsOpen(true);
  };

  // Quick preset options
  const presets = [
    { label: t.preset1Day, days: 1 },
    { label: t.preset3Days, days: 3 },
    { label: t.preset7Days, days: 7 },
    { label: t.preset14Days, days: 14 },
  ];

  const applyPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    setTempDate(dateStr);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setTempDate(`${yyyy}-${mm}-${dd}`);
  };

  // Confirm selection and close popup
  const handleConfirm = () => {
    if (tempDate) {
      onChange(tempDate);
    }
    setIsOpen(false);
  };

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return t.selectReturnDatePlaceholder;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Month and Weekday names
  const monthNames = lang === 'TH' 
    ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekdayNames = lang === 'TH'
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days in month calculation
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Selected date comparison
  const isSelected = (day: number) => {
    if (!tempDate) return false;
    const [y, m, d] = tempDate.split('-').map(Number);
    return viewYear === y && viewMonth + 1 === m && day === d;
  };

  const isToday = (day: number) => {
    const now = new Date();
    return viewYear === now.getFullYear() && viewMonth === now.getMonth() && day === now.getDate();
  };

  const isDisabled = (day: number) => {
    const current = new Date(viewYear, viewMonth, day);
    current.setHours(0, 0, 0, 0);
    return current < minDateObj;
  };

  return (
    <div className="w-full">
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between h-11 px-3.5 py-2 text-xs bg-white border border-slate-200/90 rounded-xl shadow-2xs hover:border-indigo-400 hover:bg-slate-50/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Calendar className="size-3.5" />
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'TH' ? 'กำหนดส่งคืน' : 'Return Date'}
            </span>
            <span className="font-semibold text-slate-800 text-xs truncate">
              {formatDisplay(value)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100/60">
            {lang === 'TH' ? 'เลือกวันที่' : 'Select'}
          </span>
          <ChevronRight className="size-3.5 text-slate-400" />
        </div>
      </button>

      {/* Screen-Centered Modal Dialog with Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Close Button */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Calendar className="size-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                  {t.datePickerModalTitle}
                </h4>
              </div>

              {/* Close Icon Button (Top-Right) */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title={t.btnClose}
              >
                <X className="size-4 shrink-0" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Quick Duration Presets */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <Sparkles className="size-3 text-indigo-500" />
                  <span>{t.quickLoanDuration}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((p) => {
                    const d = new Date();
                    d.setDate(d.getDate() + p.days);
                    const isPresetActive = tempDate === d.toISOString().split('T')[0];

                    return (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => applyPreset(p.days)}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border transition-all font-medium whitespace-nowrap cursor-pointer ${
                          isPresetActive
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                            : 'text-slate-700 bg-slate-50 hover:bg-indigo-50/60 hover:text-indigo-700 border-slate-200/80 hover:border-indigo-200'
                        }`}
                      >
                        <span>{p.label}</span>
                        {isPresetActive && <Check className="size-3 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Month Navigation */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    {monthNames[viewMonth]} {lang === 'TH' ? viewYear + 543 : viewYear}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {weekdayNames.map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`text-[10px] font-semibold py-1 ${idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}

                  {Array.from({ length: totalDays }).map((_, i) => {
                    const day = i + 1;
                    const disabled = isDisabled(day);
                    const selected = isSelected(day);
                    const currentToday = isToday(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSelectDay(day)}
                        className={`h-8 w-full rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                          selected
                            ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-200'
                            : disabled
                            ? 'text-slate-300 cursor-not-allowed bg-transparent'
                            : currentToday
                            ? 'text-indigo-600 bg-indigo-50 font-bold border border-indigo-200 hover:bg-indigo-100'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{day}</span>
                        {currentToday && !selected && (
                          <span className="absolute bottom-1 size-1 rounded-full bg-indigo-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer with Selected Date Summary & Confirm/Cancel Actions */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                  {lang === 'TH' ? 'วันที่เลือก:' : 'Selected:'}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {formatDisplay(tempDate)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-9 px-3 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  {t.btnClose}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Check className="size-3.5 shrink-0" />
                  <span>{t.btnConfirmDate}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
