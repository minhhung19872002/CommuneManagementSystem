namespace CommuneManagementSystem.API.Models;

public class BaseSalaryRate
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime EffectiveDate { get; set; }
    public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}
