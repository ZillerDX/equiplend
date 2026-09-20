import React, { useState, useEffect } from 'react';
import { Device, AuditLog, SystemStats, USER_PERSONAS, UserPersona } from './types';
import { TRANSLATIONS, Language } from './translations';
import { DeviceCard } from './components/DeviceCard';
import { BorrowModal } from './components/BorrowModal';
import { ReturnModal } from './components/ReturnModal';
import { WatchModal } from './components/WatchModal';
import { MyItemsTab } from './components/MyItemsTab';
import { AuditLogsTab } from './components/AuditLogsTab';
import { DeviceUpsertModal } from './components/DeviceUpsertModal';
import { getApiUrl } from './api';
import { 
  Search, 
  Layers, 
  Box, 
  UserCheck, 
  Clock, 
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Globe,
  ShieldCheck,
  Plus,
  SlidersHorizontal,
  User
} from 'lucide-react';

export const App: React.FC = () => {
  // 1. Language state: Default EN as requested
  const [lang, setLang] = useState<Language>('EN');
  const t = TRANSLATIONS[lang];

  // 2. Persona state: Default Somchai (regular employee), or IT Admin (Alex Vance)
  const [currentUser, setCurrentUser] = useState<UserPersona>(USER_PERSONAS[0]); 
  const [devices, setDevices] = useState<Device[]>([]);
  const [myItems, setMyItems] = useState<Device[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: 'catalog' | 'my-items' | 'audit' | 'admin'
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-items' | 'audit' | 'admin'>('catalog');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [borrowTarget, setBorrowTarget] = useState<Device | null>(null);
  const [returnTarget, setReturnTarget] = useState<Device | null>(null);
  const [watchTarget, setWatchTarget] = useState<Device | null>(null);
  
  // Admin Upsert Modal (New or Edit)
  const [upsertDevice, setUpsertDevice] = useState<Device | null | 'NEW'>(null);
  // Delete confirm modal target
  const [deleteTarget, setDeleteTarget] = useState<Device | null>(null);

  // Dropdown states
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Categories list definition
  const categories = [
    { key: 'All', label: t.catAll },
    { key: 'โน้ตบุ๊กและคอมพิวเตอร์', label: t.catLaptops },
    { key: 'เครื่องเทสต์มือถือ', label: t.catTestDevices },
    { key: 'จอและด็อกกิ้ง', label: t.catMonitors },
    { key: 'สายแปลงและอุปกรณ์เสริม', label: t.catAdapters },
    { key: 'อุปกรณ์ทดลองพิเศษ (XR/VR)', label: t.catXR },
    { key: 'แท็บเล็ตและอุปกรณ์วาด', label: t.catTablets }
  ];

  // Fetch all devices
  const fetchDevices = async () => {
    try {
      const baseUrl = getApiUrl('/api/devices');
      const url = new URL(baseUrl, window.location.origin);
      if (selectedCategory !== 'All' && selectedCategory !== 'ทั้งหมด') {
        url.searchParams.set('category', selectedCategory);
      }
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());
      if (statusFilter !== 'All') url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (err) {
      console.error('Failed to fetch devices', err);
    }
  };

  // Fetch user's held items
  const fetchMyItems = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/my-items?email=${encodeURIComponent(currentUser.email)}`));
      if (res.ok) {
        const data = await res.json();
        setMyItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch my items', err);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(getApiUrl('/api/audit-logs'));
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  };

  // Fetch system stats
  const fetchStats = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/stats'));
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  // Trigger manual background cron
  const triggerOverdueCron = async () => {
    const res = await fetch(getApiUrl('/api/admin/trigger-overdue-check'), { method: 'POST' });
    const data = await res.json();
    showToast(`${t.toastCronSuccess} ${data.overdueCount}`);
    fetchDevices();
    fetchMyItems();
    fetchStats();
    return data;
  };

  // Delete device action (IT Admin only)
  const handleDeleteDevice = async (device: Device) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/devices/${device.id}`), { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete');
      }
      showToast(`${t.toastDeviceDeleted}: ${device.name}`);
      setDeleteTarget(null);
      fetchDevices();
      fetchAuditLogs();
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Switch language toggle
  const toggleLanguage = () => {
    setLang((prev) => (prev === 'EN' ? 'TH' : 'EN'));
  };

  // Initial and reactive effects
  useEffect(() => {
    fetchDevices();
  }, [selectedCategory, statusFilter, searchQuery]);

  useEffect(() => {
    fetchMyItems();
  }, [currentUser]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchDevices(), fetchMyItems(), fetchAuditLogs(), fetchStats()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const refreshAll = () => {
    fetchDevices();
    fetchMyItems();
    fetchAuditLogs();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top App Header / Kiosk Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Kiosk Title */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="EquipLend Logo" 
              className="size-10 rounded-xl object-contain shadow-xs border border-slate-200/60" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  {t.appTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Toolbar: Language Switcher (EN/TH) + Persona Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Language Toggle Button (Default EN) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 h-9 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              title="Toggle English / ภาษาไทย"
            >
              <Globe className="size-3.5 text-indigo-600 shrink-0" />
              <span className={lang === 'EN' ? 'text-indigo-600 font-bold' : 'text-slate-400'}>EN</span>
              <span className="text-slate-300">/</span>
              <span className={lang === 'TH' ? 'text-indigo-600 font-bold' : 'text-slate-400'}>TH</span>
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                className="flex items-center gap-2.5 h-10 px-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl transition-all text-xs cursor-pointer"
              >
                <div className={`size-6 rounded-lg ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 leading-tight">{currentUser.name}</span>
                    {currentUser.isAdmin && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{currentUser.role}</div>
                </div>
                <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${isPersonaOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPersonaOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsPersonaOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-72 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 animate-in fade-in">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t.switchPersona}
                    </div>
                    <div className="space-y-1 mt-1">
                      {USER_PERSONAS.map((user) => (
                        <button
                          key={user.email}
                          type="button"
                          onClick={() => {
                            setCurrentUser(user);
                            if (!user.isAdmin && (activeTab === 'admin' || activeTab === 'audit')) {
                              setActiveTab('catalog');
                            }
                            setIsPersonaOpen(false);
                            showToast(`${t.toastSwitchedUser} ${user.name}`);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                            currentUser.email === user.email 
                              ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`size-6 rounded-lg ${user.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{user.name}</span>
                              {user.isAdmin && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded ml-1 shrink-0">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{user.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top duration-200 border border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-3 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs (Kiosk Menu) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="inline-flex p-1 bg-slate-200/60 rounded-xl">
            {/* Tab 1: Catalog */}
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'catalog' ? 'tab-active' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="size-3.5 shrink-0" />
              <span>{t.tabCatalog}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
                {devices.length}
              </span>
            </button>

            {/* Tab 2: My Held Items */}
            <button
              type="button"
              onClick={() => setActiveTab('my-items')}
              className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'my-items' ? 'tab-active' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="size-3.5 shrink-0" />
              <span>{t.tabMyItems}</span>
              {myItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-bold">
                  {myItems.length}
                </span>
              )}
            </button>

            {/* Tab 3: Audit & Operations Log (IT Admin Only) */}
            {currentUser.isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('audit');
                  fetchAuditLogs();
                  fetchStats();
                }}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'audit' ? 'tab-active' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="size-3.5 shrink-0" />
                <span>{t.tabAudit}</span>
              </button>
            )}

            {/* Tab 4: IT Admin Console (Shown ONLY if current persona is Admin) */}
            {currentUser.isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'admin' ? 'tab-active text-indigo-700' : 'text-indigo-600 hover:text-indigo-900'
                }`}
              >
                <ShieldCheck className="size-3.5 shrink-0 text-indigo-600" />
                <span>{t.tabAdmin}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                  Admin
                </span>
              </button>
            )}
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2">
            {/* IT Admin quick Add Button (shown in header if Admin) */}
            {currentUser.isAdmin && (
              <button
                type="button"
                onClick={() => setUpsertDevice('NEW')}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="size-3.5 shrink-0" />
                <span>{t.btnAddNewDevice}</span>
              </button>
            )}

            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="size-3.5 shrink-0" />
              <span>{t.refreshBtn}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Device Catalog */}
        {activeTab === 'catalog' && (
          <div className="space-y-5">
            {/* Search & Status Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-3 shrink-0" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'All'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <SlidersHorizontal className="size-3.5 shrink-0" />
                  <span>{t.filterAllStatus}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Available')}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-700 border border-slate-200/80'
                  }`}
                >
                  <CheckCircle2 className={`size-3.5 shrink-0 ${statusFilter === 'Available' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{t.filterAvailable}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Borrowed')}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Borrowed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-rose-50/60 hover:text-rose-700 border border-slate-200/80'
                  }`}
                >
                  <User className={`size-3.5 shrink-0 ${statusFilter === 'Borrowed' ? 'text-white' : 'text-rose-600'}`} />
                  <span>{t.filterBorrowed}</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Devices Grid */}
            {isLoading ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="kiosk-card rounded-2xl p-4 animate-pulse">
                    <div className="aspect-4/3 rounded-xl bg-slate-200 mb-3" />
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-10 bg-slate-200 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : devices.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center max-w-md mx-auto shadow-xs">
                <Box className="size-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">{t.emptyCatalogTitle}</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">{t.emptyCatalogDesc}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setStatusFilter('All');
                  }}
                  className="inline-flex items-center justify-center h-9 px-4 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {t.btnClearFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    currentUser={currentUser}
                    lang={lang}
                    onBorrow={(d) => setBorrowTarget(d)}
                    onWatch={(d) => setWatchTarget(d)}
                    onReturnDirect={(d) => setReturnTarget(d)}
                    onEdit={(d) => setUpsertDevice(d)}
                    onDelete={(d) => setDeleteTarget(d)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Held Items */}
        {activeTab === 'my-items' && (
          <MyItemsTab
            items={myItems}
            currentUser={currentUser}
            lang={lang}
            onReturn={(device) => setReturnTarget(device)}
            onBrowseMore={() => setActiveTab('catalog')}
          />
        )}

        {/* Tab 3: IT Audit Log & Operations (Only visible for IT Admin) */}
        {activeTab === 'audit' && currentUser.isAdmin && (
          <AuditLogsTab
            logs={auditLogs}
            stats={stats}
            lang={lang}
            onRefreshLogs={fetchAuditLogs}
            onTriggerCron={triggerOverdueCron}
          />
        )}

        {/* Tab 4: IT Admin Hardware Management (Only visible for IT Admin) */}
        {activeTab === 'admin' && currentUser.isAdmin && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="size-5 text-indigo-600 shrink-0" />
                  <h2 className="text-base font-bold text-slate-900">{t.adminSectionTitle}</h2>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl">
                  {t.adminSectionDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUpsertDevice('NEW')}
                className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-100 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="size-4 shrink-0" />
                <span>{t.btnAddNewDevice}</span>
              </button>
            </div>

            {/* Inventory Table for Admin */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="px-5 py-3">{t.thHardware}</th>
                      <th className="px-5 py-3">{t.thAssetTag}</th>
                      <th className="px-5 py-3">{t.thNameSpecs}</th>
                      <th className="px-5 py-3">{t.thLocationSerial}</th>
                      <th className="px-5 py-3">{t.thStatus}</th>
                      <th className="px-5 py-3 text-right">{t.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {devices.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3">
                          <img
                            src={d.imageUrl}
                            alt={d.name}
                            className="size-12 rounded-lg object-cover border border-slate-200"
                          />
                        </td>
                        <td className="px-5 py-3 font-mono font-bold text-indigo-600">
                          {d.assetTag}
                        </td>
                        <td className="px-5 py-3 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">{d.name}</div>
                          <div className="text-slate-400 text-[11px] line-clamp-1">{d.specs}</div>
                        </td>
                        <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                          <div>{d.locationCode || 'Central'}</div>
                          <div className="text-slate-400">{d.serialNumber || '-'}</div>
                        </td>
                        <td className="px-5 py-3">
                          {d.status === 'Available' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                              <span>{t.statusAvailable}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <User className="size-3 text-rose-600 shrink-0" />
                              <span>{t.statusInUse} ({d.currentBorrowerName})</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setUpsertDevice(d)}
                              className="px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              {t.btnEditDevice}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(d)}
                              className="px-2.5 py-1.5 text-[11px] font-medium text-rose-600 hover:text-rose-700 bg-rose-50/60 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              {t.btnDeleteDevice}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Borrow Modal */}
      {borrowTarget && (
        <BorrowModal
          device={borrowTarget}
          currentUser={currentUser}
          lang={lang}
          onClose={() => setBorrowTarget(null)}
          onSuccess={() => {
            setBorrowTarget(null);
            showToast(`${t.toastBorrowSuccess}: ${borrowTarget.name}`);
            refreshAll();
          }}
        />
      )}

      {/* Return Modal */}
      {returnTarget && (
        <ReturnModal
          device={returnTarget}
          currentUser={currentUser}
          lang={lang}
          onClose={() => setReturnTarget(null)}
          onSuccess={() => {
            setReturnTarget(null);
            showToast(`${t.toastReturnSuccess}: ${returnTarget.name}`);
            refreshAll();
          }}
        />
      )}

      {/* Watch Modal */}
      {watchTarget && (
        <WatchModal
          device={watchTarget}
          currentUser={currentUser}
          lang={lang}
          onClose={() => setWatchTarget(null)}
          onSuccess={(email) => {
            setWatchTarget(null);
            showToast(`${t.toastWatchSuccess} ${email}`);
            refreshAll();
          }}
        />
      )}

      {/* IT Admin Upsert Modal (Add/Edit Device) */}
      {upsertDevice && (
        <DeviceUpsertModal
          device={upsertDevice === 'NEW' ? null : upsertDevice}
          lang={lang}
          onClose={() => setUpsertDevice(null)}
          onSuccess={(saved) => {
            setUpsertDevice(null);
            showToast(`${t.toastDeviceSaved}: ${saved.name}`);
            refreshAll();
          }}
        />
      )}

      {/* IT Admin Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.deleteConfirmTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.deleteConfirmText}
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-mono font-bold text-indigo-600">{deleteTarget.assetTag}</span>: {deleteTarget.name}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-4 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {t.btnCancel}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDevice(deleteTarget)}
                className="h-9 px-4 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {t.btnConfirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            EquipLend • Internal IT Asset Management — C# .NET 10 Minimal API & React 19 Fluent UI
          </div>
          <div className="text-[11px] text-slate-400">
            Language: {lang} | Role: {currentUser.role}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
