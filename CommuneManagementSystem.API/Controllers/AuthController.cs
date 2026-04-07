using Microsoft.AspNetCore.Mvc;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var user = _db.AppUsers.FirstOrDefault(u =>
            u.Username == request.Username &&
            u.PasswordHash == request.Password &&
            u.Status == "Active");

        if (user == null)
            return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không đúng." });

        user.LastLoginAt = DateTime.Now;
        _db.SaveChanges();

        // Ghi log
        _db.SystemLogs.Add(new SystemLog
        {
            UserId = user.Id,
            Username = user.Username,
            Action = "Đăng nhập",
            Module = "System",
            Detail = $"Đăng nhập thành công",
            CreatedAt = DateTime.Now,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
        });
        _db.SaveChanges();

        return Ok(new LoginResponse(user.Id, user.Username, user.FullName, user.Role, "mock-jwt-token"));
    }

    [HttpGet("me")]
    public ActionResult<LoginResponse> GetCurrentUser([FromHeader(Name = "Authorization")] string? token)
    {
        // Mock: lấy user đầu tiên nếu có token
        if (string.IsNullOrEmpty(token))
            return Unauthorized();

        var user = _db.AppUsers.First();
        return Ok(new LoginResponse(user.Id, user.Username, user.FullName, user.Role, token));
    }
}
