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
public class LibraryDocumentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;
    private readonly IWebHostEnvironment _environment;

    public LibraryDocumentsController(AppDbContext db, ISystemLogService logs, IWebHostEnvironment environment)
    {
        _db = db;
        _logs = logs;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LibraryDocumentDto>>> GetAll([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = _db.LibraryDocuments.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item =>
                item.Title.Contains(search) ||
                item.Description.Contains(search) ||
                item.FileName.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(item => item.Category == category);
        }

        var items = await query
            .OrderByDescending(item => item.UploadedAt)
            .Select(item => new LibraryDocumentDto(
                item.Id,
                item.Title,
                item.Description,
                item.Category,
                item.FileName,
                item.ContentType,
                item.FileSize,
                item.UploadedAt,
                item.UploadedBy,
                $"/api/librarydocuments/{item.Id}/download"))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [RequestFormLimits(MultipartBodyLengthLimit = 10_000_000)]
    public async Task<ActionResult<LibraryDocumentDto>> Create([FromForm] string title, [FromForm] string description, [FromForm] string category, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Vui long chon tep tai lieu.");
        }

        var currentUser = HttpContext.GetCurrentUser()!;
        var originalFileName = Path.GetFileName(file.FileName);
        var storedFileName = $"{Guid.NewGuid():N}{Path.GetExtension(originalFileName)}";
        var relativeDirectory = Path.Combine("Storage", "library-documents");
        var physicalDirectory = Path.Combine(_environment.ContentRootPath, relativeDirectory);
        Directory.CreateDirectory(physicalDirectory);
        var physicalPath = Path.Combine(physicalDirectory, storedFileName);

        await using (var output = System.IO.File.Create(physicalPath))
        {
            await file.CopyToAsync(output);
        }

        var item = new LibraryDocument
        {
            Title = title,
            Description = description,
            Category = category,
            FileName = originalFileName,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            FileSize = file.Length,
            StoredFileName = storedFileName,
            StoredPath = Path.Combine(relativeDirectory, storedFileName),
            UploadedAt = DateTime.Now,
            UploadedBy = currentUser.FullName,
        };

        _db.LibraryDocuments.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tai tai lieu kho chung", "KhoTaiLieu", $"Tai tai lieu {item.Title}", actor: currentUser);

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, Map(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<LibraryDocumentDto>> Update(int id, [FromBody] UpdateLibraryDocumentDto dto)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.LibraryDocuments.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Title = dto.Title;
        item.Description = dto.Description;
        item.Category = dto.Category;
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Cap nhat kho tai lieu", "KhoTaiLieu", $"Cap nhat tai lieu {item.Title}", actor: currentUser);
        return Ok(Map(item));
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult> Download(int id)
    {
        var item = await _db.LibraryDocuments.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(item.StoredPath))
        {
            return File(Array.Empty<byte>(), item.ContentType, item.FileName);
        }

        var fullPath = Path.Combine(_environment.ContentRootPath, item.StoredPath);
        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound("Khong tim thay tep da tai len.");
        }

        return File(System.IO.File.OpenRead(fullPath), item.ContentType, item.FileName);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var currentUser = HttpContext.GetCurrentUser()!;
        var item = await _db.LibraryDocuments.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(item.StoredPath))
        {
            var fullPath = Path.Combine(_environment.ContentRootPath, item.StoredPath);
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }

        _db.LibraryDocuments.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa tai lieu kho chung", "KhoTaiLieu", $"Xoa tai lieu {item.Title}", actor: currentUser);
        return NoContent();
    }

    private static LibraryDocumentDto Map(LibraryDocument item)
    {
        return new LibraryDocumentDto(
            item.Id,
            item.Title,
            item.Description,
            item.Category,
            item.FileName,
            item.ContentType,
            item.FileSize,
            item.UploadedAt,
            item.UploadedBy,
            $"/api/librarydocuments/{item.Id}/download");
    }
}
