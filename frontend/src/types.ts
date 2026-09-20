export type DeviceStatus = 'Available' | 'Borrowed' | 'Maintenance';

export interface Device {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  imageUrl: string;
  specs: string;
  serialNumber?: string;
  locationCode?: string;
  status: DeviceStatus;
  currentBorrowerName?: string;
  currentBorrowerEmail?: string;
  currentBorrowerDepartment?: string;
  borrowedAtUtc?: string;
  expectedReturnDateUtc?: string;
  borrowReason?: string;
  watchlistEmailsJson: string;
}

export interface AuditLog {
  id: number;
  deviceId: number;
  deviceName: string;
  assetTag: string;
  action: 'BORROW' | 'RETURN' | 'OVERDUE_ALERT' | 'WATCHLIST_NOTIFIED' | 'WATCHLIST_SUBSCRIBED' | 'ADMIN_ADD_DEVICE' | 'ADMIN_UPDATE_DEVICE' | 'ADMIN_DELETE_DEVICE';
  performedBy: string;
  borrowerEmail: string;
  timestampUtc: string;
  details: string;
}

export interface SystemStats {
  totalDevices: number;
  availableCount: number;
  borrowedCount: number;
  overdueCount: number;
  totalAuditEntries: number;
  serverTimeUtc: string;
  nextScheduledRun: string;
}

export interface UserPersona {
  name: string;
  email: string;
  department: string;
  role: string;
  isAdmin: boolean;
  avatarBg: string;
}

export const USER_PERSONAS: UserPersona[] = [
  {
    name: "Somchai Munkong",
    email: "somchai.qa@company.internal",
    department: "QA & Testing Chapter",
    role: "Senior QA Engineer",
    isAdmin: false,
    avatarBg: "bg-blue-600"
  },
  {
    name: "Kanya Phatthanakan",
    email: "kanya.dev@company.internal",
    department: "Frontend Engineering",
    role: "Staff Software Engineer",
    isAdmin: false,
    avatarBg: "bg-purple-600"
  },
  {
    name: "Thanawat Chadkandee",
    email: "thanawat.pm@company.internal",
    department: "Product & Strategy",
    role: "Product Owner",
    isAdmin: false,
    avatarBg: "bg-amber-600"
  },
  {
    name: "Alex Vance (IT Administrator)",
    email: "it.admin@company.internal",
    department: "Enterprise IT Operations",
    role: "Lead IT Asset Administrator",
    isAdmin: true,
    avatarBg: "bg-indigo-700"
  }
];
