namespace CommuneManagementSystem.API.Models;

public class SalaryTransfer
{
    public int Id { get; set; }
    public int PayrollEntryId { get; set; }
    public PayrollEntry? PayrollEntry { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BankAccount { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime TransferDate { get; set; }
    public string Status { get; set; } = "Pending";
    public string? ReferenceCode { get; set; }
    public string? Note { get; set; }
}
