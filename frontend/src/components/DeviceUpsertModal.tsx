import React, { useState, useRef, useEffect } from 'react';
import { Device } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { CustomSelect, SelectOption } from './CustomSelect';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link2, 
  Laptop, 
  Smartphone, 
  Monitor, 
  Cable, 
  Glasses, 
  Tablet,
  Check,
  Trash2
} from 'lucide-react';
import { getApiUrl } from '../api';

interface DeviceUpsertModalProps {
  device?: Device | null;
  lang: Language;
  onClose: () => void;
  onSuccess: (savedDevice: Device) => void;
}

export const DeviceUpsertModal: React.FC<DeviceUpsertModalProps> = ({
  device,
  lang,
  onClose,
  onSuccess
}) => {
  const t = TRANSLATIONS[lang];
  const isEdit = !!device;

  const [assetTag, setAssetTag] = useState(device?.assetTag || '');
  const [name, setName] = useState(device?.name || '');
  const [category, setCategory] = useState(device?.category || 'โน้ตบุ๊กและคอมพิวเตอร์');
  const [imageUrl, setImageUrl] = useState(device?.imageUrl || '');
  const [specs, setSpecs] = useState(device?.specs || '');
  const [locationCode, setLocationCode] = useState(device?.locationCode || 'Cabinet-A1');
  const [serialNumber, setSerialNumber] = useState(device?.serialNumber || '');

  // Image source mode: 'upload' (local file) vs 'url' (web link)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Category options with icons
  const categoryOptions: SelectOption[] = [
    {
      value: 'โน้ตบุ๊กและคอมพิวเตอร์',
      label: lang === 'TH' ? 'โน้ตบุ๊กและคอมพิวเตอร์' : 'Laptops & Workstations',
      sublabel: 'MacBook, ThinkPad, Dell Precision',
      icon: <Laptop className="size-4 text-indigo-500" />
    },
    {
      value: 'เครื่องเทสต์มือถือ',
      label: lang === 'TH' ? 'เครื่องเทสต์มือถือ' : 'Mobile QA Test Devices',
      sublabel: 'iPhone, Google Pixel, Galaxy',
      icon: <Smartphone className="size-4 text-emerald-500" />
    },
    {
      value: 'จอและด็อกกิ้ง',
      label: lang === 'TH' ? 'จอและด็อกกิ้ง' : 'Monitors & Thunderbolt Docks',
      sublabel: 'Dell UltraSharp, CalDigit TS4',
      icon: <Monitor className="size-4 text-blue-500" />
    },
    {
      value: 'สายแปลงและอุปกรณ์เสริม',
      label: lang === 'TH' ? 'สายแปลงและอุปกรณ์เสริม' : 'Adapters, Hubs & Peripherals',
      sublabel: 'USB-C Dongles, MX Master Mouse',
      icon: <Cable className="size-4 text-amber-500" />
    },
    {
      value: 'อุปกรณ์ทดลองพิเศษ (XR/VR)',
      label: lang === 'TH' ? 'อุปกรณ์ทดลองพิเศษ (XR/VR)' : 'Special R&D Devices (XR/VR)',
      sublabel: 'Apple Vision Pro, Meta Quest Dev',
      icon: <Glasses className="size-4 text-purple-500" />
    },
    {
      value: 'แท็บเล็ตและอุปกรณ์วาด',
      label: lang === 'TH' ? 'แท็บเล็ตและอุปกรณ์วาด' : 'Tablets & Graphic Stylus',
      sublabel: 'iPad Pro M4, Wacom Pad',
      icon: <Tablet className="size-4 text-rose-500" />
    }
  ];

  // Quick preset photos
  const imagePresets = [
    { label: 'MacBook Pro', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
    { label: 'iPhone Test', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80' },
    { label: 'Pixel Phone', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80' },
    { label: '4K Monitor', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80' },
    { label: 'Thunderbolt Dock', url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80' },
    { label: 'USB-C Hub', url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80' }
  ];

  // Handle local file selection and convert to Base64 data URL
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(lang === 'TH' ? 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)' : 'Please select an image file (JPG, PNG, WebP)');
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(lang === 'TH' ? 'ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB' : 'Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      assetTag: assetTag.trim(),
      name: name.trim(),
      category: category.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      specs: specs.trim(),
      locationCode: locationCode.trim(),
      serialNumber: serialNumber.trim()
    };

    try {
      const endpoint = isEdit ? `/api/admin/devices/${device!.id}` : '/api/admin/devices';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(getApiUrl(endpoint), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Operation failed');
      }

      const data = await res.json();
      onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {lang === 'TH' ? 'เฉพาะแอดมิน IT' : 'IT Admin Only'}
            </span>
            <h3 className="text-base font-bold text-slate-800">
              {isEdit ? t.modalEditTitle : t.modalAddTitle}
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Dual Image Option: Local Upload or Web URL */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {lang === 'TH' ? 'รูปภาพอุปกรณ์ไอที (Hardware Photo)' : 'Device Hardware Photo'}
              </label>

              {/* Toggle upload vs URL */}
              <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    imageMode === 'upload' 
                      ? 'bg-white text-indigo-700 font-semibold shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="size-3 shrink-0" />
                  <span>{lang === 'TH' ? 'อัปโหลดจากเครื่อง' : 'Upload File'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    imageMode === 'url' 
                      ? 'bg-white text-indigo-700 font-semibold shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Link2 className="size-3 shrink-0" />
                  <span>{lang === 'TH' ? 'ใส่ลิงก์ URL' : 'Image URL'}</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Local File Drag & Drop Upload */}
            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                    <img
                      src={imageUrl}
                      alt="Uploaded Preview"
                      className="size-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {lang === 'TH' ? 'รูปภาพพร้อมใช้งาน' : 'Image Ready'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Base64 / Local Storage
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                      >
                        {lang === 'TH' ? 'เปลี่ยนรูปภาพใหม่' : 'Replace Image'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Clear photo"
                    >
                      <Trash2 className="size-4 shrink-0" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/50'
                        : 'border-slate-300 hover:border-indigo-400 hover:bg-white bg-slate-50/50'
                    }`}
                  >
                    <div className="size-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                      <Upload className="size-5" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      {lang === 'TH' ? 'คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่' : 'Click to browse or drag & drop photo here'}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'TH' ? 'รองรับ PNG, JPG, WebP (ขนาดสูงสุด 5MB)' : 'Supports PNG, JPG, WebP (Max 5MB)'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Mode 2: Web Image URL with Live Preview & Quick Presets */
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="size-16 rounded-xl overflow-hidden bg-white border border-slate-300 shrink-0 flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Presets:</span>
                  {imagePresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className="px-2 py-0.5 text-[10px] bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields: Tag & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Asset Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.labelAssetTag}
              </label>
              <input
                type="text"
                required
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="e.g. IT-DEV-011"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
              />
            </div>

            {/* Custom Category Dropdown (Replacing unstyled native select) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.labelCategory}
              </label>
              <CustomSelect
                value={category}
                onChange={setCategory}
                options={categoryOptions}
              />
            </div>
          </div>

          {/* Device Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.labelDeviceName}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lenovo ThinkPad X1 Carbon Gen 12"
              className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>

          {/* Specs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.labelSpecs}
            </label>
            <textarea
              required
              rows={2}
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="e.g. Intel Core Ultra 7, 32GB RAM, 1TB SSD, 2.8K OLED..."
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 resize-none"
            />
          </div>

          {/* Storage Location & Serial Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.labelLocation}
              </label>
              <input
                type="text"
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                placeholder="e.g. Cabinet-A1-03"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.labelSerial}
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-9948201"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Footer Action Buttons (Modal Dismissal Hierarchy per frontend-design standard) */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs rounded-xl shadow-sm shadow-indigo-200 whitespace-nowrap transition-all disabled:opacity-50 cursor-pointer"
            >
              <Check className="size-3.5 shrink-0" />
              <span>{isEdit ? t.btnUpdateDevice : t.btnSaveDevice}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
