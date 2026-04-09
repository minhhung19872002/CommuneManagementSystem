using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.Infrastructure;
using CommuneManagementSystem.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireRolesAttribute : Attribute, IAsyncActionFilter
{
    private readonly string[] _roles;

    public RequireRolesAttribute(params string[] roles)
    {
        _roles = roles ?? Array.Empty<string>();
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var token = context.HttpContext.Request.ReadBearerToken();
        var user = await ResolveUserAsync(db, token);

        if (user is null || !string.Equals(user.Status, "Active", StringComparison.OrdinalIgnoreCase))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Vui lòng đăng nhập để tiếp tục." });
            return;
        }

        context.HttpContext.SetCurrentUser(user);

        if (_roles.Length > 0 && !_roles.Contains(user.Role, StringComparer.OrdinalIgnoreCase))
        {
            context.Result = new ObjectResult(new { message = "Bạn không có quyền thực hiện thao tác này." })
            {
                StatusCode = StatusCodes.Status403Forbidden,
            };
            return;
        }

        await next();
    }

    private static async Task<AppUser?> ResolveUserAsync(AppDbContext db, string? token)
    {
        var userId = RequestUserExtensions.TryParseUserId(token);
        if (userId.HasValue)
        {
            return await db.AppUsers.FirstOrDefaultAsync(user => user.Id == userId.Value);
        }

        return null;
    }
}
