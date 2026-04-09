namespace CommuneManagementSystem.API.Models;

public class MeetingEvent
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Agenda { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled | Approved | Rejected | Completed
    public int? CreatedByUserId { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public ICollection<MeetingRegistration> Registrations { get; set; } = new List<MeetingRegistration>();
}
