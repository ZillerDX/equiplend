using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Support dynamic port binding for Railway / Docker cloud environments
var port = Environment.GetEnvironmentVariable("PORT") ?? "5080";
builder.WebHost.UseUrls($"http://*:{port}");

// 1. Services: OpenAPI, SQLite DbContext, CORS, BackgroundService
builder.Services.AddOpenApi();
builder.Services.AddDbContext<EquipLendDb>(opt =>
    opt.UseSqlite("Data Source=equiplend.db"));

builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register BackgroundService for daily 09:00 AM overdue device inspection & webhook alerting
builder.Services.AddSingleton<OverdueDetectionService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<OverdueDetectionService>());

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// 2. Initialize Database & Seed initial IT Assets
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EquipLendDb>();
    db.Database.EnsureCreated();
    SeedDatabase(db);
}

// 3. Minimal API Endpoints

// GET /api/devices (with search, category, status filters)
app.MapGet("/api/devices", async (
    string? search, 
    string? category, 
    string? status, 
    EquipLendDb db) =>
{
    var query = db.Devices.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        var s = search.Trim().ToLower();
        query = query.Where(d => d.Name.ToLower().Contains(s) 
                              || d.AssetTag.ToLower().Contains(s) 
                              || d.Category.ToLower().Contains(s));
    }

    if (!string.IsNullOrWhiteSpace(category) && category != "ทั้งหมด" && category != "All")
    {
        query = query.Where(d => d.Category == category);
    }

    if (!string.IsNullOrWhiteSpace(status) && status != "All")
    {
        if (Enum.TryParse<DeviceStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(d => d.Status == parsedStatus);
        }
    }

    var devices = await query.OrderBy(d => d.Id).ToListAsync();
    return Results.Ok(devices);
});

// GET /api/devices/{id}
app.MapGet("/api/devices/{id:int}", async (int id, EquipLendDb db) =>
{
    var device = await db.Devices.FindAsync(id);
    return device is not null ? Results.Ok(device) : Results.NotFound(new { message = "Device not found" });
});

// POST /api/devices/{id}/borrow
app.MapPost("/api/devices/{id:int}/borrow", async (int id, BorrowRequestDto req, EquipLendDb db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device is null)
        return Results.NotFound(new { message = "ไม่พบอุปกรณ์ที่ระบุในระบบ" });

    if (device.Status != DeviceStatus.Available)
        return Results.BadRequest(new { message = $"อุปกรณ์นี้อยู่ในสถานะ '{device.Status}' ไม่สามารถยืมได้ในขณะนี้" });

    if (string.IsNullOrWhiteSpace(req.BorrowerName) || string.IsNullOrWhiteSpace(req.BorrowerEmail))
        return Results.BadRequest(new { message = "กรุณาระบุชื่อและอีเมลผู้ขอยืม" });

    var now = DateTime.UtcNow;
    var expectedReturn = req.ExpectedReturnDateUtc ?? now.AddDays(3);

    device.Status = DeviceStatus.Borrowed;
    device.CurrentBorrowerName = req.BorrowerName.Trim();
    device.CurrentBorrowerEmail = req.BorrowerEmail.Trim();
    device.CurrentBorrowerDepartment = req.BorrowerDepartment?.Trim() ?? "General Staff";
    device.BorrowedAtUtc = now;
    device.ExpectedReturnDateUtc = expectedReturn;
    device.BorrowReason = req.Reason?.Trim() ?? "เบิกใช้งานปฏิบัติงานประจำวัน";

    // Create Audit Log
    db.AuditLogs.Add(new AuditLog
    {
        DeviceId = device.Id,
        DeviceName = device.Name,
        AssetTag = device.AssetTag,
        Action = "BORROW",
        PerformedBy = device.CurrentBorrowerName,
        BorrowerEmail = device.CurrentBorrowerEmail,
        TimestampUtc = now,
        Details = $"ยืมอุปกรณ์ กำหนดส่งคืนวันที่ {expectedReturn.ToLocalTime():dd/MM/yyyy HH:mm} เหตุผล: {device.BorrowReason}"
    });

    await db.SaveChangesAsync();
    return Results.Ok(new { success = true, message = "ทำรายการยืมอุปกรณ์สำเร็จ", device });
});

// POST /api/devices/{id}/return
app.MapPost("/api/devices/{id:int}/return", async (int id, ReturnRequestDto req, EquipLendDb db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device is null)
        return Results.NotFound(new { message = "ไม่พบอุปกรณ์ที่ระบุ" });

    if (device.Status == DeviceStatus.Available)
        return Results.BadRequest(new { message = "อุปกรณ์นี้พร้อมใช้งานอยู่แล้ว ไม่ได้ถูกยืม" });

    var now = DateTime.UtcNow;
    var previousBorrower = device.CurrentBorrowerName ?? "ไม่ระบุ";
    var previousEmail = device.CurrentBorrowerEmail ?? "";
    var isOverdue = device.ExpectedReturnDateUtc.HasValue && now > device.ExpectedReturnDateUtc.Value;

    // Record return audit log
    db.AuditLogs.Add(new AuditLog
    {
        DeviceId = device.Id,
        DeviceName = device.Name,
        AssetTag = device.AssetTag,
        Action = "RETURN",
        PerformedBy = string.IsNullOrWhiteSpace(req.ReturnedBy) ? previousBorrower : req.ReturnedBy.Trim(),
        BorrowerEmail = previousEmail,
        TimestampUtc = now,
        Details = $"ส่งคืนอุปกรณ์เรียบร้อย สภาพ: {req.Condition ?? "ปกติ 100%"} {(isOverdue ? "(ส่งคืนล่าช้ากว่ากำหนด)" : "")}"
    });

    // Check watchlist to notify next waiting colleagues
    var notifiedEmails = new List<string>();
    if (!string.IsNullOrEmpty(device.WatchlistEmailsJson))
    {
        try
        {
            var list = JsonSerializer.Deserialize<List<string>>(device.WatchlistEmailsJson) ?? new();
            notifiedEmails.AddRange(list);
            if (notifiedEmails.Count > 0)
            {
                db.AuditLogs.Add(new AuditLog
                {
                    DeviceId = device.Id,
                    DeviceName = device.Name,
                    AssetTag = device.AssetTag,
                    Action = "WATCHLIST_NOTIFIED",
                    PerformedBy = "System Notification Dispatcher",
                    BorrowerEmail = string.Join(", ", notifiedEmails),
                    TimestampUtc = now,
                    Details = $"ส่งการแจ้งเตือนอีเมลถึงผู้รอคิว ({notifiedEmails.Count} คน): {string.Join(", ", notifiedEmails)}"
                });
            }
        }
        catch { }
    }

    // Reset device state
    device.Status = DeviceStatus.Available;
    device.CurrentBorrowerName = null;
    device.CurrentBorrowerEmail = null;
    device.CurrentBorrowerDepartment = null;
    device.BorrowedAtUtc = null;
    device.ExpectedReturnDateUtc = null;
    device.BorrowReason = null;
    device.WatchlistEmailsJson = "[]";

    await db.SaveChangesAsync();
    return Results.Ok(new 
    { 
        success = true, 
        message = "ส่งคืนอุปกรณ์เรียบร้อย ขอบคุณที่ร่วมรักษาวินัยการใช้อุปกรณ์ส่วนกลาง", 
        notifiedWatchersCount = notifiedEmails.Count,
        device 
    });
});

// POST /api/devices/{id}/watch (Notify me when returned)
app.MapPost("/api/devices/{id:int}/watch", async (int id, WatchRequestDto req, EquipLendDb db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device is null)
        return Results.NotFound(new { message = "ไม่พบอุปกรณ์" });

    if (string.IsNullOrWhiteSpace(req.Email))
        return Results.BadRequest(new { message = "กรุณาระบุอีเมลสำหรับรับแจ้งเตือน" });

    var email = req.Email.Trim().ToLowerInvariant();
    var list = new List<string>();
    if (!string.IsNullOrEmpty(device.WatchlistEmailsJson))
    {
        try
        {
            list = JsonSerializer.Deserialize<List<string>>(device.WatchlistEmailsJson) ?? new();
        }
        catch { }
    }

    if (!list.Contains(email))
    {
        list.Add(email);
        device.WatchlistEmailsJson = JsonSerializer.Serialize(list);

        db.AuditLogs.Add(new AuditLog
        {
            DeviceId = device.Id,
            DeviceName = device.Name,
            AssetTag = device.AssetTag,
            Action = "WATCHLIST_SUBSCRIBED",
            PerformedBy = req.Name ?? email,
            BorrowerEmail = email,
            TimestampUtc = DateTime.UtcNow,
            Details = $"ลงทะเบียนขอรับการแจ้งเตือนทันทีเมื่ออุปกรณ์ชิ้นนี้ถูกส่งคืน"
        });

        await db.SaveChangesAsync();
    }

    return Results.Ok(new { success = true, message = $"ลงทะเบียนแจ้งเตือนให้ {email} เรียบร้อยแล้ว", watchersCount = list.Count });
});

// GET /api/my-items?email=...
app.MapGet("/api/my-items", async (string email, EquipLendDb db) =>
{
    if (string.IsNullOrWhiteSpace(email))
        return Results.BadRequest(new { message = "Email query parameter is required" });

    var cleanEmail = email.Trim().ToLower();
    var items = await db.Devices.AsNoTracking()
        .Where(d => d.Status == DeviceStatus.Borrowed && d.CurrentBorrowerEmail != null && d.CurrentBorrowerEmail.ToLower() == cleanEmail)
        .OrderBy(d => d.ExpectedReturnDateUtc)
        .ToListAsync();

    return Results.Ok(items);
});

// GET /api/audit-logs
app.MapGet("/api/audit-logs", async (int? limit, EquipLendDb db) =>
{
    var count = limit ?? 50;
    var logs = await db.AuditLogs.AsNoTracking()
        .OrderByDescending(l => l.TimestampUtc)
        .Take(count)
        .ToListAsync();
    return Results.Ok(logs);
});

// POST /api/admin/trigger-overdue-check (Manual trigger for testing 09:00 AM scheduler)
app.MapPost("/api/admin/trigger-overdue-check", async (
    OverdueDetectionService overdueService,
    EquipLendDb db) =>
{
    var result = await overdueService.ExecuteCheckNowAsync(db);
    return Results.Ok(result);
});

// GET /api/admin/stats
app.MapGet("/api/admin/stats", async (EquipLendDb db) =>
{
    var now = DateTime.UtcNow;
    var totalDevices = await db.Devices.CountAsync();
    var availableCount = await db.Devices.CountAsync(d => d.Status == DeviceStatus.Available);
    var borrowedCount = await db.Devices.CountAsync(d => d.Status == DeviceStatus.Borrowed);
    var overdueCount = await db.Devices.CountAsync(d => d.Status == DeviceStatus.Borrowed && d.ExpectedReturnDateUtc < now);
    var totalLogs = await db.AuditLogs.CountAsync();

    return Results.Ok(new
    {
        totalDevices,
        availableCount,
        borrowedCount,
        overdueCount,
        totalAuditEntries = totalLogs,
        serverTimeUtc = now,
        nextScheduledRun = "Every day at 09:00 AM (ICT/Local)"
    });
});

// Admin Device Management (CRUD)
// POST /api/admin/devices (Add new device with image, specs, tag)
app.MapPost("/api/admin/devices", async (DeviceUpsertDto dto, EquipLendDb db) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.AssetTag))
        return Results.BadRequest(new { message = "Device Name and Asset Tag are required" });

    var existingTag = await db.Devices.AnyAsync(d => d.AssetTag.ToLower() == dto.AssetTag.Trim().ToLower());
    if (existingTag)
        return Results.BadRequest(new { message = $"Asset Tag '{dto.AssetTag}' is already in use." });

    var device = new Device
    {
        AssetTag = dto.AssetTag.Trim(),
        Name = dto.Name.Trim(),
        Category = dto.Category?.Trim() ?? "General IT",
        ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) 
            ? "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80" 
            : dto.ImageUrl.Trim(),
        Specs = dto.Specs?.Trim() ?? "N/A",
        SerialNumber = dto.SerialNumber?.Trim(),
        LocationCode = dto.LocationCode?.Trim() ?? "IT-Storage",
        Status = DeviceStatus.Available
    };

    db.Devices.Add(device);

    db.AuditLogs.Add(new AuditLog
    {
        DeviceId = device.Id,
        DeviceName = device.Name,
        AssetTag = device.AssetTag,
        Action = "ADMIN_ADD_DEVICE",
        PerformedBy = "IT Admin",
        BorrowerEmail = "it.admin@company.internal",
        TimestampUtc = DateTime.UtcNow,
        Details = $"IT Admin added new asset '{device.Name}' ({device.AssetTag}) to inventory."
    });

    await db.SaveChangesAsync();
    return Results.Created($"/api/devices/{device.Id}", device);
});

// PUT /api/admin/devices/{id} (Update device specs, image, location, etc.)
app.MapPut("/api/admin/devices/{id:int}", async (int id, DeviceUpsertDto dto, EquipLendDb db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device is null)
        return Results.NotFound(new { message = "Device not found" });

    device.Name = dto.Name.Trim();
    device.Category = dto.Category?.Trim() ?? device.Category;
    if (!string.IsNullOrWhiteSpace(dto.ImageUrl)) device.ImageUrl = dto.ImageUrl.Trim();
    device.Specs = dto.Specs?.Trim() ?? device.Specs;
    device.SerialNumber = dto.SerialNumber?.Trim();
    device.LocationCode = dto.LocationCode?.Trim();
    if (!string.IsNullOrWhiteSpace(dto.AssetTag)) device.AssetTag = dto.AssetTag.Trim();

    db.AuditLogs.Add(new AuditLog
    {
        DeviceId = device.Id,
        DeviceName = device.Name,
        AssetTag = device.AssetTag,
        Action = "ADMIN_UPDATE_DEVICE",
        PerformedBy = "IT Admin",
        BorrowerEmail = "it.admin@company.internal",
        TimestampUtc = DateTime.UtcNow,
        Details = $"IT Admin updated device specifications / image for '{device.Name}' ({device.AssetTag})."
    });

    await db.SaveChangesAsync();
    return Results.Ok(device);
});

// DELETE /api/admin/devices/{id} (Delete device if not currently borrowed)
app.MapDelete("/api/admin/devices/{id:int}", async (int id, EquipLendDb db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device is null)
        return Results.NotFound(new { message = "Device not found" });

    if (device.Status == DeviceStatus.Borrowed)
        return Results.BadRequest(new { message = $"Cannot delete '{device.Name}' while it is currently borrowed by {device.CurrentBorrowerName}." });

    db.AuditLogs.Add(new AuditLog
    {
        DeviceId = device.Id,
        DeviceName = device.Name,
        AssetTag = device.AssetTag,
        Action = "ADMIN_DELETE_DEVICE",
        PerformedBy = "IT Admin",
        BorrowerEmail = "it.admin@company.internal",
        TimestampUtc = DateTime.UtcNow,
        Details = $"IT Admin deleted device '{device.Name}' ({device.AssetTag}) from active inventory."
    });

    db.Devices.Remove(device);
    await db.SaveChangesAsync();
    return Results.Ok(new { success = true, message = $"Device '{device.Name}' was deleted successfully." });
});

app.Run();

// -------------------------------------------------------------
// Database Context & Domain Entities
// -------------------------------------------------------------

public class EquipLendDb : DbContext
{
    public EquipLendDb(DbContextOptions<EquipLendDb> options) : base(options) { }

    public DbSet<Device> Devices => Set<Device>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DeviceStatus
{
    Available,
    Borrowed,
    Maintenance
}

public class Device
{
    public int Id { get; set; }
    public required string AssetTag { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string ImageUrl { get; set; }
    public required string Specs { get; set; }
    public string? SerialNumber { get; set; }
    public string? LocationCode { get; set; }
    
    public DeviceStatus Status { get; set; } = DeviceStatus.Available;

    public string? CurrentBorrowerName { get; set; }
    public string? CurrentBorrowerEmail { get; set; }
    public string? CurrentBorrowerDepartment { get; set; }
    public DateTime? BorrowedAtUtc { get; set; }
    public DateTime? ExpectedReturnDateUtc { get; set; }
    public string? BorrowReason { get; set; }

    public string WatchlistEmailsJson { get; set; } = "[]";
}

public class AuditLog
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public required string DeviceName { get; set; }
    public required string AssetTag { get; set; }
    public required string Action { get; set; } // BORROW, RETURN, OVERDUE_ALERT, WATCHLIST_NOTIFIED, WATCHLIST_SUBSCRIBED
    public required string PerformedBy { get; set; }
    public required string BorrowerEmail { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    public required string Details { get; set; }
}

public record BorrowRequestDto(
    string BorrowerName, 
    string BorrowerEmail, 
    string? BorrowerDepartment, 
    DateTime? ExpectedReturnDateUtc, 
    string? Reason);

public record ReturnRequestDto(
    string? ReturnedBy, 
    string? Condition);

public record WatchRequestDto(
    string Email, 
    string? Name);

public record DeviceUpsertDto(
    string AssetTag,
    string Name,
    string? Category,
    string? ImageUrl,
    string? Specs,
    string? SerialNumber,
    string? LocationCode);

// -------------------------------------------------------------
// Background Service: 09:00 AM Cron Scheduler & Webhook Dispatcher
// -------------------------------------------------------------

public class OverdueDetectionService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OverdueDetectionService> _logger;

    public OverdueDetectionService(IServiceProvider serviceProvider, ILogger<OverdueDetectionService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OverdueDetectionService started. Monitoring for assets overdue every morning at 09:00 AM.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            var nextNineAm = now.Date.AddHours(9);
            if (now >= nextNineAm)
            {
                nextNineAm = nextNineAm.AddDays(1);
            }
            var delay = nextNineAm - now;

            try
            {
                // In production, wait until next 09:00 AM.
                // For demonstration, wake up or respond to on-demand trigger.
                await Task.Delay(delay, stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<EquipLendDb>();
                await ExecuteCheckNowAsync(db);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing scheduled overdue detection.");
            }
        }
    }

    public async Task<object> ExecuteCheckNowAsync(EquipLendDb db)
    {
        var nowUtc = DateTime.UtcNow;
        var overdueDevices = await db.Devices
            .Where(d => d.Status == DeviceStatus.Borrowed && d.ExpectedReturnDateUtc.HasValue && d.ExpectedReturnDateUtc.Value < nowUtc)
            .ToListAsync();

        var alertedList = new List<object>();

        foreach (var device in overdueDevices)
        {
            var daysOverdue = (int)Math.Ceiling((nowUtc - device.ExpectedReturnDateUtc!.Value).TotalDays);
            
            // Log audit trail
            db.AuditLogs.Add(new AuditLog
            {
                DeviceId = device.Id,
                DeviceName = device.Name,
                AssetTag = device.AssetTag,
                Action = "OVERDUE_ALERT",
                PerformedBy = "EquipLend Daily 09:00 AM Cron Scheduler",
                BorrowerEmail = device.CurrentBorrowerEmail ?? "Unknown",
                TimestampUtc = nowUtc,
                Details = $"แจ้งเตือนอุปกรณ์เกินกำหนดคืน {daysOverdue} วัน (กำหนดเดิม: {device.ExpectedReturnDateUtc:dd/MM/yyyy HH:mm} UTC). ส่งการแจ้งเตือนไปยัง Webhook/Email ของผู้ถือครอง ({device.CurrentBorrowerName})"
            });

            // Simulated Slack / MS Teams Webhook Payload
            var webhookPayload = new
            {
                type = "OVERDUE_DEVICE_ALERT",
                channel = "#it-assets-alerts",
                timestamp = nowUtc,
                title = "🚨 แจ้งเตือนอุปกรณ์เกินกำหนดคืน (Overdue IT Asset)",
                asset = new
                {
                    tag = device.AssetTag,
                    name = device.Name,
                    currentBorrower = device.CurrentBorrowerName,
                    email = device.CurrentBorrowerEmail,
                    expectedReturn = device.ExpectedReturnDateUtc.Value.ToString("yyyy-MM-dd HH:mm UTC"),
                    daysLate = daysOverdue
                },
                actionSuggested = $"ส่งข้อความอัตโนมัติแจ้งเตือนพนักงาน {device.CurrentBorrowerName} ผ่าน MS Teams หรือ Slack Bot"
            };

            alertedList.Add(webhookPayload);
        }

        if (overdueDevices.Count > 0)
        {
            await db.SaveChangesAsync();
        }

        return new
        {
            checkExecutedAtUtc = nowUtc,
            overdueCount = overdueDevices.Count,
            alertsDispatched = alertedList,
            status = "Success - All overdue webhooks prepared & Audit trail updated."
        };
    }
}

// -------------------------------------------------------------
// Realistic Seed Data for Modern Tech Office
// -------------------------------------------------------------

partial class Program
{
    private static void SeedDatabase(EquipLendDb db)
    {
        if (db.Devices.Any()) return;

        var now = DateTime.UtcNow;

        var sampleDevices = new List<Device>
        {
            new()
            {
                AssetTag = "IT-NB-001",
                Name = "MacBook Pro 16\" M3 Max",
                Category = "โน้ตบุ๊กและคอมพิวเตอร์",
                ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
                Specs = "Apple M3 Max (16-core CPU, 40-core GPU), 64GB Unified Memory, 1TB SSD, Space Black",
                SerialNumber = "C02XYZ89M3MAX",
                LocationCode = "Cabinet-A1-04",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-TEST-002",
                Name = "iPhone 15 Pro (QA Test Device)",
                Category = "เครื่องเทสต์มือถือ",
                ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
                Specs = "iOS 18.2 Beta, 256GB Natural Titanium, Unlocked for QA Sandbox Testing",
                SerialNumber = "F2LQA15PRO09",
                LocationCode = "Testing-Drawer-B2",
                Status = DeviceStatus.Borrowed,
                CurrentBorrowerName = "สมชาย มั่นคง (Somchai)",
                CurrentBorrowerEmail = "somchai.qa@company.internal",
                CurrentBorrowerDepartment = "QA / Testing Chapter",
                BorrowedAtUtc = now.AddDays(-4),
                ExpectedReturnDateUtc = now.AddDays(-1), // OVERDUE by 1 day for realistic demo
                BorrowReason = "ทดสอบ Deep Link และ Biometrics บน iOS 18",
                WatchlistEmailsJson = "[\"kanya.dev@company.internal\"]"
            },
            new()
            {
                AssetTag = "IT-TEST-003",
                Name = "Google Pixel 8 Pro",
                Category = "เครื่องเทสต์มือถือ",
                ImageUrl = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
                Specs = "Android 15 Developer Preview, Google Tensor G3, 128GB Bay Blue",
                SerialNumber = "PX8PRO9921",
                LocationCode = "Testing-Drawer-B2",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-MON-004",
                Name = "Dell UltraSharp 27\" 4K USB-C Hub Monitor (U2723QE)",
                Category = "จอและด็อกกิ้ง",
                ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
                Specs = "4K IPS Black 3840x2160, 90W USB-C Power Delivery, RJ45 Ethernet Hub built-in",
                SerialNumber = "CN092DELLU27",
                LocationCode = "IT-Staging-Rack-02",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-DOCK-005",
                Name = "CalDigit TS4 Thunderbolt 4 Station",
                Category = "จอและด็อกกิ้ง",
                ImageUrl = "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=600&q=80",
                Specs = "18 Ports expansion, 98W Charging, Dual 6K Displays support, 2.5GbE",
                SerialNumber = "TS4-TB4-77401",
                LocationCode = "Cabinet-A2-01",
                Status = DeviceStatus.Borrowed,
                CurrentBorrowerName = "กัญญา พัฒนาการ (Kanya)",
                CurrentBorrowerEmail = "kanya.dev@company.internal",
                CurrentBorrowerDepartment = "Frontend Engineering",
                BorrowedAtUtc = now.AddDays(-1),
                ExpectedReturnDateUtc = now.AddDays(2),
                BorrowReason = "ต่อจอแยก 2 จอทำงาน Sprint Demo",
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-ACC-006",
                Name = "Anker 7-in-1 USB-C Hub with 4K HDMI",
                Category = "สายแปลงและอุปกรณ์เสริม",
                ImageUrl = "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80",
                Specs = "HDMI 4K@60Hz, 100W Power Delivery, SD/TF Card Reader, 2x USB-A 3.0",
                SerialNumber = "ANK-HUB-4482",
                LocationCode = "Quick-Grab-Tray-01",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-ACC-007",
                Name = "Apple USB-C to Digital AV Multiport Adapter",
                Category = "สายแปลงและอุปกรณ์เสริม",
                ImageUrl = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
                Specs = "HDMI, USB-A, USB-C Charge-Through for Meeting Room Presentation",
                SerialNumber = "APL-AV-99120",
                LocationCode = "Quick-Grab-Tray-01",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-VR-008",
                Name = "Apple Vision Pro 512GB (R&D Dev Kit)",
                Category = "อุปกรณ์ทดลองพิเศษ (XR/VR)",
                ImageUrl = "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=600&q=80",
                Specs = "visionOS 2.2, Dual 4K micro-OLED, Spatial Computing Sandbox Device",
                SerialNumber = "AVP-DEV-00109",
                LocationCode = "Security-Safe-01",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-TAB-009",
                Name = "iPad Pro 13\" M4 (OLED)",
                Category = "แท็บเล็ตและอุปกรณ์วาด",
                ImageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
                Specs = "Tandem OLED Ultra Retina XDR, Apple Pencil Pro, 256GB Wi-Fi Space Black",
                SerialNumber = "IPDM4-13-8821",
                LocationCode = "Testing-Drawer-B1",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            },
            new()
            {
                AssetTag = "IT-PERI-010",
                Name = "Logitech MX Master 3S Wireless Mouse",
                Category = "สายแปลงและอุปกรณ์เสริม",
                ImageUrl = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
                Specs = "Quiet Clicks, 8K DPI Sensor, MagSpeed Scrolling, Bluetooth + Bolt Receiver",
                SerialNumber = "LOGI-MX3S-110",
                LocationCode = "Cabinet-A1-02",
                Status = DeviceStatus.Available,
                WatchlistEmailsJson = "[]"
            }
        };

        db.Devices.AddRange(sampleDevices);

        // Seed initial audit log history
        db.AuditLogs.AddRange(new List<AuditLog>
        {
            new()
            {
                DeviceId = 2,
                DeviceName = "iPhone 15 Pro (QA Test Device)",
                AssetTag = "IT-TEST-002",
                Action = "BORROW",
                PerformedBy = "สมชาย มั่นคง (Somchai)",
                BorrowerEmail = "somchai.qa@company.internal",
                TimestampUtc = now.AddDays(-4),
                Details = "ยืมเครื่องสำหรับทดสอบ Release Build ประจำสัปดาห์ กำหนดส่งคืนวันที่ " + now.AddDays(-1).ToLocalTime().ToString("dd/MM/yyyy")
            },
            new()
            {
                DeviceId = 5,
                DeviceName = "CalDigit TS4 Thunderbolt 4 Station",
                AssetTag = "IT-DOCK-005",
                Action = "BORROW",
                PerformedBy = "กัญญา พัฒนาการ (Kanya)",
                BorrowerEmail = "kanya.dev@company.internal",
                TimestampUtc = now.AddDays(-1),
                Details = "ยืมด็อกกิ้งเชื่อมต่อจอและสาย LAN สำหรับ Sprint Demo"
            },
            new()
            {
                DeviceId = 2,
                DeviceName = "iPhone 15 Pro (QA Test Device)",
                AssetTag = "IT-TEST-002",
                Action = "WATCHLIST_SUBSCRIBED",
                PerformedBy = "กัญญา พัฒนาการ (Kanya)",
                BorrowerEmail = "kanya.dev@company.internal",
                TimestampUtc = now.AddDays(-2),
                Details = "ลงทะเบียนขอรับการแจ้งเตือนทันทีเมื่อ iPhone 15 Pro ถูกส่งคืน"
            }
        });

        db.SaveChanges();
    }
}
