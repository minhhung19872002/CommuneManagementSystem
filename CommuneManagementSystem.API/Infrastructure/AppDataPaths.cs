using Microsoft.AspNetCore.Hosting;

namespace CommuneManagementSystem.API.Infrastructure;

public static class AppDataPaths
{
    private const string AppFolderName = "commune-management-system";

    public static string ResolveDataRoot(IWebHostEnvironment environment)
    {
        var explicitRoot = Environment.GetEnvironmentVariable("APP_DATA_ROOT");
        if (!string.IsNullOrWhiteSpace(explicitRoot))
        {
            return EnsureDirectory(explicitRoot);
        }

        var home = Environment.GetEnvironmentVariable("HOME");
        if (!string.IsNullOrWhiteSpace(home))
        {
            return EnsureDirectory(Path.Combine(home, "data", AppFolderName));
        }

        return EnsureDirectory(Path.Combine(environment.ContentRootPath, "App_Data"));
    }

    public static string ResolveDatabasePath(IWebHostEnvironment environment)
    {
        return Path.Combine(ResolveDataRoot(environment), "commune.db");
    }

    public static string ResolveStoragePath(IWebHostEnvironment environment, string relativePath)
    {
        return Path.Combine(ResolveDataRoot(environment), relativePath);
    }

    private static string EnsureDirectory(string path)
    {
        Directory.CreateDirectory(path);
        return path;
    }
}
