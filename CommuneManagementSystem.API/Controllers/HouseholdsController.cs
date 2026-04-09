using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Filters;
using CommuneManagementSystem.API.Models;
using CommuneManagementSystem.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[RequireRoles("Admin", "HoKhau")]
public class HouseholdsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public HouseholdsController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HouseholdDto>>> GetAll([FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.Households
            .Include(household => household.Members)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(household =>
                household.HouseholdNumber.Contains(search) ||
                household.Address.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(household => household.Status == status);
        }

        var headNames = await _db.Persons.ToDictionaryAsync(person => person.Id, person => person.FullName);

        var result = await query
            .Select(household => new HouseholdDto(
                household.Id,
                household.HouseholdNumber,
                household.Address,
                household.HeadPersonId,
                household.HeadPersonId.HasValue && headNames.ContainsKey(household.HeadPersonId.Value)
                    ? headNames[household.HeadPersonId.Value]
                    : null,
                household.CreatedAt,
                household.Status,
                household.MovedTo,
                household.Members.Count))
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HouseholdDto>> GetById(int id)
    {
        var household = await _db.Households
            .Include(item => item.Members)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (household == null)
        {
            return NotFound();
        }

        var headName = household.HeadPersonId.HasValue
            ? (await _db.Persons.FindAsync(household.HeadPersonId.Value))?.FullName
            : null;

        return Ok(new HouseholdDto(
            household.Id,
            household.HouseholdNumber,
            household.Address,
            household.HeadPersonId,
            headName,
            household.CreatedAt,
            household.Status,
            household.MovedTo,
            household.Members.Count));
    }

    [HttpGet("{id}/members")]
    public async Task<ActionResult<IEnumerable<PersonDto>>> GetMembers(int id)
    {
        var persons = await _db.Persons
            .Where(person => person.HouseholdId == id)
            .Include(person => person.Household)
            .ToListAsync();

        var result = persons.Select(person => new PersonDto(
            person.Id,
            person.FullName,
            person.DateOfBirth,
            person.Gender,
            person.NationalId,
            person.NationalIdIssuedAt,
            person.NationalIdIssuedDate,
            person.Ethnicity,
            person.Religion,
            person.EducationLevel,
            person.Occupation,
            person.HouseholdId,
            person.Household?.HouseholdNumber,
            person.RelationshipToHead,
            person.Status));

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<HouseholdDto>> Create([FromBody] CreateHouseholdDto dto)
    {
        var headPerson = await _db.Persons.FindAsync(dto.HeadPersonId);
        if (headPerson == null)
        {
            return BadRequest("Không tìm thấy chủ hộ được chọn.");
        }

        var household = new Household
        {
            HouseholdNumber = dto.HouseholdNumber,
            Address = dto.Address,
            HeadPersonId = dto.HeadPersonId,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };

        _db.Households.Add(household);
        await _db.SaveChangesAsync();

        headPerson.HouseholdId = household.Id;
        headPerson.RelationshipToHead = "Chủ hộ";
        headPerson.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Tạo hộ khẩu",
            "HoKhau",
            $"Tạo hộ khẩu {household.HouseholdNumber}",
            newValue: new { household.Id, household.HouseholdNumber, household.Address, household.HeadPersonId });

        return CreatedAtAction(
            nameof(GetById),
            new { id = household.Id },
            new HouseholdDto(
                household.Id,
                household.HouseholdNumber,
                household.Address,
                household.HeadPersonId,
                headPerson.FullName,
                household.CreatedAt,
                household.Status,
                household.MovedTo,
                1));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<HouseholdDto>> Update(int id, [FromBody] UpdateHouseholdDto dto)
    {
        var household = await _db.Households.FindAsync(id);
        if (household == null)
        {
            return NotFound();
        }

        var snapshot = new
        {
            household.Id,
            household.HouseholdNumber,
            household.Address,
            household.HeadPersonId,
            household.Status,
            household.MovedTo,
        };

        if (!string.IsNullOrWhiteSpace(dto.Address))
        {
            household.Address = dto.Address;
        }

        if (dto.HeadPersonId.HasValue)
        {
            var headPerson = await _db.Persons.FindAsync(dto.HeadPersonId.Value);
            if (headPerson == null)
            {
                return BadRequest("Không tìm thấy chủ hộ được chọn.");
            }

            household.HeadPersonId = dto.HeadPersonId.Value;
            headPerson.HouseholdId = household.Id;
            headPerson.RelationshipToHead = "Chủ hộ";
            headPerson.UpdatedAt = DateTime.Now;
        }

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            household.Status = dto.Status;
        }

        if (dto.MovedTo != null)
        {
            household.MovedTo = dto.MovedTo;
        }

        household.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();

        var headName = household.HeadPersonId.HasValue
            ? (await _db.Persons.FindAsync(household.HeadPersonId.Value))?.FullName
            : null;

        await _logs.LogAsync(
            HttpContext,
            "Cập nhật hộ khẩu",
            "HoKhau",
            $"Cập nhật hộ khẩu {household.HouseholdNumber}",
            oldValue: snapshot,
            newValue: new { household.Address, household.HeadPersonId, household.Status, household.MovedTo });

        return Ok(new HouseholdDto(
            household.Id,
            household.HouseholdNumber,
            household.Address,
            household.HeadPersonId,
            headName,
            household.CreatedAt,
            household.Status,
            household.MovedTo,
            await _db.Persons.CountAsync(person => person.HouseholdId == household.Id)));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var household = await _db.Households.FindAsync(id);
        if (household == null)
        {
            return NotFound();
        }

        var snapshot = new { household.Id, household.HouseholdNumber, household.Address };
        var members = await _db.Persons.Where(person => person.HouseholdId == id).ToListAsync();
        foreach (var member in members)
        {
            member.HouseholdId = null;
            member.UpdatedAt = DateTime.Now;
        }

        _db.Households.Remove(household);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Xóa hộ khẩu", "HoKhau", $"Xóa hộ khẩu {household.HouseholdNumber}", oldValue: snapshot);
        return NoContent();
    }

    [HttpPost("split")]
    public async Task<ActionResult> SplitHousehold([FromBody] SplitHouseholdDto dto)
    {
        var original = await _db.Households
            .Include(household => household.Members)
            .FirstOrDefaultAsync(household => household.Id == dto.OriginalId);

        if (original == null)
        {
            return NotFound();
        }

        if (dto.MemberIds is null || dto.MemberIds.Count == 0)
        {
            return BadRequest("Cần chọn ít nhất một thành viên để tách hộ.");
        }

        if (await _db.Households.AnyAsync(household => household.HouseholdNumber == dto.NewHouseholdNumber))
        {
            return BadRequest("Số hộ khẩu mới đã tồn tại.");
        }

        if (original.HeadPersonId.HasValue && dto.MemberIds.Contains(original.HeadPersonId.Value))
        {
            return BadRequest("Không thể chuyển chủ hộ hiện tại sang hộ mới trong lần tách này.");
        }

        var membersToMove = original.Members
            .Where(member => dto.MemberIds.Contains(member.Id))
            .ToList();

        if (membersToMove.Count != dto.MemberIds.Count || membersToMove.All(member => member.Id != dto.NewHeadPersonId))
        {
            return BadRequest("Danh sách thành viên tách hộ không hợp lệ.");
        }

        var newHousehold = new Household
        {
            HouseholdNumber = dto.NewHouseholdNumber,
            Address = dto.NewAddress,
            HeadPersonId = dto.NewHeadPersonId,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };

        _db.Households.Add(newHousehold);
        await _db.SaveChangesAsync();

        foreach (var member in membersToMove)
        {
            member.HouseholdId = newHousehold.Id;
            member.RelationshipToHead = member.Id == dto.NewHeadPersonId ? "Chủ hộ" : member.RelationshipToHead;
            member.UpdatedAt = DateTime.Now;
        }

        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Tách hộ khẩu",
            "HoKhau",
            $"Tách hộ {original.HouseholdNumber} thành {newHousehold.HouseholdNumber}",
            newValue: new { OriginalHouseholdId = original.Id, NewHouseholdId = newHousehold.Id, dto.MemberIds });

        return Ok(new { message = "Tách hộ khẩu thành công", newHouseholdId = newHousehold.Id });
    }

    [HttpPost("add-member")]
    public async Task<ActionResult> AddMember([FromBody] AddMemberToHouseholdDto dto)
    {
        var person = await _db.Persons.FindAsync(dto.PersonId);
        if (person == null)
        {
            return NotFound("Không tìm thấy nhân khẩu.");
        }

        var household = await _db.Households.FindAsync(dto.HouseholdId);
        if (household == null)
        {
            return NotFound("Không tìm thấy hộ khẩu.");
        }

        person.HouseholdId = dto.HouseholdId;
        person.RelationshipToHead = dto.RelationshipToHead;
        person.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Nhập khẩu vào hộ",
            "HoKhau",
            $"Thêm {person.FullName} vào hộ {household.HouseholdNumber}",
            newValue: new { dto.HouseholdId, dto.PersonId, dto.RelationshipToHead });

        return Ok(new { message = "Thêm thành viên vào hộ khẩu thành công" });
    }

    [HttpPost("move")]
    public async Task<ActionResult> MoveHousehold([FromBody] MoveHouseholdDto dto)
    {
        var household = await _db.Households.FindAsync(dto.HouseholdId);
        if (household == null)
        {
            return NotFound();
        }

        household.Status = "Moved";
        household.MovedTo = dto.MovedTo;
        household.UpdatedAt = dto.MoveDate;

        var members = await _db.Persons.Where(person => person.HouseholdId == dto.HouseholdId).ToListAsync();
        foreach (var member in members)
        {
            member.Status = "Moved";
            member.UpdatedAt = DateTime.Now;
        }

        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Chuyển hộ khẩu",
            "HoKhau",
            $"Chuyển hộ {household.HouseholdNumber} đến {dto.MovedTo}",
            newValue: new { dto.HouseholdId, dto.MovedTo, dto.MoveDate });

        return Ok(new { message = $"Chuyển hộ khẩu đến {dto.MovedTo} thành công" });
    }
}
