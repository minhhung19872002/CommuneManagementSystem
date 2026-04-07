namespace CommuneManagementSystem.API.Models;

public class Household
{
    public int Id { get; set; }
    public string HouseholdNumber { get; set; } = string.Empty; // Số hộ khẩu
    public string Address { get; set; } = string.Empty;          // Địa chỉ thường trú
    public int? HeadPersonId { get; set; }                       // ID chủ hộ (FK → Person)
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Status { get; set; } = "Active";               // Active | Moved | Deleted
    public string? MovedTo { get; set; }                         // Xã chuyển đến (nếu chuyển đi)

    // Navigation
    public ICollection<Person> Members { get; set; } = new List<Person>();
}
