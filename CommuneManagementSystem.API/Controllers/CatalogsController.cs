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
public class CatalogsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public CatalogsController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CatalogItemDto>>> GetAll([FromQuery] string? type)
    {
        var query = _db.CatalogItems.AsQueryable();
        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(item => item.Type == type);
        }

        var items = await query
            .OrderBy(item => item.Type)
            .ThenBy(item => item.Name)
            .Select(item => new CatalogItemDto(
                item.Id,
                item.Type,
                item.Code,
                item.Name,
                item.Description,
                item.IsActive,
                item.CreatedAt,
                item.UpdatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<CatalogItemDto>> Create([FromBody] CreateCatalogItemDto dto)
    {
        if (await _db.CatalogItems.AnyAsync(item => item.Type == dto.Type && item.Code == dto.Code))
        {
            return BadRequest(new { message = "Ma danh muc da ton tai." });
        }

        var actor = HttpContext.GetCurrentUser()!;
        var item = new CatalogItem
        {
            Type = dto.Type,
            Code = dto.Code,
            Name = dto.Name,
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };

        _db.CatalogItems.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao danh muc", "System", $"Tao danh muc {item.Type}:{item.Code}", actor: actor);

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, Map(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CatalogItemDto>> Update(int id, [FromBody] UpdateCatalogItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.CatalogItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Code = dto.Code;
        item.Name = dto.Name;
        item.Description = dto.Description;
        item.IsActive = dto.IsActive;
        item.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Cap nhat danh muc", "System", $"Cap nhat danh muc {item.Type}:{item.Code}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.CatalogItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.CatalogItems.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa danh muc", "System", $"Xoa danh muc {item.Type}:{item.Code}", actor: actor);
        return NoContent();
    }

    private static CatalogItemDto Map(CatalogItem item)
    {
        return new CatalogItemDto(
            item.Id,
            item.Type,
            item.Code,
            item.Name,
            item.Description,
            item.IsActive,
            item.CreatedAt,
            item.UpdatedAt);
    }
}
