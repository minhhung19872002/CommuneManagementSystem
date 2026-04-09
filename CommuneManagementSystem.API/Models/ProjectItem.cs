namespace CommuneManagementSystem.API.Models;

public class ProjectItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Sponsor { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int Progress { get; set; }
    public string Status { get; set; } = "Planning";
    public int? ManagerUserId { get; set; }
    public string? ManagerUserName { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
