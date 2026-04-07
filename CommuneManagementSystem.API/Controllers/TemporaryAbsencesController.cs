using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemporaryAbsencesController : ControllerBase
{
    private readonly AppDbContext _db;

    public TemporaryAbsencesController(AppDbContext db) => _db = db;

    // GET: api/TemporaryAbsences
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TempAbsenceDto>>> GetAll([FromQuery] string? status)
    {
        var query = _db.TemporaryAbsences.Include(t => t.Person).AsQueryable();
        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        var result = await query.Select(t => new TempAbsenceDto(
            t.Id, t.PersonId, t.Person != null ? t.Person.FullName : null,
            t.StartDate, t.EndDate, t.ExtendedTo, t.Reason, t.Destination, t.Status
        )).ToListAsync();

        return Ok(result);
    }

    // GET: api/TemporaryAbsences/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TempAbsenceDto>> GetById(int id)
    {
        var t = await _db.TemporaryAbsences.Include(t => t.Person).FirstOrDefaultAsync(t => t.Id == id);
        if (t == null) return NotFound();

        return Ok(new TempAbsenceDto(
            t.Id, t.PersonId, t.Person?.FullName, t.StartDate,
            t.EndDate, t.ExtendedTo, t.Reason, t.Destination, t.Status));
    }

    // POST: api/TemporaryAbsences
    [HttpPost]
    public async Task<ActionResult<TempAbsenceDto>> Create([FromBody] CreateTempAbsenceDto dto)
    {
        var ta = new TemporaryAbsence
        {
            PersonId = dto.PersonId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            Destination = dto.Destination,
            CreatedAt = DateTime.Now,
            Status = "Active"
        };

        _db.TemporaryAbsences.Add(ta);
        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(dto.PersonId);
        return Created("", new TempAbsenceDto(
            ta.Id, ta.PersonId, person?.FullName, ta.StartDate,
            ta.EndDate, null, ta.Reason, ta.Destination, ta.Status));
    }

    // PUT: api/TemporaryAbsences/extend
    [HttpPut("extend")]
    public async Task<ActionResult<TempAbsenceDto>> Extend([FromBody] ExtendTempAbsenceDto dto)
    {
        var ta = await _db.TemporaryAbsences.FindAsync(dto.Id);
        if (ta == null) return NotFound();

        ta.ExtendedTo = dto.NewEndDate;
        ta.EndDate = dto.NewEndDate;

        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(ta.PersonId);
        return Ok(new TempAbsenceDto(
            ta.Id, ta.PersonId, person?.FullName, ta.StartDate,
            ta.EndDate, ta.ExtendedTo, ta.Reason, ta.Destination, ta.Status));
    }

    // DELETE: api/TemporaryAbsences/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Cancel(int id)
    {
        var ta = await _db.TemporaryAbsences.FindAsync(id);
        if (ta == null) return NotFound();

        ta.Status = "Cancelled";
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
