namespace CommuneManagementSystem.API.Models;

public class WorkScheduleEntry
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public string Session { get; set; } = "Morning"; // Morning | Afternoon | Evening
    public int? AssignedUserId { get; set; }
    public string? AssignedUserName { get; set; }
    public int? CreatedByUserId { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
