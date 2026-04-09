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
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public AuthController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _db.AppUsers.FirstOrDefaultAsync(candidate =>
            candidate.Username == request.Username &&
            candidate.PasswordHash == request.Password &&
            candidate.Status == "Active");

        if (user == null)
        {
            await _logs.LogAsync(
                HttpContext,
                "Dang nhap that bai",
                "System",
                $"Sai tai khoan hoac mat khau: {request.Username}",
                actor: new AppUser { Username = request.Username, FullName = request.Username });

            return Unauthorized(new { message = "Tai khoan hoac mat khau khong dung." });
        }

        user.LastLoginAt = DateTime.Now;
        await _db.SaveChangesAsync();

        HttpContext.SetCurrentUser(user);
        await _logs.LogAsync(HttpContext, "Dang nhap", "System", "Dang nhap thanh cong", actor: user);

        return Ok(await BuildLoginResponseAsync(user, $"mock-jwt-token-{user.Id}"));
    }

    [HttpGet("me")]
    public async Task<ActionResult<LoginResponse>> GetCurrentUser([FromHeader(Name = "Authorization")] string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return Unauthorized();
        }

        var rawToken = token.Replace("Bearer ", string.Empty, StringComparison.OrdinalIgnoreCase);
        var userId = RequestUserExtensions.TryParseUserId(rawToken);
        var user = userId.HasValue
            ? await _db.AppUsers.FirstOrDefaultAsync(candidate => candidate.Id == userId.Value)
            : await _db.AppUsers.FirstOrDefaultAsync();

        if (user is null)
        {
            return Unauthorized();
        }

        HttpContext.SetCurrentUser(user);
        return Ok(await BuildLoginResponseAsync(user, rawToken));
    }

    [HttpPut("profile")]
    [RequireRoles("Admin", "NhanKhau", "HoKhau")]
    public async Task<ActionResult<LoginResponse>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        var snapshot = new { currentUser.FullName, currentUser.Email, currentUser.PhoneNumber };

        currentUser.FullName = dto.FullName;
        currentUser.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
        currentUser.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim();
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Cap nhat ho so tai khoan",
            "System",
            $"Nguoi dung {currentUser.Username} cap nhat ho so",
            oldValue: snapshot,
            newValue: new { currentUser.FullName, currentUser.Email, currentUser.PhoneNumber },
            actor: currentUser);

        var token = HttpContext.Request.ReadBearerToken() ?? $"mock-jwt-token-{currentUser.Id}";
        return Ok(await BuildLoginResponseAsync(currentUser, token));
    }

    [HttpPost("change-password")]
    [RequireRoles("Admin", "NhanKhau", "HoKhau")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (currentUser == null)
        {
            return Unauthorized();
        }

        if (currentUser.PasswordHash != dto.CurrentPassword)
        {
            return BadRequest(new { message = "Mat khau hien tai khong dung." });
        }

        currentUser.PasswordHash = dto.NewPassword;
        currentUser.PasswordChangedAt = DateTime.Now;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Doi mat khau", "System", $"Nguoi dung {currentUser.Username} doi mat khau", actor: currentUser);
        return Ok(new { message = "Doi mat khau thanh cong." });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var user = await _db.AppUsers.FirstOrDefaultAsync(candidate => candidate.Username == dto.Username);
        if (user == null)
        {
            return NotFound(new { message = "Khong tim thay tai khoan." });
        }

        if (!string.IsNullOrWhiteSpace(dto.FullName) &&
            !string.Equals(user.FullName, dto.FullName, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Thong tin xac thuc khong dung." });
        }

        user.PasswordHash = dto.NewPassword;
        user.PasswordChangedAt = DateTime.Now;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Reset mat khau", "System", $"Reset mat khau cho {user.Username}", actor: user);
        return Ok(new { message = "Reset mat khau thanh cong. Hay dang nhap lai voi mat khau moi." });
    }

    [HttpGet("login-history")]
    [RequireRoles("Admin", "NhanKhau", "HoKhau")]
    public async Task<ActionResult<IEnumerable<SystemLogDto>>> GetLoginHistory([FromQuery] int top = 50, [FromQuery] bool all = false)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var query = _db.SystemLogs
            .Where(log => log.Action == "Dang nhap" || log.Action == "Dang nhap that bai")
            .AsQueryable();

        if (!string.Equals(currentUser.Role, "Admin", StringComparison.OrdinalIgnoreCase) || !all)
        {
            query = query.Where(log => log.UserId == currentUser.Id || log.Username == currentUser.Username);
        }

        var logs = await query
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

    [HttpGet("directory")]
    [RequireRoles("Admin", "NhanKhau", "HoKhau")]
    public async Task<ActionResult<IEnumerable<AppUserDto>>> GetDirectory()
    {
        var users = await _db.AppUsers
            .Where(user => user.Status == "Active")
            .OrderBy(user => user.FullName)
            .Select(user => new AppUserDto(
                user.Id,
                user.Username,
                user.FullName,
                user.Role,
                user.CreatedAt,
                user.LastLoginAt,
                user.Status,
                user.Email,
                user.PhoneNumber,
                user.PasswordChangedAt == default ? user.CreatedAt : user.PasswordChangedAt))
            .ToListAsync();

        return Ok(users);
    }

    private async Task<LoginResponse> BuildLoginResponseAsync(AppUser user, string token)
    {
        var expiryDays = await GetIntSettingAsync("PasswordExpiryDays", 90);
        var warningDays = await GetIntSettingAsync("PasswordWarningDays", 10);

        DateTime? passwordExpiresAt = null;
        var passwordNearExpiry = false;
        var passwordExpired = false;
        string? passwordWarningMessage = null;

        if (expiryDays > 0)
        {
            var passwordChangedAt = user.PasswordChangedAt == default ? user.CreatedAt : user.PasswordChangedAt;
            passwordExpiresAt = passwordChangedAt.AddDays(expiryDays);

            if (DateTime.Now >= passwordExpiresAt.Value)
            {
                passwordExpired = true;
                passwordWarningMessage = $"Mat khau da het han tu {passwordExpiresAt.Value:dd/MM/yyyy}.";
            }
            else if (warningDays > 0 && DateTime.Now >= passwordExpiresAt.Value.AddDays(-warningDays))
            {
                passwordNearExpiry = true;
                var daysLeft = Math.Max(1, (passwordExpiresAt.Value.Date - DateTime.Now.Date).Days);
                passwordWarningMessage = $"Mat khau se het han sau {daysLeft} ngay, vui long doi som.";
            }
        }

        return new LoginResponse(
            user.Id,
            user.Username,
            user.FullName,
            user.Role,
            token,
            user.Email,
            user.PhoneNumber,
            passwordExpiresAt,
            passwordNearExpiry,
            passwordExpired,
            passwordWarningMessage);
    }

    private async Task<int> GetIntSettingAsync(string key, int defaultValue)
    {
        var rawValue = await _db.SystemSettings
            .Where(item => item.Key == key)
            .Select(item => item.Value)
            .FirstOrDefaultAsync();

        return int.TryParse(rawValue, out var parsedValue) ? parsedValue : defaultValue;
    }
}
