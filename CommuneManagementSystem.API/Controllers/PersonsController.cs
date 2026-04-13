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
public class PersonsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;
    private readonly IWebHostEnvironment _environment;

    public PersonsController(AppDbContext db, ISystemLogService logs, IWebHostEnvironment environment)
    {
        _db = db;
        _logs = logs;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? householdId)
    {
        var query = _db.Persons.Include(person => person.Household).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(person =>
                person.FullName.Contains(search) ||
                person.NationalId.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(person => person.Status == status);
        }

        if (householdId.HasValue)
        {
            query = query.Where(person => person.HouseholdId == householdId);
        }

        var result = await query
            .Select(person => new PersonDto(
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
                person.Household != null ? person.Household.HouseholdNumber : null,
                person.RelationshipToHead,
                person.Status))
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PersonDto>> GetById(int id)
    {
        var person = await _db.Persons.Include(item => item.Household).FirstOrDefaultAsync(item => item.Id == id);
        if (person == null)
        {
            return NotFound();
        }

        return Ok(new PersonDto(
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
    }

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
            Status = "Alive",
        };

        _db.Persons.Add(person);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Tạo nhân khẩu",
            "NhanKhau",
            $"Tạo nhân khẩu {person.FullName}",
            newValue: new { person.Id, person.FullName, person.HouseholdId, person.Status });

        return CreatedAtAction(
            nameof(GetById),
            new { id = person.Id },
            new PersonDto(
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
                null,
                person.RelationshipToHead,
                person.Status));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PersonDto>> Update(int id, [FromBody] UpdatePersonDto dto)
    {
        var person = await _db.Persons.FindAsync(id);
        if (person == null)
        {
            return NotFound();
        }

        var snapshot = new
        {
            person.Id,
            person.FullName,
            person.HouseholdId,
            person.RelationshipToHead,
            person.Status,
        };

        if (dto.FullName != null) person.FullName = dto.FullName;
        if (dto.DateOfBirth.HasValue) person.DateOfBirth = dto.DateOfBirth.Value;
        if (dto.Gender != null) person.Gender = dto.Gender;
        if (dto.NationalId != null) person.NationalId = dto.NationalId;
        if (dto.NationalIdIssuedAt != null) person.NationalIdIssuedAt = dto.NationalIdIssuedAt;
        if (dto.NationalIdIssuedDate.HasValue) person.NationalIdIssuedDate = dto.NationalIdIssuedDate.Value;
        if (dto.Ethnicity != null) person.Ethnicity = dto.Ethnicity;
        if (dto.Religion != null) person.Religion = dto.Religion;
        if (dto.EducationLevel != null) person.EducationLevel = dto.EducationLevel;
        if (dto.Occupation != null) person.Occupation = dto.Occupation;
        if (dto.HouseholdId.HasValue) person.HouseholdId = dto.HouseholdId;
        if (dto.RelationshipToHead != null) person.RelationshipToHead = dto.RelationshipToHead;
        if (dto.Status != null) person.Status = dto.Status;

        person.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();

        var household = await _db.Households.FindAsync(person.HouseholdId);

        await _logs.LogAsync(
            HttpContext,
            "Cập nhật nhân khẩu",
            "NhanKhau",
            $"Cập nhật nhân khẩu {person.FullName}",
            oldValue: snapshot,
            newValue: new { person.Id, person.FullName, person.HouseholdId, person.RelationshipToHead, person.Status });

        return Ok(new PersonDto(
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
            household?.HouseholdNumber,
            person.RelationshipToHead,
            person.Status));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var person = await _db.Persons.FindAsync(id);
        if (person == null)
        {
            return NotFound();
        }

        var snapshot = new { person.Id, person.FullName, person.NationalId, person.HouseholdId };
        person.HouseholdId = null;
        person.Status = "Deleted";
        person.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Xóa nhân khẩu", "NhanKhau", $"Xóa nhân khẩu {person.FullName}", oldValue: snapshot);
        return NoContent();
    }

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
            RegisteredBy = "Admin",
        };

        _db.BirthRecords.Add(record);
        await _db.SaveChangesAsync();

        var mother = dto.MotherId.HasValue ? await _db.Persons.FindAsync(dto.MotherId.Value) : null;
        var father = dto.FatherId.HasValue ? await _db.Persons.FindAsync(dto.FatherId.Value) : null;

        var person = new Person
        {
            FullName = dto.FullName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            NationalId = string.Empty,
            Ethnicity = "Kinh",
            Religion = "Không",
            EducationLevel = string.Empty,
            Occupation = string.Empty,
            HouseholdId = mother?.HouseholdId ?? father?.HouseholdId,
            RelationshipToHead = "Con",
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            BirthRecordId = record.Id,
            Status = "Alive",
        };

        _db.Persons.Add(person);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Đăng ký khai sinh",
            "NhanKhau",
            $"Đăng ký khai sinh cho {record.FullName}",
            newValue: new { BirthRecordId = record.Id, PersonId = person.Id, person.HouseholdId });

        return Created(string.Empty, new BirthRecordDto(
            record.Id,
            record.FullName,
            record.DateOfBirth,
            record.Gender,
            record.BirthPlace,
            record.FatherId,
            record.MotherId,
            record.CreatedAt,
            record.RegisteredBy));
    }

    [HttpGet("birth")]
    public async Task<ActionResult<IEnumerable<BirthRecordDto>>> GetBirthRecords()
    {
        var records = await _db.BirthRecords.ToListAsync();
        return Ok(records.Select(record => new BirthRecordDto(
            record.Id,
            record.FullName,
            record.DateOfBirth,
            record.Gender,
            record.BirthPlace,
            record.FatherId,
            record.MotherId,
            record.CreatedAt,
            record.RegisteredBy)));
    }

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
            RegisteredBy = "Admin",
        };

        _db.DeathRecords.Add(record);
        await _db.SaveChangesAsync();

        var person = await _db.Persons.FindAsync(dto.PersonId);
        if (person != null)
        {
            person.Status = "Dead";
            person.HouseholdId = null;
            person.DeathRecordId = record.Id;
            person.UpdatedAt = DateTime.Now;
        }

        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Đăng ký khai tử",
            "NhanKhau",
            $"Đăng ký khai tử cho {record.FullName}",
            newValue: new { DeathRecordId = record.Id, record.PersonId, record.DateOfDeath });

        return Created(string.Empty, new DeathRecordDto(
            record.Id,
            record.FullName,
            record.DateOfDeath,
            record.Reason,
            record.PlaceOfDeath,
            record.PersonId,
            record.CreatedAt,
            record.RegisteredBy));
    }

    [HttpGet("death")]
    public async Task<ActionResult<IEnumerable<DeathRecordDto>>> GetDeathRecords()
    {
        var records = await _db.DeathRecords.ToListAsync();
        return Ok(records.Select(record => new DeathRecordDto(
            record.Id,
            record.FullName,
            record.DateOfDeath,
            record.Reason,
            record.PlaceOfDeath,
            record.PersonId,
            record.CreatedAt,
            record.RegisteredBy)));
    }

    [HttpGet("{id}/documents")]
    public async Task<ActionResult<IEnumerable<PersonDocumentDto>>> GetDocuments(int id)
    {
        var personExists = await _db.Persons.AnyAsync(person => person.Id == id);
        if (!personExists)
        {
            return NotFound();
        }

        var documents = await _db.PersonDocuments
            .Where(document => document.PersonId == id)
            .OrderByDescending(document => document.UploadedAt)
            .Select(document => new PersonDocumentDto(
                document.Id,
                document.PersonId,
                document.FileName,
                document.ContentType,
                document.FileSize,
                document.UploadedAt,
                document.UploadedBy,
                $"/api/persons/documents/{document.Id}/download"))
            .ToListAsync();

        return Ok(documents);
    }

    [HttpPost("{id}/documents")]
    [RequestFormLimits(MultipartBodyLengthLimit = 10_000_000)]
    public async Task<ActionResult<PersonDocumentDto>> UploadDocument(int id, IFormFile file)
    {
        var person = await _db.Persons.FindAsync(id);
        if (person == null)
        {
            return NotFound();
        }

        if (file is null || file.Length == 0)
        {
            return BadRequest("Vui lòng chọn tệp cần tải lên.");
        }

        var originalFileName = Path.GetFileName(file.FileName);
        var storedFileName = $"{Guid.NewGuid():N}{Path.GetExtension(originalFileName)}";
        var relativeDirectory = Path.Combine("Storage", "person-documents", person.Id.ToString());
        var physicalDirectory = AppDataPaths.ResolveStoragePath(_environment, relativeDirectory);
        Directory.CreateDirectory(physicalDirectory);

        var physicalPath = Path.Combine(physicalDirectory, storedFileName);
        await using (var output = System.IO.File.Create(physicalPath))
        {
            await file.CopyToAsync(output);
        }

        var actor = HttpContext.GetCurrentUser();
        var document = new PersonDocument
        {
            PersonId = person.Id,
            FileName = originalFileName,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            FileSize = file.Length,
            StoredFileName = storedFileName,
            StoredPath = Path.Combine(relativeDirectory, storedFileName),
            UploadedAt = DateTime.Now,
            UploadedBy = actor?.FullName ?? actor?.Username ?? "System",
        };

        _db.PersonDocuments.Add(document);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Tải lên tài liệu",
            "NhanKhau",
            $"Tải tài liệu {originalFileName} cho {person.FullName}",
            newValue: new { document.Id, document.PersonId, document.FileName, document.FileSize });

        return Created($"/api/persons/documents/{document.Id}", new PersonDocumentDto(
            document.Id,
            document.PersonId,
            document.FileName,
            document.ContentType,
            document.FileSize,
            document.UploadedAt,
            document.UploadedBy,
            $"/api/persons/documents/{document.Id}/download"));
    }

    [HttpGet("documents/{documentId}/download")]
    public async Task<ActionResult> DownloadDocument(int documentId)
    {
        var document = await _db.PersonDocuments.FindAsync(documentId);
        if (document == null)
        {
            return NotFound();
        }

        var physicalPath = AppDataPaths.ResolveStoragePath(_environment, document.StoredPath);
        if (!System.IO.File.Exists(physicalPath))
        {
            return NotFound("Không tìm thấy tệp đã tải lên.");
        }

        var stream = System.IO.File.OpenRead(physicalPath);
        return File(stream, document.ContentType, document.FileName);
    }

    [HttpDelete("documents/{documentId}")]
    public async Task<ActionResult> DeleteDocument(int documentId)
    {
        var document = await _db.PersonDocuments.FindAsync(documentId);
        if (document == null)
        {
            return NotFound();
        }

        var physicalPath = AppDataPaths.ResolveStoragePath(_environment, document.StoredPath);
        if (System.IO.File.Exists(physicalPath))
        {
            System.IO.File.Delete(physicalPath);
        }

        _db.PersonDocuments.Remove(document);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(
            HttpContext,
            "Xóa tài liệu",
            "NhanKhau",
            $"Xóa tài liệu {document.FileName}",
            oldValue: new { document.Id, document.PersonId, document.FileName });

        return NoContent();
    }
}
