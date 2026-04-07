namespace CommuneManagementSystem.API.DTOs;

// ============ AUTH ============
public record LoginRequest(string Username, string Password);
public record LoginResponse(int UserId, string Username, string FullName, string Role, string Token);

// ============ HOUSEHOLD ============
public record HouseholdDto(int Id, string HouseholdNumber, string Address, int? HeadPersonId, string? HeadPersonName, DateTime CreatedAt, string Status, string? MovedTo, int MemberCount);
public record CreateHouseholdDto(string HouseholdNumber, string Address, int HeadPersonId);
public record UpdateHouseholdDto(string Address, int? HeadPersonId, string Status, string? MovedTo);
public record SplitHouseholdDto(int OriginalId, int HeadPersonId1, int HeadPersonId2, string Address1, string Address2);
public record MoveHouseholdDto(int HouseholdId, string MovedTo, DateTime MoveDate);

// ============ PERSON ============
public record PersonDto(
    int Id, string FullName, DateTime DateOfBirth, string Gender, string NationalId,
    string? NationalIdIssuedAt, DateTime? NationalIdIssuedDate, string Ethnicity,
    string Religion, string EducationLevel, string Occupation, int? HouseholdId,
    string? HouseholdNumber, string RelationshipToHead, string Status
);
public record CreatePersonDto(
    string FullName, DateTime DateOfBirth, string Gender, string NationalId,
    string? NationalIdIssuedAt, DateTime? NationalIdIssuedDate, string Ethnicity,
    string Religion, string EducationLevel, string Occupation, int? HouseholdId,
    string RelationshipToHead
);
public record UpdatePersonDto(
    string? FullName, DateTime? DateOfBirth, string? Gender, string? NationalId,
    string? NationalIdIssuedAt, DateTime? NationalIdIssuedDate, string? Ethnicity,
    string? Religion, string? EducationLevel, string? Occupation,
    int? HouseholdId, string? RelationshipToHead, string? Status
);
public record BirthRecordDto(
    int Id, string FullName, DateTime DateOfBirth, string Gender,
    string? BirthPlace, int? FatherId, int? MotherId, DateTime CreatedAt, string RegisteredBy
);
public record CreateBirthRecordDto(
    string FullName, DateTime DateOfBirth, string Gender,
    string? BirthPlace, int? FatherId, int? MotherId
);
public record DeathRecordDto(
    int Id, string FullName, DateTime DateOfDeath, string Reason,
    string PlaceOfDeath, int PersonId, DateTime CreatedAt, string RegisteredBy
);
public record CreateDeathRecordDto(
    string FullName, DateTime DateOfDeath, string Reason, string PlaceOfDeath, int PersonId
);
public record AddMemberToHouseholdDto(int HouseholdId, int PersonId, string RelationshipToHead);

// ============ TEMPORARY RESIDENCE ============
public record TempResidenceDto(
    int Id, int PersonId, string? PersonName, string Address,
    DateTime StartDate, DateTime EndDate, DateTime? ExtendedTo, string Reason, string Status
);
public record CreateTempResidenceDto(int PersonId, string Address, DateTime StartDate, DateTime EndDate, string Reason);
public record ExtendTempResidenceDto(int Id, DateTime NewEndDate);

// ============ TEMPORARY ABSENCE ============
public record TempAbsenceDto(
    int Id, int PersonId, string? PersonName, DateTime StartDate, DateTime EndDate,
    DateTime? ExtendedTo, string Reason, string Destination, string Status
);
public record CreateTempAbsenceDto(int PersonId, DateTime StartDate, DateTime EndDate, string Reason, string Destination);
public record ExtendTempAbsenceDto(int Id, DateTime NewEndDate);

// ============ USER MANAGEMENT ============
public record AppUserDto(int Id, string Username, string FullName, string Role, DateTime CreatedAt, DateTime? LastLoginAt, string Status);
public record CreateAppUserDto(string Username, string Password, string FullName, string Role);
public record UpdateAppUserDto(string? FullName, string? Role, string? Status);

// ============ REPORT / STATISTICS ============
public record PopulationStatsDto(
    int TotalPopulation, int MaleCount, int FemaleCount,
    int AliveCount, int DeadCount, int MovedCount,
    int TotalHouseholds, int ActiveHouseholds, int MovedHouseholds,
    int TempResidentCount, int TempAbsentCount
);
public record SystemLogDto(
    int Id, int? UserId, string Username, string Action, string Module,
    string? Detail, DateTime CreatedAt, string IpAddress
);
