using System.Text.Json;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.Infrastructure;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Services;

public interface ISystemLogService
{
    Task LogAsync(
        HttpContext httpContext,
        string action,
        string module,
        string? detail,
        object? oldValue = null,
        object? newValue = null,
        AppUser? actor = null);
}

public sealed class SystemLogService : ISystemLogService
{
    private readonly AppDbContext _db;

    public SystemLogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(
        HttpContext httpContext,
        string action,
        string module,
        string? detail,
        object? oldValue = null,
        object? newValue = null,
        AppUser? actor = null)
    {
        var user = actor ?? httpContext.GetCurrentUser();

        _db.SystemLogs.Add(new SystemLog
        {
            UserId = user?.Id,
            Username = user?.Username ?? "system",
            Action = action,
            Module = module,
            Detail = detail,
            OldValue = Serialize(oldValue),
            NewValue = Serialize(newValue),
            CreatedAt = DateTime.Now,
            IpAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
        });

        await _db.SaveChangesAsync();
    }

    private static string? Serialize(object? value)
    {
        return value is null ? null : JsonSerializer.Serialize(value);
    }
}
