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
[RequireRoles("Admin", "NhanKhau", "HoKhau")]
public class WorkSchedulesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public WorkSchedulesController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkScheduleEntryDto>>> GetAll([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? search)
    {
        var query = _db.WorkScheduleEntries.AsQueryable();

        if (fromDate.HasValue)
        {
            query = query.Where(item => item.WorkDate.Date >= fromDate.Value.Date);
        }

        if (toDate.HasValue)
        {
            query = query.Where(item => item.WorkDate.Date <= toDate.Value.Date);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item => item.Title.Contains(search) || item.Content.Contains(search));
        }

        var items = await query
            .OrderBy(item => item.WorkDate)
            .ThenBy(item => item.Session)
            .Select(item => new WorkScheduleEntryDto(
                item.Id,
                item.Title,
                item.Content,
                item.WorkDate,
                item.Session,
                item.AssignedUserId,
                item.AssignedUserName,
                item.CreatedByName,
                item.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<WorkScheduleEntryDto>> Create([FromBody] CreateWorkScheduleEntryDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var assignedUser = dto.AssignedUserId.HasValue ? await _db.AppUsers.FindAsync(dto.AssignedUserId.Value) : null;
        var item = new WorkScheduleEntry
        {
            Title = dto.Title,
            Content = dto.Content,
            WorkDate = dto.WorkDate,
            Session = dto.Session,
            AssignedUserId = dto.AssignedUserId,
            AssignedUserName = assignedUser?.FullName,
            CreatedByUserId = currentUser.Id,
            CreatedByName = currentUser.FullName,
            CreatedAt = DateTime.Now,
        };

        _db.WorkScheduleEntries.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao lich lam viec", "LichLamViec", $"Tao lich lam viec {item.Title}", actor: currentUser);

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, Map(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkScheduleEntryDto>> Update(int id, [FromBody] UpdateWorkScheduleEntryDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.WorkScheduleEntries.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        var assignedUser = dto.AssignedUserId.HasValue ? await _db.AppUsers.FindAsync(dto.AssignedUserId.Value) : null;
        item.Title = dto.Title;
        item.Content = dto.Content;
        item.WorkDate = dto.WorkDate;
        item.Session = dto.Session;
        item.AssignedUserId = dto.AssignedUserId;
        item.AssignedUserName = assignedUser?.FullName;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Cap nhat lich lam viec", "LichLamViec", $"Cap nhat lich lam viec {item.Title}", actor: currentUser);
        return Ok(Map(item));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.WorkScheduleEntries.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.WorkScheduleEntries.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa lich lam viec", "LichLamViec", $"Xoa lich lam viec {item.Title}", actor: currentUser);
        return NoContent();
    }

    private static WorkScheduleEntryDto Map(WorkScheduleEntry item)
    {
        return new WorkScheduleEntryDto(
            item.Id,
            item.Title,
            item.Content,
            item.WorkDate,
            item.Session,
            item.AssignedUserId,
            item.AssignedUserName,
            item.CreatedByName,
            item.CreatedAt);
    }
}
