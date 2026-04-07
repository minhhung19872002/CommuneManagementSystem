namespace CommuneManagementSystem.API.Models;

public class TemporaryResidence
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public Person? Person { get; set; }
    public string Address { get; set; } = string.Empty;    // Địa chỉ tạm trú
    public DateTime StartDate { get; set; }                  // Ngày bắt đầu
    public DateTime EndDate { get; set; }                    // Ngày kết thúc (dự kiến)
    public DateTime? ExtendedTo { get; set; }                // Ngày gia hạn đến
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = "Active";           // Active | Expired | Cancelled
}
