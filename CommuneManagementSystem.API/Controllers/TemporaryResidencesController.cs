using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemporaryResidencesController : ControllerBase
{
    private readonly AppDbContext _db;

    public TemporaryResidencesController(AppDbContext db) => _db = db;

    // GET: api/TemporaryResidences
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TempResidenceDto>>> GetAll([FromQuery] string? status)
    {
        var query = _db.TemporaryResidences.Include(t => t.Person).AsQueryable();
        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        var result = await query.Select(t => new TempResidenceDto(
            t.Id, t.PersonId, t.Person != null ? t.Person.FullName : null,
            t.Address, t.StartDate, t.EndDate, t.ExtendedTo, t.Reason, t.Status
        )).ToListAsync();

        return Ok(result);
    }

    // GET: api/TemporaryResidences/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TempResidenceDto>> GetById(int id)
    {
        var t = await _db.TemporaryResidences.Include(t => t.Person).FirstOrDefaultAsync(t => t.Id == id);
        if (t == null) return NotFound();

        return Ok(new TempResidenceDto(
            t.Id, t.PersonId, t.Person?.FullName, t.Address,
            t.StartDate, t.EndDate, t.ExtendedTo, t.Reason, t.Status));
    }

    // POST: api/TemporaryResidences
    [HttpPost]
    public async Task<ActionResult<TempResidenceDto>> Create([FromBody] CreateTempResidenceDto dto)
    {
        var tr = new TemporaryResidence
        {
            PersonId = dto.PersonId,
            Address = dto.Address,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            CreatedAt = DateTime.Now,
            Status = "Active"
        };

        _db.TemporaryResidences.Add(tr);
        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(dto.PersonId);
        return Created("", new TempResidenceDto(
            tr.Id, tr.PersonId, person?.FullName, tr.Address,
            tr.StartDate, tr.EndDate, null, tr.Reason, tr.Status));
    }

    // PUT: api/TemporaryResidences/extend
    [HttpPut("extend")]
    public async Task<ActionResult<TempResidenceDto>> Extend([FromBody] ExtendTempResidenceDto dto)
    {
        var tr = await _db.TemporaryResidences.FindAsync(dto.Id);
        if (tr == null) return NotFound();

        tr.ExtendedTo = dto.NewEndDate;
        tr.EndDate = dto.NewEndDate;

        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(tr.PersonId);
        return Ok(new TempResidenceDto(
            tr.Id, tr.PersonId, person?.FullName, tr.Address,
            tr.StartDate, tr.EndDate, tr.ExtendedTo, tr.Reason, tr.Status));
    }

    // DELETE: api/TemporaryResidences/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Cancel(int id)
    {
        var tr = await _db.TemporaryResidences.FindAsync(id);
        if (tr == null) return NotFound();

        tr.Status = "Cancelled";
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
