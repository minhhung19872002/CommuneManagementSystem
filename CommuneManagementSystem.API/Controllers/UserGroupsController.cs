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
public class UserGroupsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public UserGroupsController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserGroupDto>>> GetAll()
    {
        var groups = await _db.UserGroups
            .Include(group => group.Members)
            .OrderBy(group => group.Name)
            .ToListAsync();

        return Ok(groups.Select(Map));
    }

    [HttpPost]
    public async Task<ActionResult<UserGroupDto>> Create([FromBody] SaveUserGroupDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        if (await _db.UserGroups.AnyAsync(group => group.Name == dto.Name))
        {
            return BadRequest(new { message = "Ten nhom nguoi dung da ton tai." });
        }

        var group = new UserGroup
        {
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };

        _db.UserGroups.Add(group);
        await _db.SaveChangesAsync();
        await SyncMembersAsync(group, dto.UserIds);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Tao nhom nguoi dung", "System", $"Tao nhom {group.Name}", actor: actor);
        await _db.Entry(group).Collection(item => item.Members).LoadAsync();
        return CreatedAtAction(nameof(GetAll), new { id = group.Id }, Map(group));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserGroupDto>> Update(int id, [FromBody] SaveUserGroupDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var group = await _db.UserGroups.Include(item => item.Members).FirstOrDefaultAsync(item => item.Id == id);
        if (group == null)
        {
            return NotFound();
        }

        group.Name = dto.Name;
        group.Description = dto.Description;
        group.UpdatedAt = DateTime.Now;
        await SyncMembersAsync(group, dto.UserIds);
        await _db.SaveChangesAsync();

        await _logs.LogAsync(HttpContext, "Cap nhat nhom nguoi dung", "System", $"Cap nhat nhom {group.Name}", actor: actor);
        return Ok(Map(group));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var group = await _db.UserGroups.FindAsync(id);
        if (group == null)
        {
            return NotFound();
        }

        _db.UserGroups.Remove(group);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa nhom nguoi dung", "System", $"Xoa nhom {group.Name}", actor: actor);
        return NoContent();
    }

    private async Task SyncMembersAsync(UserGroup group, List<int> userIds)
    {
        var targetIds = userIds.Distinct().ToHashSet();
        var users = await _db.AppUsers
            .Where(user => targetIds.Contains(user.Id))
            .Select(user => new { user.Id, user.Username, user.FullName })
            .ToListAsync();

        var existingMembers = group.Members.ToList();
        var removeMembers = existingMembers.Where(member => !targetIds.Contains(member.UserId)).ToList();
        if (removeMembers.Count > 0)
        {
            _db.UserGroupMembers.RemoveRange(removeMembers);
            foreach (var member in removeMembers)
            {
                group.Members.Remove(member);
            }
        }

        var existingUserIds = existingMembers.Select(member => member.UserId).ToHashSet();
        var addMembers = users.Where(user => !existingUserIds.Contains(user.Id)).ToList();
        foreach (var user in addMembers)
        {
            group.Members.Add(new UserGroupMember
            {
                UserGroupId = group.Id,
                UserId = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                AddedAt = DateTime.Now,
            });
        }
    }

    private static UserGroupDto Map(UserGroup group)
    {
        var orderedMembers = group.Members.OrderBy(member => member.FullName).ToList();
        return new UserGroupDto(
            group.Id,
            group.Name,
            group.Description,
            group.CreatedAt,
            group.UpdatedAt,
            orderedMembers.Count,
            orderedMembers.Select(member => member.UserId).ToList(),
            orderedMembers.Select(member => member.FullName).ToList());
    }
}
