using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Filters;
using CommuneManagementSystem.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[RequireRoles("Admin", "NhanKhau")]
public class TemporaryResidencesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public TemporaryResidencesController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TempResidenceDto>>> GetAll([FromQuery] string? status)
    {
        await RefreshStatusesAsync();

        var query = _db.TemporaryResidences.Include(item => item.Person).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var result = await query
            .Select(item => new TempResidenceDto(
                item.Id,
                item.PersonId,
                item.Person != null ? item.Person.FullName : null,
                item.Address,
                item.StartDate,
                item.EndDate,
                item.ExtendedTo,
                item.Reason,
                item.Status))
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TempResidenceDto>> GetById(int id)
    {
        var item = await _db.TemporaryResidences.Include(entry => entry.Person).FirstOrDefaultAsync(entry => entry.Id == id);
        if (item == null)
        {
            return NotFound();
        }

        return Ok(new TempResidenceDto(
            item.Id,
            item.PersonId,
            item.Person?.FullName,
            item.Address,
            item.StartDate,
            item.EndDate,
            item.ExtendedTo,
            item.Reason,
            item.Status));
    }

    [HttpPost]
    public async Task<ActionResult<TempResidenceDto>> Create([FromBody] CreateTempResidenceDto dto)
    {
        var item = new Models.TemporaryResidence
        {
            PersonId = dto.PersonId,
            Address = dto.Address,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            CreatedAt = DateTime.Now,
            Status = "Active",
        };

        _db.TemporaryResidences.Add(item);
        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(dto.PersonId);
        await _logs.LogAsync(
            HttpContext,
            "Đăng ký tạm trú",
            "TamTru",
            $"Đăng ký tạm trú cho {person?.FullName ?? dto.PersonId.ToString()}",
            newValue: new { item.Id, item.PersonId, item.Address, item.StartDate, item.EndDate });

        return Created(string.Empty, new TempResidenceDto(
            item.Id,
            item.PersonId,
            person?.FullName,
            item.Address,
            item.StartDate,
            item.EndDate,
            null,
            item.Reason,
            item.Status));
    }

    [HttpPut("extend")]
    public async Task<ActionResult<TempResidenceDto>> Extend([FromBody] ExtendTempResidenceDto dto)
    {
        var item = await _db.TemporaryResidences.FindAsync(dto.Id);
        if (item == null)
        {
            return NotFound();
        }

        item.ExtendedTo = dto.NewEndDate;
        item.EndDate = dto.NewEndDate;
        item.Status = "Active";
        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(item.PersonId);
        await _logs.LogAsync(
            HttpContext,
            "Gia hạn tạm trú",
            "TamTru",
            $"Gia hạn tạm trú cho {person?.FullName ?? item.PersonId.ToString()}",
            newValue: new { item.Id, item.EndDate });

        return Ok(new TempResidenceDto(
            item.Id,
            item.PersonId,
            person?.FullName,
            item.Address,
            item.StartDate,
            item.EndDate,
            item.ExtendedTo,
            item.Reason,
            item.Status));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Cancel(int id)
    {
        var item = await _db.TemporaryResidences.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Status = "Cancelled";
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Hủy tạm trú",
            "TamTru",
            $"Hủy đăng ký tạm trú #{item.Id}",
            oldValue: new { item.Id, item.PersonId, item.Address });

        return NoContent();
    }

    private async Task RefreshStatusesAsync()
    {
        var expiredItems = await _db.TemporaryResidences
            .Where(item => item.Status == "Active" && item.EndDate.Date < DateTime.Today)
            .ToListAsync();

        if (expiredItems.Count == 0)
        {
            return;
        }

        foreach (var item in expiredItems)
        {
            item.Status = "Expired";
        }

        await _db.SaveChangesAsync();
    }
}
