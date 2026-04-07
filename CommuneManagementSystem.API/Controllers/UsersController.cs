using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    // GET: api/Users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUserDto>>> GetAll()
    {
        var users = await _db.AppUsers
            .Select(u => new AppUserDto(u.Id, u.Username, u.FullName, u.Role, u.CreatedAt, u.LastLoginAt, u.Status))
            .ToListAsync();
        return Ok(users);
    }

    // GET: api/Users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<AppUserDto>> GetById(int id)
    {
        var u = await _db.AppUsers.FindAsync(id);
        if (u == null) return NotFound();
        return Ok(new AppUserDto(u.Id, u.Username, u.FullName, u.Role, u.CreatedAt, u.LastLoginAt, u.Status));
    }

    // POST: api/Users
    [HttpPost]
    public async Task<ActionResult<AppUserDto>> Create([FromBody] CreateAppUserDto dto)
    {
        if (_db.AppUsers.Any(u => u.Username == dto.Username))
            return BadRequest("Tài khoản đã tồn tại.");

        var user = new AppUser
        {
            Username = dto.Username,
            PasswordHash = dto.Password,
            FullName = dto.FullName,
            Role = dto.Role,
            CreatedAt = DateTime.Now,
            Status = "Active"
        };

        _db.AppUsers.Add(user);
        await _db.SaveChangesAsync();

        return Created("", new AppUserDto(user.Id, user.Username, user.FullName, user.Role, user.CreatedAt, null, user.Status));
    }

    // PUT: api/Users/5
    [HttpPut("{id}")]
    public async Task<ActionResult<AppUserDto>> Update(int id, [FromBody] UpdateAppUserDto dto)
    {
        var u = await _db.AppUsers.FindAsync(id);
        if (u == null) return NotFound();

        if (dto.FullName != null) u.FullName = dto.FullName;
        if (dto.Role != null) u.Role = dto.Role;
        if (dto.Status != null) u.Status = dto.Status;

        await _db.SaveChangesAsync();

        return Ok(new AppUserDto(u.Id, u.Username, u.FullName, u.Role, u.CreatedAt, u.LastLoginAt, u.Status));
    }

    // DELETE: api/Users/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var u = await _db.AppUsers.FindAsync(id);
        if (u == null) return NotFound();
        _db.AppUsers.Remove(u);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ======== BACKUP ========
    [HttpGet("backup")]
    public async Task<ActionResult> Backup()
    {
        // Mock backup - trả về thông tin DB
        var stats = new
        {
            Households = await _db.Households.CountAsync(),
            Persons = await _db.Persons.CountAsync(),
            Users = await _db.AppUsers.CountAsync(),
            TempResidences = await _db.TemporaryResidences.CountAsync(),
            TempAbsences = await _db.TemporaryAbsences.CountAsync(),
            BackedUpAt = DateTime.Now
        };

        return Ok(new { message = "Sao lưu dữ liệu thành công", details = stats });
    }

    // ======== SYSTEM LOGS ========
    [HttpGet("logs")]
    public async Task<ActionResult<IEnumerable<SystemLogDto>>> GetLogs([FromQuery] int top = 50)
    {
        var logs = await _db.SystemLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(top)
            .Select(l => new SystemLogDto(
                l.Id, l.UserId, l.Username, l.Action, l.Module,
                l.Detail, l.CreatedAt, l.IpAddress))
            .ToListAsync();

        return Ok(logs);
    }
}
