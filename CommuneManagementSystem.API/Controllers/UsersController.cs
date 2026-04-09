using System.Text;
using System.Text.Json;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Filters;
using CommuneManagementSystem.API.Infrastructure;
using CommuneManagementSystem.API.Models;
using CommuneManagementSystem.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[RequireRoles("Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;
    private readonly IWebHostEnvironment _environment;

    public UsersController(AppDbContext db, ISystemLogService logs, IWebHostEnvironment environment)
    {
        _db = db;
        _logs = logs;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUserDto>>> GetAll()
    {
        var users = await _db.AppUsers
            .Select(user => MapUser(user))
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppUserDto>> GetById(int id)
    {
        var user = await _db.AppUsers.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(MapUser(user));
    }

    [HttpPost]
    public async Task<ActionResult<AppUserDto>> Create([FromBody] CreateAppUserDto dto)
    {
        if (await _db.AppUsers.AnyAsync(user => user.Username == dto.Username))
        {
            return BadRequest("Tai khoan da ton tai.");
        }

        var now = DateTime.Now;
        var user = new AppUser
        {
            Username = dto.Username,
            PasswordHash = dto.Password,
            FullName = dto.FullName,
            Role = dto.Role,
            CreatedAt = now,
            PasswordChangedAt = now,
            Status = "Active",
        };

        _db.AppUsers.Add(user);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Tao nguoi dung",
            "System",
            $"Tao tai khoan {user.Username}",
            newValue: new { user.Id, user.Username, user.Role, user.Status });

        return Created(string.Empty, MapUser(user));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AppUserDto>> Update(int id, [FromBody] UpdateAppUserDto dto)
    {
        var user = await _db.AppUsers.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        var snapshot = new { user.Id, user.Username, user.FullName, user.Role, user.Status, user.Email, user.PhoneNumber };

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Role != null) user.Role = dto.Role;
        if (dto.Status != null) user.Status = dto.Status;

        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Cap nhat nguoi dung",
            "System",
            $"Cap nhat tai khoan {user.Username}",
            oldValue: snapshot,
            newValue: new { user.Id, user.Username, user.FullName, user.Role, user.Status, user.Email, user.PhoneNumber });

        return Ok(MapUser(user));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var user = await _db.AppUsers.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        var snapshot = new { user.Id, user.Username, user.Role };
        _db.AppUsers.Remove(user);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Xoa nguoi dung", "System", $"Xoa tai khoan {user.Username}", oldValue: snapshot);
        return NoContent();
    }

    [HttpGet("backup")]
    public async Task<ActionResult> Backup()
    {
        var stats = new
        {
            Households = await _db.Households.CountAsync(),
            Persons = await _db.Persons.CountAsync(),
            Users = await _db.AppUsers.CountAsync(),
            TempResidences = await _db.TemporaryResidences.CountAsync(),
            TempAbsences = await _db.TemporaryAbsences.CountAsync(),
            Notifications = await _db.NotificationItems.CountAsync(),
            Meetings = await _db.MeetingEvents.CountAsync(),
            LibraryDocuments = await _db.LibraryDocuments.CountAsync(),
            FeedbackItems = await _db.FeedbackItems.CountAsync(),
            Settings = await _db.SystemSettings.CountAsync(),
            CatalogItems = await _db.CatalogItems.CountAsync(),
            UserGroups = await _db.UserGroups.CountAsync(),
            Tasks = await _db.TaskItems.CountAsync(),
            Works = await _db.WorkItems.CountAsync(),
            Projects = await _db.ProjectItems.CountAsync(),
            Proposals = await _db.ProposalItems.CountAsync(),
            StaffProfiles = await _db.StaffProfiles.CountAsync(),
            BaseSalaryRates = await _db.BaseSalaryRates.CountAsync(),
            PayrollEntries = await _db.PayrollEntries.CountAsync(),
            SalaryTransfers = await _db.SalaryTransfers.CountAsync(),
            BackedUpAt = DateTime.Now,
            DownloadUrl = "/api/users/backup/export",
        };

        await _logs.LogAsync(HttpContext, "Khoi tao sao luu", "System", "Tao yeu cau sao luu du lieu");
        return Ok(new { message = "Sao luu du lieu san sang", details = stats });
    }

    [HttpGet("backup/export")]
    public async Task<ActionResult> ExportBackup()
    {
        var personDocuments = await _db.PersonDocuments.AsNoTracking().ToListAsync();
        var libraryDocuments = await _db.LibraryDocuments.AsNoTracking().ToListAsync();

        var snapshot = new
        {
            exportedAt = DateTime.Now,
            version = "1.3.0",
            users = await _db.AppUsers.AsNoTracking().ToListAsync(),
            households = await _db.Households.AsNoTracking().ToListAsync(),
            persons = await _db.Persons.AsNoTracking().ToListAsync(),
            temporaryResidences = await _db.TemporaryResidences.AsNoTracking().ToListAsync(),
            temporaryAbsences = await _db.TemporaryAbsences.AsNoTracking().ToListAsync(),
            birthRecords = await _db.BirthRecords.AsNoTracking().ToListAsync(),
            deathRecords = await _db.DeathRecords.AsNoTracking().ToListAsync(),
            systemLogs = await _db.SystemLogs.AsNoTracking().OrderByDescending(log => log.CreatedAt).Take(2000).ToListAsync(),
            notifications = await _db.NotificationItems.AsNoTracking().ToListAsync(),
            meetingEvents = await _db.MeetingEvents.AsNoTracking().ToListAsync(),
            meetingRegistrations = await _db.MeetingRegistrations.AsNoTracking().ToListAsync(),
            workSchedules = await _db.WorkScheduleEntries.AsNoTracking().ToListAsync(),
            feedbackItems = await _db.FeedbackItems.AsNoTracking().ToListAsync(),
            systemSettings = await _db.SystemSettings.AsNoTracking().ToListAsync(),
            catalogItems = await _db.CatalogItems.AsNoTracking().ToListAsync(),
            userGroups = await _db.UserGroups.AsNoTracking().ToListAsync(),
            userGroupMembers = await _db.UserGroupMembers.AsNoTracking().ToListAsync(),
            taskItems = await _db.TaskItems.AsNoTracking().ToListAsync(),
            workItems = await _db.WorkItems.AsNoTracking().ToListAsync(),
            projectItems = await _db.ProjectItems.AsNoTracking().ToListAsync(),
            proposalItems = await _db.ProposalItems.AsNoTracking().ToListAsync(),
            staffProfiles = await _db.StaffProfiles.AsNoTracking().ToListAsync(),
            baseSalaryRates = await _db.BaseSalaryRates.AsNoTracking().ToListAsync(),
            payrollEntries = await _db.PayrollEntries.AsNoTracking().ToListAsync(),
            salaryTransfers = await _db.SalaryTransfers.AsNoTracking().ToListAsync(),
            personDocuments = personDocuments.Select(document => new BackupDocumentDto(
                document.Id,
                document.PersonId,
                document.FileName,
                document.ContentType,
                document.FileSize,
                document.StoredFileName,
                document.StoredPath,
                document.UploadedAt,
                document.UploadedBy,
                ReadDocumentAsBase64(document.StoredPath))).ToList(),
            libraryDocuments = libraryDocuments.Select(document => new BackupLibraryDocumentDto(
                document.Id,
                document.Title,
                document.Description,
                document.Category,
                document.FileName,
                document.ContentType,
                document.FileSize,
                document.StoredFileName,
                document.StoredPath,
                document.UploadedAt,
                document.UploadedBy,
                ReadDocumentAsBase64(document.StoredPath))).ToList(),
        };

        var json = JsonSerializer.Serialize(snapshot, new JsonSerializerOptions { WriteIndented = true });
        await _logs.LogAsync(HttpContext, "Xuat file sao luu", "System", "Xuat file sao luu JSON");

        return File(
            Encoding.UTF8.GetBytes(json),
            "application/json",
            $"commune-backup-{DateTime.Now:yyyyMMdd-HHmmss}.json");
    }

    [HttpPost("backup/restore")]
    [RequestFormLimits(MultipartBodyLengthLimit = 25_000_000)]
    public async Task<ActionResult> RestoreBackup(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui long chon file backup JSON." });
        }

        var actor = HttpContext.GetCurrentUser()!;
        var actorSnapshot = new AppUser
        {
            Id = actor.Id,
            Username = actor.Username,
            FullName = actor.FullName,
            Role = actor.Role,
        };

        using var input = file.OpenReadStream();
        using var document = await JsonDocument.ParseAsync(input);
        var root = document.RootElement;

        var users = DeserializeList<AppUser>(root, "users");
        var households = DeserializeList<Household>(root, "households");
        var persons = DeserializeList<Person>(root, "persons");
        var temporaryResidences = DeserializeList<TemporaryResidence>(root, "temporaryResidences");
        var temporaryAbsences = DeserializeList<TemporaryAbsence>(root, "temporaryAbsences");
        var birthRecords = DeserializeList<BirthRecord>(root, "birthRecords");
        var deathRecords = DeserializeList<DeathRecord>(root, "deathRecords");
        var systemLogs = DeserializeList<SystemLog>(root, "systemLogs");
        var notifications = DeserializeList<NotificationItem>(root, "notifications");
        var meetingEvents = DeserializeList<MeetingEvent>(root, "meetingEvents");
        var meetingRegistrations = DeserializeList<MeetingRegistration>(root, "meetingRegistrations");
        var workSchedules = DeserializeList<WorkScheduleEntry>(root, "workSchedules");
        var feedbackItems = DeserializeList<FeedbackItem>(root, "feedbackItems");
        var systemSettings = DeserializeList<SystemSetting>(root, "systemSettings");
        var catalogItems = DeserializeList<CatalogItem>(root, "catalogItems");
        var userGroups = DeserializeList<UserGroup>(root, "userGroups");
        var userGroupMembers = DeserializeList<UserGroupMember>(root, "userGroupMembers");
        var taskItems = DeserializeList<TaskItem>(root, "taskItems");
        var workItems = DeserializeList<WorkItem>(root, "workItems");
        var projectItems = DeserializeList<ProjectItem>(root, "projectItems");
        var proposalItems = DeserializeList<ProposalItem>(root, "proposalItems");
        var staffProfiles = DeserializeList<StaffProfile>(root, "staffProfiles");
        var baseSalaryRates = DeserializeList<BaseSalaryRate>(root, "baseSalaryRates");
        var payrollEntries = DeserializeList<PayrollEntry>(root, "payrollEntries");
        var salaryTransfers = DeserializeList<SalaryTransfer>(root, "salaryTransfers");
        var personDocuments = DeserializeList<BackupDocumentDto>(root, "personDocuments");
        var libraryDocuments = DeserializeList<BackupLibraryDocumentDto>(root, "libraryDocuments");

        await using var transaction = await _db.Database.BeginTransactionAsync();

        _db.SalaryTransfers.RemoveRange(await _db.SalaryTransfers.ToListAsync());
        _db.PayrollEntries.RemoveRange(await _db.PayrollEntries.ToListAsync());
        _db.BaseSalaryRates.RemoveRange(await _db.BaseSalaryRates.ToListAsync());
        _db.StaffProfiles.RemoveRange(await _db.StaffProfiles.ToListAsync());
        _db.ProposalItems.RemoveRange(await _db.ProposalItems.ToListAsync());
        _db.ProjectItems.RemoveRange(await _db.ProjectItems.ToListAsync());
        _db.WorkItems.RemoveRange(await _db.WorkItems.ToListAsync());
        _db.TaskItems.RemoveRange(await _db.TaskItems.ToListAsync());
        _db.MeetingRegistrations.RemoveRange(await _db.MeetingRegistrations.ToListAsync());
        _db.PersonDocuments.RemoveRange(await _db.PersonDocuments.ToListAsync());
        _db.LibraryDocuments.RemoveRange(await _db.LibraryDocuments.ToListAsync());
        _db.TemporaryResidences.RemoveRange(await _db.TemporaryResidences.ToListAsync());
        _db.TemporaryAbsences.RemoveRange(await _db.TemporaryAbsences.ToListAsync());
        _db.UserGroupMembers.RemoveRange(await _db.UserGroupMembers.ToListAsync());
        _db.NotificationItems.RemoveRange(await _db.NotificationItems.ToListAsync());
        _db.WorkScheduleEntries.RemoveRange(await _db.WorkScheduleEntries.ToListAsync());
        _db.FeedbackItems.RemoveRange(await _db.FeedbackItems.ToListAsync());
        _db.MeetingEvents.RemoveRange(await _db.MeetingEvents.ToListAsync());
        _db.BirthRecords.RemoveRange(await _db.BirthRecords.ToListAsync());
        _db.DeathRecords.RemoveRange(await _db.DeathRecords.ToListAsync());
        _db.Persons.RemoveRange(await _db.Persons.ToListAsync());
        _db.Households.RemoveRange(await _db.Households.ToListAsync());
        _db.UserGroups.RemoveRange(await _db.UserGroups.ToListAsync());
        _db.CatalogItems.RemoveRange(await _db.CatalogItems.ToListAsync());
        _db.SystemSettings.RemoveRange(await _db.SystemSettings.ToListAsync());
        _db.SystemLogs.RemoveRange(await _db.SystemLogs.ToListAsync());
        _db.AppUsers.RemoveRange(await _db.AppUsers.ToListAsync());
        await _db.SaveChangesAsync();

        _db.ChangeTracker.Clear();

        NormalizeUsers(users);
        _db.AppUsers.AddRange(users);
        _db.Households.AddRange(households);
        _db.Persons.AddRange(persons);
        _db.TemporaryResidences.AddRange(temporaryResidences);
        _db.TemporaryAbsences.AddRange(temporaryAbsences);
        _db.BirthRecords.AddRange(birthRecords);
        _db.DeathRecords.AddRange(deathRecords);
        _db.SystemLogs.AddRange(systemLogs);
        _db.NotificationItems.AddRange(notifications);
        _db.MeetingEvents.AddRange(meetingEvents);
        _db.MeetingRegistrations.AddRange(meetingRegistrations);
        _db.WorkScheduleEntries.AddRange(workSchedules);
        _db.FeedbackItems.AddRange(feedbackItems);
        _db.SystemSettings.AddRange(systemSettings);
        _db.CatalogItems.AddRange(catalogItems);
        _db.UserGroups.AddRange(userGroups);
        _db.UserGroupMembers.AddRange(userGroupMembers);
        _db.TaskItems.AddRange(taskItems);
        _db.WorkItems.AddRange(workItems);
        _db.ProjectItems.AddRange(projectItems);
        _db.ProposalItems.AddRange(proposalItems);
        _db.StaffProfiles.AddRange(staffProfiles);
        _db.BaseSalaryRates.AddRange(baseSalaryRates);
        _db.PayrollEntries.AddRange(payrollEntries);
        _db.SalaryTransfers.AddRange(salaryTransfers);

        foreach (var documentItem in personDocuments)
        {
            WriteDocumentFromBase64(documentItem.StoredPath, documentItem.ContentBase64);
            _db.PersonDocuments.Add(new PersonDocument
            {
                Id = documentItem.Id,
                PersonId = documentItem.PersonId,
                FileName = documentItem.FileName,
                ContentType = documentItem.ContentType,
                FileSize = documentItem.FileSize,
                StoredFileName = documentItem.StoredFileName,
                StoredPath = documentItem.StoredPath,
                UploadedAt = documentItem.UploadedAt,
                UploadedBy = documentItem.UploadedBy,
            });
        }

        foreach (var documentItem in libraryDocuments)
        {
            WriteDocumentFromBase64(documentItem.StoredPath, documentItem.ContentBase64);
            _db.LibraryDocuments.Add(new LibraryDocument
            {
                Id = documentItem.Id,
                Title = documentItem.Title,
                Description = documentItem.Description,
                Category = documentItem.Category,
                FileName = documentItem.FileName,
                ContentType = documentItem.ContentType,
                FileSize = documentItem.FileSize,
                StoredFileName = documentItem.StoredFileName,
                StoredPath = documentItem.StoredPath,
                UploadedAt = documentItem.UploadedAt,
                UploadedBy = documentItem.UploadedBy,
            });
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        await _logs.LogAsync(HttpContext, "Phuc hoi du lieu", "System", $"Phuc hoi tu file {file.FileName}", actor: actorSnapshot);
        return Ok(new { message = "Phuc hoi du lieu thanh cong." });
    }

    [HttpGet("logs")]
    public async Task<ActionResult<IEnumerable<SystemLogDto>>> GetLogs([FromQuery] int top = 50)
    {
        var logs = await _db.SystemLogs
            .OrderByDescending(log => log.CreatedAt)
            .Take(top)
            .Select(log => new SystemLogDto(
                log.Id,
                log.UserId,
                log.Username,
                log.Action,
                log.Module,
                log.Detail,
                log.CreatedAt,
                log.IpAddress))
            .ToListAsync();

        return Ok(logs);
    }

    private static AppUserDto MapUser(AppUser user)
    {
        return new AppUserDto(
            user.Id,
            user.Username,
            user.FullName,
            user.Role,
            user.CreatedAt,
            user.LastLoginAt,
            user.Status,
            user.Email,
            user.PhoneNumber,
            user.PasswordChangedAt == default ? user.CreatedAt : user.PasswordChangedAt);
    }

    private static List<T> DeserializeList<T>(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var property))
        {
            return new List<T>();
        }

        return JsonSerializer.Deserialize<List<T>>(property.GetRawText(), new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        }) ?? new List<T>();
    }

    private static void NormalizeUsers(IEnumerable<AppUser> users)
    {
        foreach (var user in users)
        {
            if (user.PasswordChangedAt == default)
            {
                user.PasswordChangedAt = user.CreatedAt == default ? DateTime.Now : user.CreatedAt;
            }
        }
    }

    private string? ReadDocumentAsBase64(string storedPath)
    {
        if (string.IsNullOrWhiteSpace(storedPath))
        {
            return null;
        }

        var fullPath = Path.Combine(_environment.ContentRootPath, storedPath);
        if (!System.IO.File.Exists(fullPath))
        {
            return null;
        }

        return Convert.ToBase64String(System.IO.File.ReadAllBytes(fullPath));
    }

    private void WriteDocumentFromBase64(string storedPath, string? base64Content)
    {
        if (string.IsNullOrWhiteSpace(storedPath) || string.IsNullOrWhiteSpace(base64Content))
        {
            return;
        }

        var fullPath = Path.Combine(_environment.ContentRootPath, storedPath);
        var directory = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        System.IO.File.WriteAllBytes(fullPath, Convert.FromBase64String(base64Content));
    }

    private sealed record BackupDocumentDto(
        int Id,
        int PersonId,
        string FileName,
        string ContentType,
        long FileSize,
        string StoredFileName,
        string StoredPath,
        DateTime UploadedAt,
        string UploadedBy,
        string? ContentBase64);

    private sealed record BackupLibraryDocumentDto(
        int Id,
        string Title,
        string Description,
        string Category,
        string FileName,
        string ContentType,
        long FileSize,
        string StoredFileName,
        string StoredPath,
        DateTime UploadedAt,
        string UploadedBy,
        string? ContentBase64);
}
