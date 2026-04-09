namespace CommuneManagementSystem.API.Models;

public class FeedbackItem
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending | Processing | Resolved | Rejected
    public string? ResolutionNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? ProcessedByName { get; set; }
}
