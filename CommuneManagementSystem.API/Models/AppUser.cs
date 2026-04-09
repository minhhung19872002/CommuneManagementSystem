namespace CommuneManagementSystem.API.Models;

public class AppUser
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty; // Admin | NhanKhau | HoKhau
    public DateTime CreatedAt { get; set; }
    public DateTime PasswordChangedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string Status { get; set; } = "Active"; // Active | Inactive
}
