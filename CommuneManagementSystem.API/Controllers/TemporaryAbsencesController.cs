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
public class TemporaryAbsencesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public TemporaryAbsencesController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TempAbsenceDto>>> GetAll([FromQuery] string? status)
    {
        await RefreshStatusesAsync();

        var query = _db.TemporaryAbsences.Include(item => item.Person).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var result = await query
            .Select(item => new TempAbsenceDto(
                item.Id,
                item.PersonId,
                item.Person != null ? item.Person.FullName : null,
                item.StartDate,
                item.EndDate,
                item.ExtendedTo,
                item.Reason,
                item.Destination,
                item.Status))
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TempAbsenceDto>> GetById(int id)
    {
        var item = await _db.TemporaryAbsences.Include(entry => entry.Person).FirstOrDefaultAsync(entry => entry.Id == id);
        if (item == null)
        {
            return NotFound();
        }

        return Ok(new TempAbsenceDto(
            item.Id,
            item.PersonId,
            item.Person?.FullName,
            item.StartDate,
            item.EndDate,
            item.ExtendedTo,
            item.Reason,
            item.Destination,
            item.Status));
    }

    [HttpPost]
    public async Task<ActionResult<TempAbsenceDto>> Create([FromBody] CreateTempAbsenceDto dto)
    {
        var item = new Models.TemporaryAbsence
        {
            PersonId = dto.PersonId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            Destination = dto.Destination,
            CreatedAt = DateTime.Now,
            Status = "Active",
        };

        _db.TemporaryAbsences.Add(item);
        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(dto.PersonId);
        await _logs.LogAsync(
            HttpContext,
            "Đăng ký tạm vắng",
            "TamVang",
            $"Đăng ký tạm vắng cho {person?.FullName ?? dto.PersonId.ToString()}",
            newValue: new { item.Id, item.PersonId, item.Destination, item.StartDate, item.EndDate });

        return Created(string.Empty, new TempAbsenceDto(
            item.Id,
            item.PersonId,
            person?.FullName,
            item.StartDate,
            item.EndDate,
            null,
            item.Reason,
            item.Destination,
            item.Status));
    }

    [HttpPut("extend")]
    public async Task<ActionResult<TempAbsenceDto>> Extend([FromBody] ExtendTempAbsenceDto dto)
    {
        var item = await _db.TemporaryAbsences.FindAsync(dto.Id);
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
            "Gia hạn tạm vắng",
            "TamVang",
            $"Gia hạn tạm vắng cho {person?.FullName ?? item.PersonId.ToString()}",
            newValue: new { item.Id, item.EndDate });

        return Ok(new TempAbsenceDto(
            item.Id,
            item.PersonId,
            person?.FullName,
            item.StartDate,
            item.EndDate,
            item.ExtendedTo,
            item.Reason,
            item.Destination,
            item.Status));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Cancel(int id)
    {
        var item = await _db.TemporaryAbsences.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Status = "Cancelled";
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Hủy tạm vắng",
            "TamVang",
            $"Hủy đăng ký tạm vắng #{item.Id}",
            oldValue: new { item.Id, item.PersonId, item.Destination });

        return NoContent();
    }

    private async Task RefreshStatusesAsync()
    {
        var returnedItems = await _db.TemporaryAbsences
            .Where(item => item.Status == "Active" && item.EndDate.Date < DateTime.Today)
            .ToListAsync();

        if (returnedItems.Count == 0)
        {
            return;
        }

        foreach (var item in returnedItems)
        {
            item.Status = "Returned";
        }

        await _db.SaveChangesAsync();
    }
}
