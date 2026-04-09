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
public class MeetingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public MeetingsController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MeetingEventDto>>> GetAll([FromQuery] string? search, [FromQuery] string? status)
    {
        var currentUser = HttpContext.GetCurrentUser();
        var query = _db.MeetingEvents.Include(item => item.Registrations).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item =>
                item.Title.Contains(search) ||
                item.Location.Contains(search) ||
                item.Agenda.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var meetings = await query
            .OrderBy(item => item.StartsAt)
            .Select(item => new MeetingEventDto(
                item.Id,
                item.Title,
                item.Agenda,
                item.Location,
                item.StartsAt,
                item.EndsAt,
                item.Status,
                item.CreatedByName,
                item.CreatedAt,
                item.Registrations.Count,
                currentUser != null && item.Registrations.Any(registration => registration.UserId == currentUser.Id)))
            .ToListAsync();

        return Ok(meetings);
    }

    [HttpPost]
    public async Task<ActionResult<MeetingEventDto>> Create([FromBody] CreateMeetingEventDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = new MeetingEvent
        {
            Title = dto.Title,
            Agenda = dto.Agenda,
            Location = dto.Location,
            StartsAt = dto.StartsAt,
            EndsAt = dto.EndsAt,
            Status = "Scheduled",
            CreatedByUserId = currentUser.Id,
            CreatedByName = currentUser.FullName,
            CreatedAt = DateTime.Now,
        };

        _db.MeetingEvents.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao lich hop", "LichHop", $"Tao lich hop {item.Title}", actor: currentUser);

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, Map(item, false));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MeetingEventDto>> Update(int id, [FromBody] UpdateMeetingEventDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.MeetingEvents.Include(meeting => meeting.Registrations).FirstOrDefaultAsync(meeting => meeting.Id == id);
        if (item == null)
        {
            return NotFound();
        }

        item.Title = dto.Title;
        item.Agenda = dto.Agenda;
        item.Location = dto.Location;
        item.StartsAt = dto.StartsAt;
        item.EndsAt = dto.EndsAt;
        item.Status = dto.Status;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Cap nhat lich hop", "LichHop", $"Cap nhat lich hop {item.Title}", actor: currentUser);
        return Ok(Map(item, item.Registrations.Any(registration => registration.UserId == currentUser.Id)));
    }

    [HttpPost("{id}/register")]
    public async Task<ActionResult> Register(int id, [FromBody] RegisterMeetingDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var meeting = await _db.MeetingEvents.FindAsync(id);
        if (meeting == null)
        {
            return NotFound();
        }

        var exists = await _db.MeetingRegistrations.AnyAsync(registration => registration.MeetingEventId == id && registration.UserId == currentUser.Id);
        if (!exists)
        {
            _db.MeetingRegistrations.Add(new MeetingRegistration
            {
                MeetingEventId = id,
                UserId = currentUser.Id,
                UserName = currentUser.FullName,
                RegisteredAt = DateTime.Now,
                Note = dto.Note,
            });
            await _db.SaveChangesAsync();
        }

        await _logs.LogAsync(HttpContext, "Dang ky lich hop", "LichHop", $"Dang ky tham du {meeting.Title}", actor: currentUser);
        return Ok(new { message = "Dang ky lich hop thanh cong." });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var meeting = await _db.MeetingEvents.FindAsync(id);
        if (meeting == null)
        {
            return NotFound();
        }

        _db.MeetingEvents.Remove(meeting);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa lich hop", "LichHop", $"Xoa lich hop {meeting.Title}", actor: currentUser);
        return NoContent();
    }

    private static MeetingEventDto Map(MeetingEvent item, bool isRegistered)
    {
        return new MeetingEventDto(
            item.Id,
            item.Title,
            item.Agenda,
            item.Location,
            item.StartsAt,
            item.EndsAt,
            item.Status,
            item.CreatedByName,
            item.CreatedAt,
            item.Registrations.Count,
            isRegistered);
    }
}
