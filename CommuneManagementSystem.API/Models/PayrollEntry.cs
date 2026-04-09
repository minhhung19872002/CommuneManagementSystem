namespace CommuneManagementSystem.API.Models;

public class PayrollEntry
{
    public int Id { get; set; }
    public int StaffProfileId { get; set; }
    public StaffProfile? StaffProfile { get; set; }
    public string Month { get; set; } = string.Empty;
    public decimal BaseSalaryAmount { get; set; }
    public decimal SalaryCoefficient { get; set; }
    public decimal Allowance { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deduction { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Draft";
    public DateTime CreatedAt { get; set; }
}
