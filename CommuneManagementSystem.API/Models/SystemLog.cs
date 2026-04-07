namespace CommuneManagementSystem.API.Models;

public class SystemLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;    // HoKhau | NhanKhau | TamTru | TamVang | System
    public string? Detail { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public string IpAddress { get; set; } = string.Empty;
}