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
[RequireRoles("Admin")]
public class SystemSettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public SystemSettingsController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SystemSettingDto>>> GetAll()
    {
        var items = await _db.SystemSettings
            .OrderBy(item => item.Category)
            .ThenBy(item => item.Key)
            .Select(item => new SystemSettingDto(
                item.Id,
                item.Key,
                item.Value,
                item.Category,
                item.Description,
                item.UpdatedAt,
                item.UpdatedBy))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPut]
    public async Task<ActionResult<IEnumerable<SystemSettingDto>>> Save([FromBody] List<SaveSystemSettingDto> dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var existing = await _db.SystemSettings.ToListAsync();

        foreach (var item in dto)
        {
            var setting = existing.FirstOrDefault(candidate => candidate.Key == item.Key);
            if (setting == null)
            {
                _db.SystemSettings.Add(new SystemSetting
                {
                    Key = item.Key,
                    Value = item.Value,
                    Category = item.Category,
                    Description = item.Description,
                    UpdatedAt = DateTime.Now,
                    UpdatedBy = actor.FullName,
                });
            }
            else
            {
                setting.Value = item.Value;
                setting.Category = item.Category;
                setting.Description = item.Description;
                setting.UpdatedAt = DateTime.Now;
                setting.UpdatedBy = actor.FullName;
            }
        }

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat tham so he thong", "System", "Cap nhat bo tham so he thong", actor: actor);

        return await GetAll();
    }
}
