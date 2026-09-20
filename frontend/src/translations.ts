export type Language = 'EN' | 'TH';

export const TRANSLATIONS = {
  EN: {
    // Header & Brand
    appTitle: "EquipLend",
    appBadge: "IT Asset Portal",
    appSubtitle: "Internal IT device borrowing system for modern offices (Zero-Training UX)",
    switchPersona: "Switch Active Persona",
    langEn: "EN",
    langTh: "TH",

    // Tabs
    tabCatalog: "Equipment Catalog",
    tabMyItems: "My Held Items",
    tabAudit: "Audit Trail",
    tabAdmin: "Device Inventory Management",
    refreshBtn: "Refresh Data",

    // Catalog & Filters
    searchPlaceholder: "Search device name, Asset Tag (e.g. IT-DEV), specs...",
    filterAllStatus: "All Status",
    filterAvailable: "Available",
    filterBorrowed: "In Use",
    catAll: "All Categories",
    catLaptops: "Laptops & Desktops",
    catTestDevices: "Mobile Test Devices",
    catMonitors: "Monitors & Docks",
    catAdapters: "Adapters & Cables",
    catXR: "Special R&D Devices (XR/VR)",
    catTablets: "Tablets & Stylus",

    // Device Card
    statusAvailable: "Available",
    statusInUse: "In Use",
    statusOverdue: "Overdue",
    instantBorrow: "Instant Checkout",
    noLimit: "No Quota Limit",
    btnBorrow: "Borrow Device",
    heldByMe: "Held by me",
    expectedReturn: "Expected Return:",
    btnReturnDirect: "Return to IT",
    btnNotifyMe: "Notify When Returned",
    btnEditDevice: "Edit Asset",
    btnDeleteDevice: "Delete",

    // Empty States & Table Headers
    emptyCatalogTitle: "No assets found",
    emptyCatalogDesc: "Try clearing your search query or category filters.",
    btnClearFilters: "Clear all filters",
    thHardware: "Hardware Preview",
    thAssetTag: "Asset Tag",
    thNameSpecs: "Name & Specs",
    thLocationSerial: "Location / Serial",
    thStatus: "Status",
    thActions: "Actions",

    // Date Picker Localization
    datePickerModalTitle: "Select Expected Return Date",
    quickLoanDuration: "Quick Loan Duration",
    orPickCalendarDate: "Or pick a specific date:",
    selectReturnDatePlaceholder: "Select return date",
    preset1Day: "Tomorrow (1 Day)",
    preset3Days: "3 Business Days",
    preset7Days: "1 Week (7 Days)",
    preset14Days: "2 Weeks (14 Days)",
    btnConfirmDate: "Confirm Date",
    btnClose: "Close",

    // Borrow Modal
    borrowModalTitle: "Confirm Device Checkout",
    borrowerProfile: "Borrower (Active Employee):",
    verifiedBadge: "Verified Identity",
    expectedReturnDate: "Expected Return Date:",
    returnHint: "System sends reminder 1 day prior",
    reasonLabel: "Purpose of Usage:",
    reasonPlaceholder: "e.g. Testing iOS Release Build, Client Demo presentation",
    itPolicyTitle: "Official IT Custody Policy:",
    itPolicyText: "This device is registered company property under IT management. You MUST return it directly to IT when finished. Never pass or lend devices directly to other colleagues without IT checking them in first.",
    btnConfirmBorrow: "Confirm Checkout Now",
    borrowSubmitting: "Processing...",

    // Return Modal
    returnModalTitle: "Check-in & Return to IT Central Hub",
    conditionLabel: "Device physical condition inspection before IT check-in:",
    condPerfect: "100% Perfect & Inspected for IT restocking",
    condMinorScratch: "Minor cosmetic wear, fully operational",
    condIssue: "Device malfunction/hardware issue, flagged for IT repair",
    condMissingAccessory: "Accessories (cable/charger) missing or damaged",
    oneClickBannerTitle: "Strict Custody Verification (Return to IT Only)",
    oneClickBannerDesc: "Returning to IT resets the chain of custody. Passing devices to other staff without IT check-in is strictly forbidden. Waiting colleagues on the watchlist will be alerted once IT logs this item back in.",
    btnConfirmReturn: "Complete Return to IT",
    returnSubmitting: "Verifying check-in...",

    // Watchlist Modal
    watchModalTitle: "Notify Me When Device is Returned to IT",
    watchEmailLabel: "Email address for priority alert notification:",
    watchHint: "When the current borrower returns this device to IT, you will immediately receive an official email notification to check it out from IT.",
    btnSubscribeWatch: "Get Notified When Returned to IT",
    subscribedSuccess: "Subscribed to IT alert list",

    // My Items Tab
    myItemsTitle: "Devices Currently In My Possession",
    itemsCountUnit: "items",
    myItemsRule: "Must be returned directly to IT. Do not transfer or pass to other colleagues without IT inspection.",
    myItemsEmptyTitle: "You currently have no devices checked out",
    myItemsEmptyDesc: "Browse the device catalog to check out monitors, mobile test devices, or dongles anytime.",
    browseKioskBtn: "Browse Equipment Catalog",
    borrowedOn: "Borrowed On:",
    dueOn: "Due Date:",
    inScheduleBadge: "On Schedule",
    overdueBadge: "Overdue",
    btnReturnOneClick: "One-Click Return",

    // Audit Tab
    schedulerTitle: ".NET BackgroundService Scheduler & Webhook Integration",
    schedulerDesc: "C# HostedService background worker runs every morning at 09:00 AM to inspect overdue assets and dispatches webhook alert events to MS Teams / Slack.",
    btnRunCronNow: "Run 09:00 AM Routine Now",
    webhookPayloadTitle: "Dispatched Webhook Payload & Background Result",
    cronRunning: "Inspecting...",
    metricTotal: "Total Devices",
    metricAvailable: "Available for Checkout",
    metricInUse: "Currently Checked Out",
    metricOverdue: "Overdue Items",
    auditTableTitle: "IT Audit Trail & Operations Log",
    thTime: "Timestamp",
    thAction: "Action",
    thDevice: "Asset & Tag",
    thUser: "Operator / Email",
    thDetails: "Audit Details",

    // Admin Device Management (CRUD)
    adminSectionTitle: "IT Admin Hardware Management Console",
    adminSectionDesc: "Exclusive portal for IT Administrators to register, update specs/images, or decommission devices.",
    btnAddNewDevice: "Register New IT Asset",
    modalAddTitle: "Register New IT Hardware",
    modalEditTitle: "Edit IT Asset Details",
    labelAssetTag: "Asset Tag (Unique):",
    labelDeviceName: "Device Name:",
    labelCategory: "Category:",
    labelImageUrl: "Hardware Image URL:",
    labelSpecs: "Technical Specifications:",
    labelLocation: "Storage Location / Shelf:",
    labelSerial: "Serial Number (Optional):",
    btnSaveDevice: "Save Device to Inventory",
    btnUpdateDevice: "Update Device",
    deleteConfirmTitle: "Confirm Deletion",
    deleteConfirmText: "Are you sure you want to remove this asset from inventory? This action will be recorded in the audit trail.",
    btnConfirmDelete: "Delete Asset",
    btnCancel: "Cancel",

    // Toasts
    toastSwitchedUser: "Switched active user to",
    toastCronSuccess: "09:00 AM routine completed! Found overdue items:",
    toastBorrowSuccess: "Successfully checked out",
    toastReturnSuccess: "Successfully returned to IT Central Hub:",
    toastWatchSuccess: "You will be alerted at",
    toastDeviceSaved: "Device saved successfully",
    toastDeviceDeleted: "Device removed from inventory"
  },
  TH: {
    // Header & Brand
    appTitle: "EquipLend",
    appBadge: "ระบบเบิก-ยืมอุปกรณ์ไอที",
    appSubtitle: "ระบบเบิก-ยืมอุปกรณ์ส่วนกลางประจำออฟฟิศ (Zero-Training UX)",
    switchPersona: "สลับโปรไฟล์ผู้ใช้งาน",
    langEn: "EN",
    langTh: "TH",

    // Tabs
    tabCatalog: "รายการอุปกรณ์ส่วนกลาง",
    tabMyItems: "ของที่ฉันถือครองอยู่",
    tabAudit: "ประวัติการใช้งาน (Audit Trail)",
    tabAdmin: "จัดการอุปกรณ์ (IT Admin)",
    refreshBtn: "อัปเดตข้อมูล",

    // Catalog & Filters
    searchPlaceholder: "ค้นหาชื่ออุปกรณ์, รหัส Asset Tag (เช่น IT-DEV), สเปก...",
    filterAllStatus: "สถานะทั้งหมด",
    filterAvailable: "พร้อมยืม",
    filterBorrowed: "มีคนใช้อยู่",
    catAll: "ทั้งหมด",
    catLaptops: "โน้ตบุ๊กและคอมพิวเตอร์",
    catTestDevices: "เครื่องเทสต์มือถือ",
    catMonitors: "จอและด็อกกิ้ง",
    catAdapters: "สายแปลงและอุปกรณ์เสริม",
    catXR: "อุปกรณ์ทดลองพิเศษ (XR/VR)",
    catTablets: "แท็บเล็ตและอุปกรณ์วาด",

    // Device Card
    statusAvailable: "พร้อมยืม",
    statusInUse: "มีคนใช้อยู่",
    statusOverdue: "เกินกำหนดคืน",
    instantBorrow: "เบิกได้ทันที",
    noLimit: "ไม่จำกัดโควต้า",
    btnBorrow: "ขอยืมอุปกรณ์",
    heldByMe: "ฉันถืออยู่",
    expectedReturn: "กำหนดคืน:",
    btnReturnDirect: "กดส่งคืนฝ่าย IT",
    btnNotifyMe: "แจ้งเตือนเมื่อคืนเข้า IT",
    btnEditDevice: "แก้ไขข้อมูล",
    btnDeleteDevice: "ลบอุปกรณ์",

    // Empty States & Table Headers
    emptyCatalogTitle: "ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข",
    emptyCatalogDesc: "ลองล้างคำค้นหาหรือเปลี่ยนตัวกรองหมวดหมู่",
    btnClearFilters: "ล้างตัวกรองทั้งหมด",
    thHardware: "รูปตัวอย่างอุปกรณ์",
    thAssetTag: "รหัสทรัพย์สิน",
    thNameSpecs: "ชื่อและสเปก",
    thLocationSerial: "จุดจัดเก็บ / หมายเลขเครื่อง",
    thStatus: "สถานะ",
    thActions: "จัดการ",

    // Date Picker Localization
    datePickerModalTitle: "เลือกกำหนดส่งคืนอุปกรณ์",
    quickLoanDuration: "ตัวเลือกระยะเวลายืมด่วน",
    orPickCalendarDate: "หรือเลือกวันที่เจาะจงในปฏิทิน:",
    selectReturnDatePlaceholder: "เลือกวันที่คืน",
    preset1Day: "พรุ่งนี้ (1 วัน)",
    preset3Days: "3 วันทำการ",
    preset7Days: "1 สัปดาห์ (7 วัน)",
    preset14Days: "2 สัปดาห์ (14 วัน)",
    btnConfirmDate: "ยืนยันวันที่คืน",
    btnClose: "ปิด",

    // Borrow Modal
    borrowModalTitle: "ยืนยันการเบิก-ยืมอุปกรณ์",
    borrowerProfile: "ผู้ขอยืม (Active Employee):",
    verifiedBadge: "ยืนยันตัวตนแล้ว",
    expectedReturnDate: "วันที่คาดว่าจะส่งคืน:",
    returnHint: "ระบบจะเตือนก่อน 1 วัน",
    reasonLabel: "วัตถุประสงค์ในการใช้งาน:",
    reasonPlaceholder: "เช่น นำไปใช้ทดสอบแอป iOS, จัดสัมมนาสาธิตระบบ",
    itPolicyTitle: "นโยบายการครอบครองทรัพย์สินไอที:",
    itPolicyText: "เมื่อใช้งานเสร็จสิ้น ต้องนำส่งคืนเข้าตู้ส่วนกลางของฝ่าย IT เท่านั้น **ห้ามส่งต่อให้เพื่อนร่วมงานคนอื่นโดยไม่ผ่านระบบไอทีเด็ดขาด** หากเกินกำหนดคืนหลัง 09:00 น. ระบบจะแจ้งเตือนอัตโนมัติผ่าน Slack/Teams",
    btnConfirmBorrow: "ยืนยันการเบิก-ยืมทันที",
    borrowSubmitting: "กำลังบันทึก...",

    // Return Modal
    returnModalTitle: "ตรวจรับและส่งคืนอุปกรณ์เข้าฝ่าย IT",
    conditionLabel: "ตรวจเช็กสภาพอุปกรณ์ก่อนส่งคืนเข้าฝ่าย IT:",
    condPerfect: "สมบูรณ์ 100% ผ่านการตรวจสภาพพร้อมเก็บเข้าตู้",
    condMinorScratch: "มีรอยขีดข่วนเล็กน้อย แต่ใช้งานได้ปกติ",
    condIssue: "อุปกรณ์เริ่มมีปัญหา แจ้ง IT ตรวจสอบก่อนให้ยืมต่อ",
    condMissingAccessory: "อุปกรณ์เสริม (สายชาร์จ/หัวแปลง) ขาดหรือหาย",
    oneClickBannerTitle: "มาตรการความปลอดภัย: ส่งคืนตรงถึงฝ่ายไอทีเท่านั้น",
    oneClickBannerDesc: "การกดส่งคืนนี้จะบันทึกการตัดความรับผิดชอบของผู้ถือครอง และนำของกลับเข้าคลัง IT หากมีเพื่อนร่วมงานต้องการใช้ต่อ เพื่อนร่วมงานต้องมากดยืมผ่านระบบไอทีเท่านั้น ห้ามส่งต่อกันเองนอกระบบ",
    btnConfirmReturn: "ยืนยันส่งคืนฝ่าย IT",
    returnSubmitting: "กำลังส่งคืน...",

    // Watchlist Modal
    watchModalTitle: "แจ้งเตือนเมื่ออุปกรณ์ถูกส่งคืนเข้า IT",
    watchEmailLabel: "อีเมลสำหรับรับข้อความแจ้งเตือนด่วน:",
    watchHint: "เมื่อผู้ถือครองคนปัจจุบันนำของมาส่งคืนเข้าฝ่ายไอทีเรียบร้อย ระบบจะส่งข้อความแจ้งเตือนให้ท่านมากดยืมเป็นคิวถัดไปผ่านระบบไอทีอย่างถูกต้อง",
    btnSubscribeWatch: "รับการแจ้งเตือนเมื่อของคืนเข้า IT",
    subscribedSuccess: "บันทึกเข้าระบบแจ้งเตือนแล้ว",

    // My Items Tab
    myItemsTitle: "ของที่ฉันถือครองอยู่",
    itemsCountUnit: "รายการ",
    myItemsRule: "ต้องส่งคืนกลับมายังฝ่ายไอทีเท่านั้น ห้ามส่งต่อให้ผู้อื่นโดยไม่ผ่านการเช็กอินของฝ่าย IT",
    myItemsEmptyTitle: "ยังไม่มีอุปกรณ์ที่ท่านถือครองอยู่",
    myItemsEmptyDesc: "ท่านสามารถเลือกเบิกอุปกรณ์เสริม จอ Monitor หรือเครื่องเทสต์มือถือจากระบบกลางได้ทันที",
    browseKioskBtn: "เลือกดูรายการอุปกรณ์",
    borrowedOn: "วันที่ยืม:",
    dueOn: "กำหนดส่งคืน:",
    inScheduleBadge: "อยู่ในกำหนดเวลา",
    overdueBadge: "เกินกำหนดคืนแล้ว",
    btnReturnOneClick: "กดส่งคืนในคลิกเดียว",

    // Audit Tab
    schedulerTitle: ".NET BackgroundService Scheduler & Webhook Integration",
    schedulerDesc: "สถาปัตยกรรม C# HostedService รันอัตโนมัติทุกเช้า 09:00 น. เพื่อสแกนหาอุปกรณ์ที่ค้างส่งคืน (Overdue) และสร้าง Webhook Event ส่งเข้า MS Teams หรือ Slack ของฝ่ายไอทีทันที",
    btnRunCronNow: "เรียกทำงานรอบ 09:00 น. ทันที",
    webhookPayloadTitle: "ข้อมูล Webhook และผลการทำงาน Background Worker",
    cronRunning: "กำลังประมวลผล...",
    metricTotal: "อุปกรณ์ทั้งหมดในระบบ",
    metricAvailable: "พร้อมเบิกใช้งาน",
    metricInUse: "กำลังถูกยืมใช้งาน",
    metricOverdue: "เกินกำหนดคืน (Overdue)",
    auditTableTitle: "บันทึกประวัติการเบิก-ยืมและการตรวจสอบ (IT Audit Trail)",
    thTime: "เวลา (Timestamp)",
    thAction: "การกระทำ (Action)",
    thDevice: "รหัสและอุปกรณ์",
    thUser: "ผู้ดำเนินการ / อีเมล",
    thDetails: "รายละเอียด (Audit Details)",

    // Admin Device Management (CRUD)
    adminSectionTitle: "แผงควบคุมฝ่ายไอที (IT Admin Hardware Console)",
    adminSectionDesc: "เฉพาะสำหรับเจ้าหน้าที่ IT Admin ในการลงทะเบียน เพิ่ม ลบ แก้ไขสเปก รูปภาพ และตรวจสอบคลังอุปกรณ์",
    btnAddNewDevice: "ลงทะเบียนอุปกรณ์ใหม่",
    modalAddTitle: "ลงทะเบียนอุปกรณ์ใหม่เข้าระบบ",
    modalEditTitle: "แก้ไขข้อมูลอุปกรณ์",
    labelAssetTag: "รหัสทรัพย์สิน (Asset Tag):",
    labelDeviceName: "ชื่ออุปกรณ์:",
    labelCategory: "หมวดหมู่:",
    labelImageUrl: "ลิงก์รูปภาพอุปกรณ์ (URL):",
    labelSpecs: "รายละเอียดสเปก:",
    labelLocation: "จุดจัดเก็บ / ตู้ล็อกเกอร์:",
    labelSerial: "หมายเลขเครื่อง (Serial Number):",
    btnSaveDevice: "บันทึกอุปกรณ์เข้าคลัง",
    btnUpdateDevice: "อัปเดตข้อมูลอุปกรณ์",
    deleteConfirmTitle: "ยืนยันการลบอุปกรณ์",
    deleteConfirmText: "ท่านแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์นี้ออกจากระบบ? ประวัติจะถูกบันทึกใน Audit Trail",
    btnConfirmDelete: "ลบอุปกรณ์ถาวร",
    btnCancel: "ยกเลิก",

    // Toasts
    toastSwitchedUser: "สลับใช้งานเป็น",
    toastCronSuccess: "ตรวจสอบรอบ 09:00 น. สำเร็จ พบอุปกรณ์ค้างคืน:",
    toastBorrowSuccess: "ทำรายการยืมเรียบร้อยแล้ว:",
    toastReturnSuccess: "ส่งคืนฝ่าย IT เรียบร้อย:",
    toastWatchSuccess: "ระบบจะแจ้งเตือนไปยัง",
    toastDeviceSaved: "บันทึกอุปกรณ์เรียบร้อยแล้ว",
    toastDeviceDeleted: "ลบอุปกรณ์ออกจากระบบเรียบร้อย"
  }
};

/**
 * Format category according to current language
 */
export const formatCategory = (category: string, lang: Language): string => {
  if (!category) return '';
  const map: Record<string, { EN: string; TH: string }> = {
    'โน้ตบุ๊กและคอมพิวเตอร์': { EN: 'Laptops & Desktops', TH: 'โน้ตบุ๊กและคอมพิวเตอร์' },
    'Laptops & Desktops': { EN: 'Laptops & Desktops', TH: 'โน้ตบุ๊กและคอมพิวเตอร์' },
    'เครื่องเทสต์มือถือ': { EN: 'Mobile Test Devices', TH: 'เครื่องเทสต์มือถือ' },
    'Mobile Test Devices': { EN: 'Mobile Test Devices', TH: 'เครื่องเทสต์มือถือ' },
    'จอและด็อกกิ้ง': { EN: 'Monitors & Docks', TH: 'จอและด็อกกิ้ง' },
    'Monitors & Docks': { EN: 'Monitors & Docks', TH: 'จอและด็อกกิ้ง' },
    'สายแปลงและอุปกรณ์เสริม': { EN: 'Adapters & Cables', TH: 'สายแปลงและอุปกรณ์เสริม' },
    'Adapters & Cables': { EN: 'Adapters & Cables', TH: 'สายแปลงและอุปกรณ์เสริม' },
    'อุปกรณ์ทดลองพิเศษ (XR/VR)': { EN: 'Special R&D Devices (XR/VR)', TH: 'อุปกรณ์ทดลองพิเศษ (XR/VR)' },
    'Special R&D Devices (XR/VR)': { EN: 'Special R&D Devices (XR/VR)', TH: 'อุปกรณ์ทดลองพิเศษ (XR/VR)' },
    'แท็บเล็ตและอุปกรณ์วาด': { EN: 'Tablets & Stylus', TH: 'แท็บเล็ตและอุปกรณ์วาด' },
    'Tablets & Stylus': { EN: 'Tablets & Stylus', TH: 'แท็บเล็ตและอุปกรณ์วาด' },
  };

  return map[category]?.[lang] || category;
};

/**
 * Format audit details dynamically for clean bilingual display
 */
export const formatAuditDetails = (details: string, lang: Language): string => {
  if (!details) return '';

  if (lang === 'EN') {
    let result = details;

    // Borrow match
    const borrowMatch = result.match(/^ยืมอุปกรณ์ กำหนดส่งคืนวันที่ (.*?) เหตุผล: (.*)$/);
    if (borrowMatch) {
      return `Checked out asset. Due date: ${borrowMatch[1]}. Purpose: ${borrowMatch[2]}`;
    }

    const borrowMatch2 = result.match(/^ยืมเครื่องสำหรับทดสอบ Release Build ประจำสัปดาห์ กำหนดส่งคืนวันที่ (.*)$/);
    if (borrowMatch2) {
      return `Checked out device for weekly Release Build testing. Due date: ${borrowMatch2[1]}`;
    }

    const borrowMatch3 = result.match(/^ยืมด็อกกิ้งเชื่อมต่อจอและสาย LAN สำหรับ Sprint Demo$/);
    if (borrowMatch3) {
      return `Checked out docking station for dual-display & LAN setup during Sprint Demo`;
    }

    // Return match
    const returnMatch = result.match(/^ส่งคืนอุปกรณ์เรียบร้อย สภาพ: (.*?) \((.*?)\)$/);
    if (returnMatch) {
      const cond = formatCondition(returnMatch[1]);
      return `Returned asset to IT in good order. Condition: ${cond} (Overdue return)`;
    }

    const returnMatch2 = result.match(/^ส่งคืนอุปกรณ์เรียบร้อย สภาพ: (.*)$/);
    if (returnMatch2) {
      const cond = formatCondition(returnMatch2[1]);
      return `Returned asset to IT in good order. Condition: ${cond}`;
    }

    // Watchlist subscribe
    const watchMatch = result.match(/^ลงทะเบียนขอรับการแจ้งเตือนทันทีเมื่อ (.*?) ถูกส่งคืน$/);
    if (watchMatch) {
      return `Subscribed to priority alert notification upon return of ${watchMatch[1]} to IT`;
    }

    if (result.includes('ลงทะเบียนขอรับการแจ้งเตือนทันทีเมื่ออุปกรณ์ชิ้นนี้ถูกส่งคืน')) {
      return `Subscribed to priority alert notification upon device return to IT`;
    }

    // Watchlist notification dispatched
    const notifyMatch = result.match(/^ส่งการแจ้งเตือนอีเมลถึงผู้รอคิว \((\d+) คน\): (.*)$/);
    if (notifyMatch) {
      return `Dispatched return notification email to ${notifyMatch[1]} waiting colleague(s): ${notifyMatch[2]}`;
    }

    // Overdue alert
    const overdueMatch = result.match(/^แจ้งเตือนอุปกรณ์เกินกำหนดคืน (\d+) วัน \(กำหนดเดิม: (.*?) UTC\)\. ส่งการแจ้งเตือนไปยัง Webhook\/Email ของผู้ถือครอง \((.*?)\)$/);
    if (overdueMatch) {
      return `Overdue Notice: ${overdueMatch[1]} day(s) past deadline (originally due ${overdueMatch[2]} UTC). Dispatched webhook & alert email to current holder (${overdueMatch[3]}).`;
    }

    return result;
  } else {
    // lang === 'TH'
    let result = details;

    const adminAdd = result.match(/^IT Admin added new asset '(.*?)' \((.*?)\) to inventory\.$/);
    if (adminAdd) {
      return `ผู้ดูแลระบบ IT ได้ลงทะเบียนเพิ่มอุปกรณ์ใหม่ '${adminAdd[1]}' (${adminAdd[2]}) เข้าระบบคลัง`;
    }

    const adminUpd = result.match(/^IT Admin updated device specifications \/ image for '(.*?)' \((.*?)\)\.$/);
    if (adminUpd) {
      return `ผู้ดูแลระบบ IT ได้อัปเดตสเปกและรูปภาพของอุปกรณ์ '${adminUpd[1]}' (${adminUpd[2]})`;
    }

    const adminDel = result.match(/^IT Admin deleted device '(.*?)' \((.*?)\) from active inventory\.$/);
    if (adminDel) {
      return `ผู้ดูแลระบบ IT ได้ลบอุปกรณ์ '${adminDel[1]}' (${adminDel[2]}) ออกจากระบบคลังอุปกรณ์`;
    }

    return result;
  }
};

const formatCondition = (rawCondition: string): string => {
  if (rawCondition.includes('สมบูรณ์ 100%') || rawCondition.includes('ปกติ 100%')) {
    return '100% Perfect & Inspected for IT restocking';
  }
  if (rawCondition.includes('รอยขีดข่วนเล็กน้อย')) {
    return 'Minor cosmetic wear, fully operational';
  }
  if (rawCondition.includes('เริ่มมีปัญหา')) {
    return 'Device malfunction/hardware issue, flagged for IT repair';
  }
  if (rawCondition.includes('อุปกรณ์เสริม')) {
    return 'Accessories missing or damaged';
  }
  return rawCondition;
};
