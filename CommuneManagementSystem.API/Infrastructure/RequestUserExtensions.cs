using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Infrastructure;

public static class RequestUserExtensions
{
    public const string CurrentUserItemKey = "__CurrentUser";

    public static string? ReadBearerToken(this HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header))
        {
            return null;
        }

        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : header.Trim();
    }

    public static int? TryParseUserId(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        var parts = token.Split('-', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        for (var i = parts.Length - 1; i >= 0; i--)
        {
            if (int.TryParse(parts[i], out var userId))
            {
                return userId;
            }
        }

        return token.Equals("mock-jwt-token", StringComparison.OrdinalIgnoreCase) ? 1 : null;
    }

    public static void SetCurrentUser(this HttpContext httpContext, AppUser user)
    {
        httpContext.Items[CurrentUserItemKey] = user;
    }

    public static AppUser? GetCurrentUser(this HttpContext httpContext)
    {
        return httpContext.Items.TryGetValue(CurrentUserItemKey, out var value)
            ? value as AppUser
            : null;
    }
}
