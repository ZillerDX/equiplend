# EquipLend — ระบบเบิก-ยืมอุปกรณ์ไอทีในออฟฟิศ (Internal Device & IT Asset Kiosk)

[![.NET 10 LTS](https://img.shields.io/badge/.NET-10.0%20LTS-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20EF%20Core-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)

ระบบเบิก-ยืมอุปกรณ์ไอทีส่วนกลางประจำออฟฟิศ ออกแบบภายใต้แนวคิด **Zero-Training UX** ที่ให้ความรู้สึกเหมือนการใช้งาน **Vending Machine** หรือแคตตาล็อกสินค้าออนไลน์ ด้วยสไตล์ดีไซน์ระดับ **Microsoft .NET MAUI Beautiful UI Challenge / Showcase** โทน **Nordic Clean Light Mode** ที่สบายตา คมชัด และไม่มี AI Slop

---

## 1. Target Audience (Who)
- **พนักงานและทีมพัฒนา/ทดสอบ (Developers, QA Testers, PMs)**: ต้องการยืมเครื่องเทสต์ (iPhone/Android), จอเสริม, ด็อกกิ้ง หรือสายแปลงชั่วคราวได้ด้วยตัวเองในเวลาไม่กี่วินาที
- **ฝ่าย IT Support & Operations**: ต้องการระบบติดตามอุปกรณ์ส่วนกลางที่โปร่งใส ตรวจสอบย้อนหลังได้ 100% (Audit Trail) และมีระบบตรวจจับของค้างส่งคืน (Overdue) โดยอัตโนมัติ

---

## 2. Problem Statement (Problem)
ในออฟฟิศทั่วไป อุปกรณ์ส่วนกลาง (สายแปลง HDMI, จอ Monitor เสริม, เครื่องทดสอบแอป) มักเจอปัญหา:
1. พนักงานหยิบไปใช้งานแล้วลืมคืน หรือไม่รู้ว่าของชิ้นนี้อยู่กับใคร
2. เมื่อต้องการใช้งานด่วน ต้องเดินตามหาหรือถามในห้องแชตส่วนกลาง
3. ขาดระบบบันทึกประวัติการยืม-คืนที่มีมาตรฐาน

---

## 3. Solution & Value Proposition (Solution)
**EquipLend** เปลี่ยนขั้นตอนการเบิกของที่ยุ่งยาก ให้ง่ายเหมือนการกดตู้ Vending Machine:
- การ์ดรูปอุปกรณ์พร้อมสถานะชัดเจน 🟢 "พร้อมยืม" / 🟡 "มีคนใช้อยู่"
- เบิก-ยืมใน 2 คลิก: เลือกวันที่คาดว่าจะคืน และกดยืนยัน
- หากของถูกยืมอยู่ มีปุ่ม **"แจ้งเตือนเมื่อของคืนแล้ว" (Watchlist)** ส่ง Notification ทันทีที่มีคนนำมาคืน
- แท็บ **"ของที่ฉันถือครองอยู่"** พร้อมปุ่ม **"กดส่งคืนในคลิกเดียว"**

---

## 4. Key Highlights & Features (Features)
- **Vending Machine Kiosk Grid**: แบ่งหมวดหมู่ โน้ตบุ๊ก, เครื่องเทสต์, จอและด็อกกิ้ง, สายแปลง พร้อมระบบค้นหาด่วน
- **Custom Hardware Date Picker**: ตัวเลือกวันที่คืนแบบด่วน (1 วัน, 3 วัน, 7 วัน) ไม่ใช้ Native HTML Date Picker ที่แข็งกระด้าง
- **Role/Persona Switcher**: จำลองสลับตัวตนพนักงาน (Somchai - Senior QA, Kanya - Staff Engineer, IT Helpdesk) เพื่อทดสอบสิทธิ์การยืมและคืนของแต่ละคน
- **C# .NET 10 BackgroundService Scheduler**: ตรวจสอบอุปกรณ์ค้างส่งคืนทุกเช้าเวลา 09:00 น. และสร้าง Webhook Payload (Slack / MS Teams)
- **Simulated Webhook Console**: ทดลองรันรอบ 09:00 น. แบบ On-Demand เพื่อดู JSON payload และตรวจผลลัพธ์
- **Complete IT Audit Trail**: บันทึกทุกความเคลื่อนไหว (BORROW, RETURN, OVERDUE_ALERT, WATCHLIST_NOTIFIED)

---

## 5. System Architecture & Tech Stack

```mermaid
flowchart LR
    subgraph Client ["Frontend (React 19 + Tailwind v4)"]
        UI["Kiosk Vending Grid"]
        Persona["Persona Switcher"]
        MyHeld["My Items Drawer"]
        AuditUI["Audit & Webhook Console"]
    end

    subgraph Server ["Backend (C# .NET 10 LTS Minimal API)"]
        API["Minimal API Endpoints"]
        Scheduler["09:00 AM Overdue Cron Worker"]
        EF["Entity Framework Core 10"]
    end

    subgraph Storage ["Database & External"]
        DB[("SQLite: equiplend.db")]
        Slack["Simulated Webhook (Slack/Teams)"]
    end

    UI -->|HTTP /api/devices| API
    MyHeld -->|HTTP /api/devices/{id}/return| API
    AuditUI -->|POST /api/admin/trigger-overdue-check| API
    Scheduler -->|Scan Overdue Devices| EF
    Scheduler -->|Dispatch Payload| Slack
    API --> EF
    EF --> DB
```

---

## 6. Local Quickstart (วิธีรันระบบ)

### รัน Backend (.NET 10 Minimal API)
```powershell
cd C:\Users\bostz\.gemini\antigravity\scratch\equiplend\backend\EquipLend.Api
dotnet run --urls "http://localhost:5080"
```
*API จะทำงานที่ http://localhost:5080 และเปิด OpenAPI schema ที่ `/openapi/v1.json`*

### รัน Frontend (React 19 + Tailwind v4)
```powershell
cd C:\Users\bostz\.gemini\antigravity\scratch\equiplend\frontend
npm run dev
```
*เปิดใช้งานที่ [http://localhost:3000](http://localhost:3000)*
