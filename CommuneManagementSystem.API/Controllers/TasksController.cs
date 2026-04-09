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
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public TasksController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItemDto>>> GetTasks(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] int? assignedUserId)
    {
        var query = _db.TaskItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item => item.Title.Contains(search) || item.Description.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(priority))
        {
            query = query.Where(item => item.Priority == priority);
        }

        if (assignedUserId.HasValue)
        {
            query = query.Where(item => item.AssignedUserId == assignedUserId.Value);
        }

        var items = await query
            .OrderBy(item => item.DueDate)
            .Select(item => new TaskItemDto(
                item.Id,
                item.Title,
                item.Description,
                item.Priority,
                item.Status,
                item.StartDate,
                item.DueDate,
                item.Progress,
                item.AssignedUserId,
                item.AssignedUserName,
                item.CreatedByName,
                item.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> CreateTask([FromBody] SaveTaskItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = dto.Status,
            StartDate = dto.StartDate,
            DueDate = dto.DueDate,
            Progress = Math.Clamp(dto.Progress, 0, 100),
            AssignedUserId = dto.AssignedUserId,
            AssignedUserName = await ResolveUserNameAsync(dto.AssignedUserId),
            CreatedByName = actor.FullName,
            CreatedAt = DateTime.Now,
        };

        _db.TaskItems.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao nhiem vu", "Task", $"Tao nhiem vu {item.Title}", actor: actor);
        return CreatedAtAction(nameof(GetTasks), new { id = item.Id }, Map(item));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskItemDto>> UpdateTask(int id, [FromBody] SaveTaskItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.TaskItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Title = dto.Title;
        item.Description = dto.Description;
        item.Priority = dto.Priority;
        item.Status = dto.Status;
        item.StartDate = dto.StartDate;
        item.DueDate = dto.DueDate;
        item.Progress = Math.Clamp(dto.Progress, 0, 100);
        item.AssignedUserId = dto.AssignedUserId;
        item.AssignedUserName = await ResolveUserNameAsync(dto.AssignedUserId);

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat nhiem vu", "Task", $"Cap nhat nhiem vu {item.Title}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.TaskItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.TaskItems.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa nhiem vu", "Task", $"Xoa nhiem vu {item.Title}", actor: actor);
        return NoContent();
    }

    [HttpGet("works")]
    public async Task<ActionResult<IEnumerable<WorkItemDto>>> GetWorks(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] string? fieldCode,
        [FromQuery] string? unitCode,
        [FromQuery] int? assignedUserId)
    {
        var query = _db.WorkItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item => item.Title.Contains(search) || item.Description.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(priority))
        {
            query = query.Where(item => item.Priority == priority);
        }

        if (!string.IsNullOrWhiteSpace(fieldCode))
        {
            query = query.Where(item => item.FieldCode == fieldCode);
        }

        if (!string.IsNullOrWhiteSpace(unitCode))
        {
            query = query.Where(item => item.UnitCode == unitCode);
        }

        if (assignedUserId.HasValue)
        {
            query = query.Where(item => item.AssignedUserId == assignedUserId.Value);
        }

        var items = await query
            .OrderBy(item => item.DueDate)
            .Select(item => new WorkItemDto(
                item.Id,
                item.Title,
                item.Description,
                item.FieldCode,
                item.UnitCode,
                item.Priority,
                item.Status,
                item.StartDate,
                item.DueDate,
                item.Progress,
                item.AssignedUserId,
                item.AssignedUserName,
                item.CreatedByName,
                item.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("works")]
    public async Task<ActionResult<WorkItemDto>> CreateWork([FromBody] SaveWorkItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = new WorkItem
        {
            Title = dto.Title,
            Description = dto.Description,
            FieldCode = dto.FieldCode,
            UnitCode = dto.UnitCode,
            Priority = dto.Priority,
            Status = dto.Status,
            StartDate = dto.StartDate,
            DueDate = dto.DueDate,
            Progress = Math.Clamp(dto.Progress, 0, 100),
            AssignedUserId = dto.AssignedUserId,
            AssignedUserName = await ResolveUserNameAsync(dto.AssignedUserId),
            CreatedByName = actor.FullName,
            CreatedAt = DateTime.Now,
        };

        _db.WorkItems.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao cong viec", "Task", $"Tao cong viec {item.Title}", actor: actor);
        return CreatedAtAction(nameof(GetWorks), new { id = item.Id }, Map(item));
    }

    [HttpPut("works/{id}")]
    public async Task<ActionResult<WorkItemDto>> UpdateWork(int id, [FromBody] SaveWorkItemDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.WorkItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Title = dto.Title;
        item.Description = dto.Description;
        item.FieldCode = dto.FieldCode;
        item.UnitCode = dto.UnitCode;
        item.Priority = dto.Priority;
        item.Status = dto.Status;
        item.StartDate = dto.StartDate;
        item.DueDate = dto.DueDate;
        item.Progress = Math.Clamp(dto.Progress, 0, 100);
        item.AssignedUserId = dto.AssignedUserId;
        item.AssignedUserName = await ResolveUserNameAsync(dto.AssignedUserId);

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat cong viec", "Task", $"Cap nhat cong viec {item.Title}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("works/{id}")]
    public async Task<ActionResult> DeleteWork(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.WorkItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.WorkItems.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa cong viec", "Task", $"Xoa cong viec {item.Title}", actor: actor);
        return NoContent();
    }

    [HttpGet("kpi-stats")]
    public async Task<ActionResult<TaskKpiStatsDto>> GetKpiStats()
    {
        var now = DateTime.Now;
        var totalTasks = await _db.TaskItems.CountAsync();
        var completedTasks = await _db.TaskItems.CountAsync(item => item.Status == "Completed");
        var totalWorks = await _db.WorkItems.CountAsync();
        var completedWorks = await _db.WorkItems.CountAsync(item => item.Status == "Completed");
        var overdueTasks = await _db.TaskItems.CountAsync(item => item.DueDate < now && item.Status != "Completed");
        var overdueWorks = await _db.WorkItems.CountAsync(item => item.DueDate < now && item.Status != "Completed");

        var taskCompletionRate = totalTasks == 0 ? 0 : Math.Round((decimal)completedTasks * 100 / totalTasks, 2);
        var workCompletionRate = totalWorks == 0 ? 0 : Math.Round((decimal)completedWorks * 100 / totalWorks, 2);
        var overallKpiScore = Math.Round((taskCompletionRate + workCompletionRate) / 2, 2);

        return Ok(new TaskKpiStatsDto(
            totalTasks,
            completedTasks,
            totalWorks,
            completedWorks,
            overdueTasks,
            overdueWorks,
            taskCompletionRate,
            workCompletionRate,
            overallKpiScore));
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

    private static TaskItemDto Map(TaskItem item)
    {
        return new TaskItemDto(
            item.Id,
            item.Title,
            item.Description,
            item.Priority,
            item.Status,
            item.StartDate,
            item.DueDate,
            item.Progress,
            item.AssignedUserId,
            item.AssignedUserName,
            item.CreatedByName,
            item.CreatedAt);
    }

    private static WorkItemDto Map(WorkItem item)
    {
        return new WorkItemDto(
            item.Id,
            item.Title,
            item.Description,
            item.FieldCode,
            item.UnitCode,
            item.Priority,
            item.Status,
            item.StartDate,
            item.DueDate,
            item.Progress,
            item.AssignedUserId,
            item.AssignedUserName,
            item.CreatedByName,
            item.CreatedAt);
    }
}
