namespace CommuneManagementSystem.API.Models;

public class DeathRecord
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfDeath { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string PlaceOfDeath { get; set; } = string.Empty;
    public int PersonId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string RegisteredBy { get; set; } = string.Empty;
}