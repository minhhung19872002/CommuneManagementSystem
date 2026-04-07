namespace CommuneManagementSystem.API.Models;

public class BirthRecord
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? BirthPlace { get; set; }
    public int? FatherId { get; set; }
    public int? MotherId { get; set; }
    public int? RegisteredByPersonId { get; set; } // Sau khi đăng ký sẽ tạo Person
    public DateTime CreatedAt { get; set; }
    public string RegisteredBy { get; set; } = string.Empty; // Người đăng ký
}