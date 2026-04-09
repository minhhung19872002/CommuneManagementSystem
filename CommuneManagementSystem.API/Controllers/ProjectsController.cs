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
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public ProjectsController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectItemDto>>> GetProjects([FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.ProjectItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item => item.Name.Contains(search) || item.Description.Contains(search) || item.Sponsor.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var items = await query
            .OrderByDescending(item => item.StartDate)
            .Select(item => new ProjectItemDto(
                item.Id,
                item.Name,
                item.Description,
                item.Sponsor,
                item.Budget,
                item.StartDate,
                item.EndDate,
                item.Progress,
                item.Status,
                item.ManagerUserId,
                item.ManagerUserName,
                item.CreatedByName,
                item.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectItemDto>> CreateProject([FromBody] SaveProjectItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = new ProjectItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Sponsor = dto.Sponsor,
            Budget = dto.Budget,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Progress = Math.Clamp(dto.Progress, 0, 100),
            Status = dto.Status,
            ManagerUserId = dto.ManagerUserId,
            ManagerUserName = await ResolveUserNameAsync(dto.ManagerUserId),
            CreatedByName = actor.FullName,
            CreatedAt = DateTime.Now,
        };

        _db.ProjectItems.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao du an", "Project", $"Tao du an {item.Name}", actor: actor);
        return CreatedAtAction(nameof(GetProjects), new { id = item.Id }, Map(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectItemDto>> UpdateProject(int id, [FromBody] SaveProjectItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.ProjectItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.Sponsor = dto.Sponsor;
        item.Budget = dto.Budget;
        item.StartDate = dto.StartDate;
        item.EndDate = dto.EndDate;
        item.Progress = Math.Clamp(dto.Progress, 0, 100);
        item.Status = dto.Status;
        item.ManagerUserId = dto.ManagerUserId;
        item.ManagerUserName = await ResolveUserNameAsync(dto.ManagerUserId);

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat du an", "Project", $"Cap nhat du an {item.Name}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProject(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.ProjectItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.ProjectItems.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa du an", "Project", $"Xoa du an {item.Name}", actor: actor);
        return NoContent();
    }

    [HttpGet("proposals")]
    public async Task<ActionResult<IEnumerable<ProposalItemDto>>> GetProposals(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? fieldCode,
        [FromQuery] string? priority)
    {
        var query = _db.ProposalItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item => item.Title.Contains(search) || item.Content.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(fieldCode))
        {
            query = query.Where(item => item.FieldCode == fieldCode);
        }

        if (!string.IsNullOrWhiteSpace(priority))
        {
            query = query.Where(item => item.Priority == priority);
        }

        var items = await query
            .OrderByDescending(item => item.SubmittedAt)
            .Select(item => new ProposalItemDto(
                item.Id,
                item.Title,
                item.Content,
                item.FieldCode,
                item.Priority,
                item.Status,
                item.SubmittedByName,
                item.SubmittedAt,
                item.ReviewedByName,
                item.ReviewedAt,
                item.ReviewNote))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("proposals")]
    public async Task<ActionResult<ProposalItemDto>> CreateProposal([FromBody] SaveProposalItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = new ProposalItem
        {
            Title = dto.Title,
            Content = dto.Content,
            FieldCode = dto.FieldCode,
            Priority = dto.Priority,
            Status = dto.Status,
            SubmittedByName = actor.FullName,
            SubmittedAt = DateTime.Now,
        };

        if (item.Status != "Pending")
        {
            item.ReviewedAt = DateTime.Now;
            item.ReviewedByName = actor.FullName;
            item.ReviewNote = dto.ReviewNote;
        }

        _db.ProposalItems.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao de xuat", "Project", $"Tao de xuat {item.Title}", actor: actor);
        return CreatedAtAction(nameof(GetProposals), new { id = item.Id }, Map(item));
    }

    [HttpPut("proposals/{id}")]
    public async Task<ActionResult<ProposalItemDto>> UpdateProposal(int id, [FromBody] SaveProposalItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.ProposalItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Title = dto.Title;
        item.Content = dto.Content;
        item.FieldCode = dto.FieldCode;
        item.Priority = dto.Priority;
        item.Status = dto.Status;

        if (dto.Status == "Pending")
        {
            item.ReviewedAt = null;
            item.ReviewedByName = null;
            item.ReviewNote = null;
        }
        else
        {
            item.ReviewedAt = DateTime.Now;
            item.ReviewedByName = actor.FullName;
            item.ReviewNote = dto.ReviewNote;
        }

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat de xuat", "Project", $"Cap nhat de xuat {item.Title}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("proposals/{id}")]
    public async Task<ActionResult> DeleteProposal(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.ProposalItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.ProposalItems.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa de xuat", "Project", $"Xoa de xuat {item.Title}", actor: actor);
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ProjectProposalStatsDto>> GetStats()
    {
        var totalProjects = await _db.ProjectItems.CountAsync();
        var activeProjects = await _db.ProjectItems.CountAsync(item => item.Status == "Active");
        var completedProjects = await _db.ProjectItems.CountAsync(item => item.Status == "Completed");
        var totalProposals = await _db.ProposalItems.CountAsync();
        var pendingProposals = await _db.ProposalItems.CountAsync(item => item.Status == "Pending");
        var approvedProposals = await _db.ProposalItems.CountAsync(item => item.Status == "Approved");
        var totalBudget = await _db.ProjectItems.SumAsync(item => (decimal?)item.Budget) ?? 0;
        var activeProjectBudget = await _db.ProjectItems.Where(item => item.Status == "Active").SumAsync(item => (decimal?)item.Budget) ?? 0;

        return Ok(new ProjectProposalStatsDto(
            totalProjects,
            activeProjects,
            completedProjects,
            totalProposals,
            pendingProposals,
            approvedProposals,
            totalBudget,
            activeProjectBudget));
    }

    private async Task<string?> ResolveUserNameAsync(int? userId)
    {
        if (!userId.HasValue)
        {
            return null;
        }

        return await _db.AppUsers
            .Where(user => user.Id == userId.Value)
            .Select(user => user.FullName)
            .FirstOrDefaultAsync();
    }

    private static ProjectItemDto Map(ProjectItem item)
    {
        return new ProjectItemDto(
            item.Id,
            item.Name,
            item.Description,
            item.Sponsor,
            item.Budget,
            item.StartDate,
            item.EndDate,
            item.Progress,
            item.Status,
            item.ManagerUserId,
            item.ManagerUserName,
            item.CreatedByName,
            item.CreatedAt);
    }

    private static ProposalItemDto Map(ProposalItem item)
    {
        return new ProposalItemDto(
            item.Id,
            item.Title,
            item.Content,
            item.FieldCode,
            item.Priority,
            item.Status,
            item.SubmittedByName,
            item.SubmittedAt,
            item.ReviewedByName,
            item.ReviewedAt,
            item.ReviewNote);
    }
}
