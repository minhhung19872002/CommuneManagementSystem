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
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public NotificationsController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] bool mine = false)
    {
        var currentUser = HttpContext.GetCurrentUser();
        var query = _db.NotificationItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item => item.Title.Contains(search) || item.Content.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        if (currentUser?.Role != "Admin")
        {
            query = mine
                ? query.Where(item => item.CreatedByUserId == currentUser!.Id)
                : query.Where(item =>
                    item.Status == "Published" &&
                    (item.AudienceRole == null || item.AudienceRole == currentUser!.Role));
        }
        else if (mine)
        {
            query = query.Where(item => item.CreatedByUserId == currentUser!.Id);
        }

        var items = await query
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new NotificationDto(
                item.Id,
                item.Title,
                item.Summary,
                item.Content,
                item.AudienceRole,
                item.Status,
                item.CreatedByName,
                item.CreatedAt,
                item.ReviewedByName,
                item.ReviewedAt,
                item.ReviewNote))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<NotificationDto>> Create([FromBody] CreateNotificationDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = new NotificationItem
        {
            Title = dto.Title,
            Summary = dto.Summary,
            Content = dto.Content,
            AudienceRole = string.IsNullOrWhiteSpace(dto.AudienceRole) ? null : dto.AudienceRole,
            Status = "Draft",
            CreatedByUserId = currentUser.Id,
            CreatedByName = currentUser.FullName,
            CreatedAt = DateTime.Now,
        };

        _db.NotificationItems.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao thong bao", "ThongBao", $"Tao thong bao {item.Title}", actor: currentUser);

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, Map(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<NotificationDto>> Update(int id, [FromBody] UpdateNotificationDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.NotificationItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        if (currentUser.Role != "Admin" && item.CreatedByUserId != currentUser.Id)
        {
            return Forbid();
        }

        item.Title = dto.Title;
        item.Summary = dto.Summary;
        item.Content = dto.Content;
        item.AudienceRole = string.IsNullOrWhiteSpace(dto.AudienceRole) ? null : dto.AudienceRole;
        if (item.Status == "Rejected")
        {
            item.Status = "Draft";
            item.ReviewNote = null;
            item.ReviewedAt = null;
            item.ReviewedByName = null;
            item.ReviewedByUserId = null;
        }

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat thong bao", "ThongBao", $"Cap nhat thong bao {item.Title}", actor: currentUser);
        return Ok(Map(item));
    }

    [HttpPost("{id}/review")]
    [RequireRoles("Admin")]
    public async Task<ActionResult<NotificationDto>> Review(int id, [FromBody] ReviewNotificationDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.NotificationItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Status = dto.Status;
        item.ReviewNote = dto.ReviewNote;
        item.ReviewedAt = DateTime.Now;
        item.ReviewedByUserId = currentUser.Id;
        item.ReviewedByName = currentUser.FullName;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Duyet thong bao", "ThongBao", $"Cap nhat trang thai thong bao {item.Title} -> {item.Status}", actor: currentUser);
        return Ok(Map(item));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.NotificationItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        if (currentUser.Role != "Admin" && item.CreatedByUserId != currentUser.Id)
        {
            return Forbid();
        }

        _db.NotificationItems.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa thong bao", "ThongBao", $"Xoa thong bao {item.Title}", actor: currentUser);
        return NoContent();
    }

    private static NotificationDto Map(NotificationItem item)
    {
        return new NotificationDto(
            item.Id,
            item.Title,
            item.Summary,
            item.Content,
            item.AudienceRole,
            item.Status,
            item.CreatedByName,
            item.CreatedAt,
            item.ReviewedByName,
            item.ReviewedAt,
            item.ReviewNote);
    }
}
