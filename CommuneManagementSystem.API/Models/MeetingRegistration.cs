namespace CommuneManagementSystem.API.Models;

public class MeetingRegistration
{
    public int Id { get; set; }
    public int MeetingEventId { get; set; }
    public MeetingEvent? MeetingEvent { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public string? Note { get; set; }
}
