using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db) => _db = db;

    // ======== STATISTICS ========
    [HttpGet("statistics")]
    public async Task<ActionResult<PopulationStatsDto>> GetStatistics()
    {
        var totalPop = await _db.Persons.CountAsync();
        var male = await _db.Persons.CountAsync(p => p.Gender == "Nam");
        var female = await _db.Persons.CountAsync(p => p.Gender == "Nữ");
        var alive = await _db.Persons.CountAsync(p => p.Status == "Alive");
        var dead = await _db.Persons.CountAsync(p => p.Status == "Dead");
        var moved = await _db.Persons.CountAsync(p => p.Status == "Moved");
        var totalHH = await _db.Households.CountAsync();
        var activeHH = await _db.Households.CountAsync(h => h.Status == "Active");
        var movedHH = await _db.Households.CountAsync(h => h.Status == "Moved");
        var tempResident = await _db.TemporaryResidences.CountAsync(t => t.Status == "Active");
        var tempAbsent = await _db.TemporaryAbsences.CountAsync(t => t.Status == "Active");

        return Ok(new PopulationStatsDto(
            totalPop, male, female, alive, dead, moved,
            totalHH, activeHH, movedHH, tempResident, tempAbsent
        ));
    }

    // ======== HOUSEHOLD REPORT ========
    [HttpGet("households")]
    public async Task<ActionResult> ExportHouseholds()
    {
        var headNames = await _db.Persons.ToDictionaryAsync(p => p.Id, p => p.FullName);

        var households = await _db.Households
            .Include(h => h.Members)
            .Select(h => new
            {
                h.Id,
                h.HouseholdNumber,
                h.Address,
                HeadPersonName = h.HeadPersonId.HasValue && headNames.ContainsKey(h.HeadPersonId.Value)
                    ? headNames[h.HeadPersonId.Value]
                    : null,
                MemberCount = h.Members.Count,
                h.Status,
                h.CreatedAt
            }).ToListAsync();

        return Ok(new
        {
            type = "households",
            title = "BÁO CÁO DANH SÁCH HỘ KHẨU",
            data = households,
            generatedAt = DateTime.Now
        });
    }

    // ======== POPULATION REPORT ========
    [HttpGet("population")]
    public async Task<ActionResult> ExportPopulation(
        [FromQuery] string? status, [FromQuery] string? gender)
    {
        var query = _db.Persons.Include(p => p.Household).AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(p => p.Status == status);
        if (!string.IsNullOrEmpty(gender)) query = query.Where(p => p.Gender == gender);

        var persons = await query.Select(p => new
        {
            p.Id,
            p.FullName,
            p.DateOfBirth,
            p.Gender,
            p.NationalId,
            p.Ethnicity,
            p.Occupation,
            HouseholdNumber = p.Household != null ? p.Household.HouseholdNumber : null,
            p.Status
        }).ToListAsync();

        return Ok(new
        {
            type = "population",
            title = "BÁO CÁO NHÂN KHẨU",
            data = persons,
            generatedAt = DateTime.Now,
            filter = new { status, gender }
        });
    }

    // ======== TEMPORARY RESIDENCE REPORT ========
    [HttpGet("temporary-residence")]
    public async Task<ActionResult> ExportTempResidence()
    {
        var data = await _db.TemporaryResidences
            .Include(t => t.Person)
            .Where(t => t.Status == "Active")
            .Select(t => new
            {
                t.Id,
                PersonName = t.Person != null ? t.Person.FullName : "",
                t.Address,
                t.StartDate,
                t.EndDate,
                t.Reason,
                t.Status
            }).ToListAsync();

        return Ok(new
        {
            type = "temp-residence",
            title = "BÁO CÁO ĐĂNG KÝ TẠM TRÚ",
            data,
            generatedAt = DateTime.Now
        });
    }

    // ======== TEMPORARY ABSENCE REPORT ========
    [HttpGet("temporary-absence")]
    public async Task<ActionResult> ExportTempAbsence()
    {
        var data = await _db.TemporaryAbsences
            .Include(t => t.Person)
            .Where(t => t.Status == "Active")
            .Select(t => new
            {
                t.Id,
                PersonName = t.Person != null ? t.Person.FullName : "",
                t.StartDate,
                t.EndDate,
                t.Destination,
                t.Reason,
                t.Status
            }).ToListAsync();

        return Ok(new
        {
            type = "temp-absence",
            title = "BÁO CÁO ĐĂNG KÝ TẠM VẮNG",
            data,
            generatedAt = DateTime.Now
        });
    }
}
