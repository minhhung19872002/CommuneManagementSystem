using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : ControllerBase
{
    private readonly AppDbContext _db;

    public HouseholdsController(AppDbContext db) => _db = db;

    // GET: api/Households
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HouseholdDto>>> GetAll(
        [FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.Households
            .Include(h => h.Members)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(h =>
                h.HouseholdNumber.Contains(search) ||
                h.Address.Contains(search));

        if (!string.IsNullOrEmpty(status))
            query = query.Where(h => h.Status == status);

        var headNames = await _db.Persons.ToDictionaryAsync(p => p.Id, p => p.FullName);

        var result = await query.Select(h => new HouseholdDto(
            h.Id, h.HouseholdNumber, h.Address, h.HeadPersonId,
            h.HeadPersonId.HasValue && headNames.ContainsKey(h.HeadPersonId.Value)
                ? headNames[h.HeadPersonId.Value] : null,
            h.CreatedAt, h.Status, h.MovedTo, h.Members.Count
        )).ToListAsync();

        return Ok(result);
    }

    // GET: api/Households/5
    [HttpGet("{id}")]
    public async Task<ActionResult<HouseholdDto>> GetById(int id)
    {
        var h = await _db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (h == null) return NotFound();

        var headName = h.HeadPersonId.HasValue
            ? (await _db.Persons.FindAsync(h.HeadPersonId.Value))?.FullName
            : null;

        return Ok(new HouseholdDto(
            h.Id, h.HouseholdNumber, h.Address, h.HeadPersonId,
            headName, h.CreatedAt, h.Status, h.MovedTo, h.Members.Count
        ));
    }

    // GET: api/Households/5/members
    [HttpGet("{id}/members")]
    public async Task<ActionResult<IEnumerable<PersonDto>>> GetMembers(int id)
    {
        var persons = await _db.Persons
            .Where(p => p.HouseholdId == id)
            .Include(p => p.Household)
            .ToListAsync();

        var result = persons.Select(p => new PersonDto(
            p.Id, p.FullName, p.DateOfBirth, p.Gender, p.NationalId,
            p.NationalIdIssuedAt, p.NationalIdIssuedDate, p.Ethnicity,
            p.Religion, p.EducationLevel, p.Occupation, p.HouseholdId,
            p.Household?.HouseholdNumber, p.RelationshipToHead, p.Status
        ));

        return Ok(result);
    }

    // POST: api/Households
    [HttpPost]
    public async Task<ActionResult<HouseholdDto>> Create([FromBody] CreateHouseholdDto dto)
    {
        var household = new Household
        {
            HouseholdNumber = dto.HouseholdNumber,
            Address = dto.Address,
            HeadPersonId = dto.HeadPersonId,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        _db.Households.Add(household);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = household.Id },
            new HouseholdDto(household.Id, household.HouseholdNumber, household.Address,
                household.HeadPersonId, null, household.CreatedAt, "Active", null, 0));
    }

    // PUT: api/Households/5
    [HttpPut("{id}")]
    public async Task<ActionResult<HouseholdDto>> Update(int id, [FromBody] UpdateHouseholdDto dto)
    {
        var h = await _db.Households.FindAsync(id);
        if (h == null) return NotFound();

        if (dto.Address != null) h.Address = dto.Address;
        if (dto.HeadPersonId.HasValue) h.HeadPersonId = dto.HeadPersonId;
        if (dto.Status != null) h.Status = dto.Status;
        if (dto.MovedTo != null) h.MovedTo = dto.MovedTo;
        h.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();

        var headName = h.HeadPersonId.HasValue
            ? (await _db.Persons.FindAsync(h.HeadPersonId.Value))?.FullName
            : null;

        return Ok(new HouseholdDto(
            h.Id, h.HouseholdNumber, h.Address, h.HeadPersonId,
            headName, h.CreatedAt, h.Status, h.MovedTo,
            await _db.Persons.CountAsync(p => p.HouseholdId == h.Id)
        ));
    }

    // DELETE: api/Households/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var h = await _db.Households.FindAsync(id);
        if (h == null) return NotFound();

        // Xóa tham chiếu nhân khẩu
        var members = await _db.Persons.Where(p => p.HouseholdId == id).ToListAsync();
        foreach (var m in members) m.HouseholdId = null;

        _db.Households.Remove(h);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/Households/split
    [HttpPost("split")]
    public async Task<ActionResult> SplitHousehold([FromBody] SplitHouseholdDto dto)
    {
        var original = await _db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == dto.OriginalId);

        if (original == null) return NotFound();

        // Tạo hộ khẩu mới cho hộ 2
        var newHousehold = new Household
        {
            HouseholdNumber = original.HouseholdNumber + "-T",
            Address = dto.Address2,
            HeadPersonId = dto.HeadPersonId2,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };
        _db.Households.Add(newHousehold);

        // Cập nhật chủ hộ mới
        var newHead = await _db.Persons.FindAsync(dto.HeadPersonId2);
        if (newHead != null)
        {
            newHead.HouseholdId = newHousehold.Id;
            newHead.RelationshipToHead = "Chủ hộ";
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Tách hộ khẩu thành công", newHouseholdId = newHousehold.Id });
    }

    // POST: api/Households/add-member
    [HttpPost("add-member")]
    public async Task<ActionResult> AddMember([FromBody] AddMemberToHouseholdDto dto)
    {
        var person = await _db.Persons.FindAsync(dto.PersonId);
        if (person == null) return NotFound("Không tìm thấy nhân khẩu");

        person.HouseholdId = dto.HouseholdId;
        person.RelationshipToHead = dto.RelationshipToHead;
        person.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Thêm thành viên vào hộ khẩu thành công" });
    }

    // POST: api/Households/move
    [HttpPost("move")]
    public async Task<ActionResult> MoveHousehold([FromBody] MoveHouseholdDto dto)
    {
        var h = await _db.Households.FindAsync(dto.HouseholdId);
        if (h == null) return NotFound();

        h.Status = "Moved";
        h.MovedTo = dto.MovedTo;
        h.UpdatedAt = dto.MoveDate;

        // Cập nhật tất cả thành viên
        var members = await _db.Persons.Where(p => p.HouseholdId == dto.HouseholdId).ToListAsync();
        foreach (var m in members) m.Status = "Moved";

        await _db.SaveChangesAsync();
        return Ok(new { message = $"Chuyển hộ khẩu đến {dto.MovedTo} thành công" });
    }
}
