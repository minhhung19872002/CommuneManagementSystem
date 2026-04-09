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
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public FeedbackController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeedbackItemDto>>> GetAll([FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.FeedbackItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item =>
                item.FullName.Contains(search) ||
                item.Title.Contains(search) ||
                item.Content.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var items = await query
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new FeedbackItemDto(
                item.Id,
                item.FullName,
                item.ContactInfo,
                item.Title,
                item.Content,
                item.Status,
                item.ResolutionNote,
                item.CreatedAt,
                item.ProcessedAt,
                item.ProcessedByName))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<FeedbackItemDto>> Create([FromBody] CreateFeedbackItemDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = new FeedbackItem
        {
            FullName = dto.FullName,
            ContactInfo = dto.ContactInfo,
            Title = dto.Title,
            Content = dto.Content,
            Status = "Pending",
            CreatedAt = DateTime.Now,
        };

        _db.FeedbackItems.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao phan anh", "PhanAnh", $"Tao phan anh {item.Title}", actor: currentUser);

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, Map(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FeedbackItemDto>> Update(int id, [FromBody] UpdateFeedbackItemDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.FeedbackItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Status = dto.Status;
        item.ResolutionNote = dto.ResolutionNote;
        item.ProcessedAt = DateTime.Now;
        item.ProcessedByName = currentUser.FullName;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Xu ly phan anh", "PhanAnh", $"Cap nhat phan anh {item.Title} -> {item.Status}", actor: currentUser);
        return Ok(Map(item));
    }

    private static FeedbackItemDto Map(FeedbackItem item)
    {
        return new FeedbackItemDto(
            item.Id,
            item.FullName,
            item.ContactInfo,
            item.Title,
            item.Content,
            item.Status,
            item.ResolutionNote,
            item.CreatedAt,
            item.ProcessedAt,
            item.ProcessedByName);
    }
}
