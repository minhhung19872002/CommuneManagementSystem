using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PersonsController(AppDbContext db) => _db = db;

    // GET: api/Persons
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonDto>>> GetAll(
        [FromQuery] string? search, [FromQuery] string? status, [FromQuery] int? householdId)
    {
        var query = _db.Persons.Include(p => p.Household).AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p =>
                p.FullName.Contains(search) ||
                p.NationalId.Contains(search));

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        if (householdId.HasValue)
            query = query.Where(p => p.HouseholdId == householdId);

        var result = await query.Select(p => new PersonDto(
            p.Id, p.FullName, p.DateOfBirth, p.Gender, p.NationalId,
            p.NationalIdIssuedAt, p.NationalIdIssuedDate, p.Ethnicity,
            p.Religion, p.EducationLevel, p.Occupation, p.HouseholdId,
            p.Household != null ? p.Household.HouseholdNumber : null,
            p.RelationshipToHead, p.Status
        )).ToListAsync();

        return Ok(result);
    }

    // GET: api/Persons/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PersonDto>> GetById(int id)
    {
        var p = await _db.Persons.Include(p => p.Household).FirstOrDefaultAsync(p => p.Id == id);
        if (p == null) return NotFound();

        return Ok(new PersonDto(
            p.Id, p.FullName, p.DateOfBirth, p.Gender, p.NationalId,
            p.NationalIdIssuedAt, p.NationalIdIssuedDate, p.Ethnicity,
            p.Religion, p.EducationLevel, p.Occupation, p.HouseholdId,
            p.Household?.HouseholdNumber, p.RelationshipToHead, p.Status
        ));
    }

    // POST: api/Persons
    [HttpPost]
    public async Task<ActionResult<PersonDto>> Create([FromBody] CreatePersonDto dto)
    {
        var person = new Person
        {
            FullName = dto.FullName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            NationalId = dto.NationalId,
            NationalIdIssuedAt = dto.NationalIdIssuedAt,
            NationalIdIssuedDate = dto.NationalIdIssuedDate,
            Ethnicity = dto.Ethnicity,
            Religion = dto.Religion,
            EducationLevel = dto.EducationLevel,
            Occupation = dto.Occupation,
            HouseholdId = dto.HouseholdId,
            RelationshipToHead = dto.RelationshipToHead,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            Status = "Alive"
        };

        _db.Persons.Add(person);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = person.Id },
            new PersonDto(person.Id, person.FullName, person.DateOfBirth, person.Gender,
                person.NationalId, person.NationalIdIssuedAt, person.NationalIdIssuedDate,
                person.Ethnicity, person.Religion, person.EducationLevel, person.Occupation,
                person.HouseholdId, null, person.RelationshipToHead, person.Status));
    }

    // PUT: api/Persons/5
    [HttpPut("{id}")]
    public async Task<ActionResult<PersonDto>> Update(int id, [FromBody] UpdatePersonDto dto)
    {
        var p = await _db.Persons.FindAsync(id);
        if (p == null) return NotFound();

        if (dto.FullName != null) p.FullName = dto.FullName;
        if (dto.DateOfBirth.HasValue) p.DateOfBirth = dto.DateOfBirth.Value;
        if (dto.Gender != null) p.Gender = dto.Gender;
        if (dto.NationalId != null) p.NationalId = dto.NationalId;
        if (dto.NationalIdIssuedAt != null) p.NationalIdIssuedAt = dto.NationalIdIssuedAt;
        if (dto.NationalIdIssuedDate.HasValue) p.NationalIdIssuedDate = dto.NationalIdIssuedDate.Value;
        if (dto.Ethnicity != null) p.Ethnicity = dto.Ethnicity;
        if (dto.Religion != null) p.Religion = dto.Religion;
        if (dto.EducationLevel != null) p.EducationLevel = dto.EducationLevel;
        if (dto.Occupation != null) p.Occupation = dto.Occupation;
        if (dto.HouseholdId.HasValue) p.HouseholdId = dto.HouseholdId;
        if (dto.RelationshipToHead != null) p.RelationshipToHead = dto.RelationshipToHead;
        if (dto.Status != null) p.Status = dto.Status;
        p.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();

        var household = await _db.Households.FindAsync(p.HouseholdId);

        return Ok(new PersonDto(p.Id, p.FullName, p.DateOfBirth, p.Gender, p.NationalId,
            p.NationalIdIssuedAt, p.NationalIdIssuedDate, p.Ethnicity, p.Religion,
            p.EducationLevel, p.Occupation, p.HouseholdId,
            household?.HouseholdNumber, p.RelationshipToHead, p.Status));
    }

    // DELETE: api/Persons/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var p = await _db.Persons.FindAsync(id);
        if (p == null) return NotFound();

        p.HouseholdId = null;
        p.Status = "Deleted";
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ======== BIRTH RECORD ========
    // POST: api/Persons/birth
    [HttpPost("birth")]
    public async Task<ActionResult<BirthRecordDto>> RegisterBirth([FromBody] CreateBirthRecordDto dto)
    {
        var record = new BirthRecord
        {
            FullName = dto.FullName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            BirthPlace = dto.BirthPlace,
            FatherId = dto.FatherId,
            MotherId = dto.MotherId,
            CreatedAt = DateTime.Now,
            RegisteredBy = "Admin"
        };

        _db.BirthRecords.Add(record);

        // Tạo nhân khẩu cho trẻ
        var person = new Person
        {
            FullName = dto.FullName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            NationalId = "",
            Ethnicity = "Kinh",
            Religion = "Không",
            EducationLevel = "",
            Occupation = "",
            HouseholdId = dto.MotherId.HasValue
                ? (await _db.Persons.FindAsync(dto.MotherId.Value))?.HouseholdId
                : null,
            RelationshipToHead = "Con",
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            BirthRecordId = record.Id,
            Status = "Alive"
        };

        _db.Persons.Add(person);
        await _db.SaveChangesAsync();

        return Created("", new BirthRecordDto(
            record.Id, record.FullName, record.DateOfBirth, record.Gender,
            record.BirthPlace, record.FatherId, record.MotherId, record.CreatedAt, record.RegisteredBy));
    }

    // GET: api/Persons/birth
    [HttpGet("birth")]
    public async Task<ActionResult<IEnumerable<BirthRecordDto>>> GetBirthRecords()
    {
        var records = await _db.BirthRecords.ToListAsync();
        return Ok(records.Select(r => new BirthRecordDto(
            r.Id, r.FullName, r.DateOfBirth, r.Gender,
            r.BirthPlace, r.FatherId, r.MotherId, r.CreatedAt, r.RegisteredBy)));
    }

    // ======== DEATH RECORD ========
    // POST: api/Persons/death
    [HttpPost("death")]
    public async Task<ActionResult<DeathRecordDto>> RegisterDeath([FromBody] CreateDeathRecordDto dto)
    {
        var record = new DeathRecord
        {
            FullName = dto.FullName,
            DateOfDeath = dto.DateOfDeath,
            Reason = dto.Reason,
            PlaceOfDeath = dto.PlaceOfDeath,
            PersonId = dto.PersonId,
            CreatedAt = DateTime.Now,
            RegisteredBy = "Admin"
        };

        _db.DeathRecords.Add(record);

        var person = await _db.Persons.FindAsync(dto.PersonId);
        if (person != null)
        {
            person.Status = "Dead";
            person.DeathRecordId = record.Id;
            person.UpdatedAt = DateTime.Now;
        }

        await _db.SaveChangesAsync();

        return Created("", new DeathRecordDto(
            record.Id, record.FullName, record.DateOfDeath, record.Reason,
            record.PlaceOfDeath, record.PersonId, record.CreatedAt, record.RegisteredBy));
    }

    // GET: api/Persons/death
    [HttpGet("death")]
    public async Task<ActionResult<IEnumerable<DeathRecordDto>>> GetDeathRecords()
    {
        var records = await _db.DeathRecords.ToListAsync();
        return Ok(records.Select(r => new DeathRecordDto(
            r.Id, r.FullName, r.DateOfDeath, r.Reason,
            r.PlaceOfDeath, r.PersonId, r.CreatedAt, r.RegisteredBy)));
    }
}
