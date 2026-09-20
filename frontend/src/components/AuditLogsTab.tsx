import React from 'react';
import { AuditLog, SystemStats } from '../types';
import { TRANSLATIONS, Language, formatAuditDetails } from '../translations';
import { RotateCcw, AlertTriangle, ArrowUpRight, CheckCircle2, Bell, Shield, PlusCircle, Trash2, Edit } from 'lucide-react';

interface AuditLogsTabProps {
  logs: AuditLog[];
  stats: SystemStats | null;
  lang: Language;
  onRefreshLogs: () => void;
  onTriggerCron?: () => Promise<any>;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({
  logs,
  stats,
  lang,
  onRefreshLogs
}) => {
  const t = TRANSLATIONS[lang];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'BORROW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowUpRight className="size-3 shrink-0" />
            {lang === 'TH' ? 'ยืมอุปกรณ์' : 'Checkout'}
          </span>
        );
      case 'RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3 shrink-0" />
            {lang === 'TH' ? 'ส่งคืนแล้ว' : 'Returned'}
          </span>
        );
      case 'OVERDUE_ALERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="size-3 shrink-0" />
            {lang === 'TH' ? 'เตือนเกินกำหนด' : 'Overdue Alert'}
          </span>
        );
      case 'WATCHLIST_NOTIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Bell className="size-3 shrink-0" />
            {lang === 'TH' ? 'แจ้งเตือนคิวถัดไป' : 'Watchlist Alert'}
          </span>
        );
      case 'ADMIN_ADD_DEVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <PlusCircle className="size-3 shrink-0" />
            {lang === 'TH' ? 'แอดมินเพิ่มอุปกรณ์' : 'Admin Add Asset'}
          </span>
        );
      case 'ADMIN_UPDATE_DEVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Edit className="size-3 shrink-0" />
            {lang === 'TH' ? 'แอดมินแก้ไขข้อมูล' : 'Admin Update'}
          </span>
        );
      case 'ADMIN_DELETE_DEVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="size-3 shrink-0" />
            {lang === 'TH' ? 'แอดมินลบอุปกรณ์' : 'Admin Decommission'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Metrics Bento */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">{t.metricTotal}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDevices}</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-emerald-700">{t.metricAvailable}</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.availableCount}</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-amber-700">{t.metricInUse}</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{stats.borrowedCount}</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-rose-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-rose-700">{t.metricOverdue}</div>
            <div className="text-2xl font-bold text-rose-700 mt-1">{stats.overdueCount}</div>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-indigo-600 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900">
              {t.auditTableTitle}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              {logs.length} {t.itemsCountUnit}
            </span>
            <button
              type="button"
              onClick={onRefreshLogs}
              className="inline-flex items-center justify-center size-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title={t.refreshBtn}
            >
              <RotateCcw className="size-3.5 shrink-0" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">{t.thTime}</th>
                <th className="px-5 py-3 whitespace-nowrap">{t.thAction}</th>
                <th className="px-5 py-3 whitespace-nowrap">{t.thDevice}</th>
                <th className="px-5 py-3 whitespace-nowrap">{t.thUser}</th>
                <th className="px-5 py-3">{t.thDetails}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((log) => {
                const date = new Date(log.timestampUtc);
                const timeStr = date.toLocaleTimeString(lang === 'TH' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                const dateStr = date.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-500">
                      <div>{dateStr}</div>
                      <div className="text-[11px] text-slate-400">{timeStr}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-semibold text-indigo-600">{log.assetTag}</div>
                      <div className="text-slate-800 truncate max-w-48 font-medium">{log.deviceName}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{log.performedBy}</div>
                      <div className="text-slate-400 text-[11px]">{log.borrowerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 leading-relaxed min-w-[280px]">
                      {formatAuditDetails(log.details, lang)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
