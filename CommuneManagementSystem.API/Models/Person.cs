namespace CommuneManagementSystem.API.Models;

public class Person
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty; // Nam | Nữ
    public string NationalId { get; set; } = string.Empty; // CCCD
    public string? NationalIdIssuedAt { get; set; } // Nơi cấp CCCD
    public DateTime? NationalIdIssuedDate { get; set; } // Ngày cấp CCCD
    public string Ethnicity { get; set; } = string.Empty;
    public string Religion { get; set; } = string.Empty;
    public string EducationLevel { get; set; } = string.Empty;
    public string Occupation { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Status { get; set; } = "Alive"; // Alive | Dead | Moved

    // FK
    public int? HouseholdId { get; set; }
    public Household? Household { get; set; }

    // Quan hệ với chủ hộ
    public string RelationshipToHead { get; set; } = string.Empty; // Chủ hộ | Vợ | Con | ...

    // Birth record
    public int? BirthRecordId { get; set; }

    // Death record
    public int? DeathRecordId { get; set; }

    // Temporary residence
    public ICollection<TemporaryResidence> TemporaryResidences { get; set; } = new List<TemporaryResidence>();

    // Temporary absence
    public ICollection<TemporaryAbsence> TemporaryAbsences { get; set; } = new List<TemporaryAbsence>();
}
