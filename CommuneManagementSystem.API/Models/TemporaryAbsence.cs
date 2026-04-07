namespace CommuneManagementSystem.API.Models;

public class TemporaryAbsence
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public Person? Person { get; set; }
    public DateTime StartDate { get; set; }       // Ngày bắt đầu tạm vắng
    public DateTime EndDate { get; set; }          // Ngày kết thúc (dự kiến)
    public DateTime? ExtendedTo { get; set; }      // Ngày gia hạn đến
    public string Reason { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty; // Nơi đến
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = "Active";  // Active | Returned | Cancelled
}