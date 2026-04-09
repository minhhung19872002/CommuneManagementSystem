namespace CommuneManagementSystem.API.DTOs;

// ============ AUTH ============
public record LoginRequest(string Username, string Password);
public record LoginResponse(
    int UserId,
    string Username,
    string FullName,
    string Role,
    string Token,
    string? Email,
    string? PhoneNumber,
    DateTime? PasswordExpiresAt,
    bool PasswordNearExpiry,
    bool PasswordExpired,
    string? PasswordWarningMessage);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
public record ResetPasswordDto(string Username, string? FullName, string NewPassword);
public record UpdateProfileDto(string FullName, string? Email, string? PhoneNumber);

// ============ HOUSEHOLD ============
public record HouseholdDto(int Id, string HouseholdNumber, string Address, int? HeadPersonId, string? HeadPersonName, DateTime CreatedAt, string Status, string? MovedTo, int MemberCount);
public record CreateHouseholdDto(string HouseholdNumber, string Address, int HeadPersonId);
public record UpdateHouseholdDto(string Address, int? HeadPersonId, string Status, string? MovedTo);
public record SplitHouseholdDto(int OriginalId, string NewHouseholdNumber, string NewAddress, int NewHeadPersonId, List<int> MemberIds);
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
public record PersonDocumentDto(
    int Id,
    int PersonId,
    string FileName,
    string ContentType,
    long FileSize,
    DateTime UploadedAt,
    string UploadedBy,
    string DownloadUrl
);

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
public record AppUserDto(
    int Id,
    string Username,
    string FullName,
    string Role,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    string Status,
    string? Email,
    string? PhoneNumber,
    DateTime PasswordChangedAt);
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

// ============ NOTIFICATIONS ============
public record NotificationDto(
    int Id,
    string Title,
    string Summary,
    string Content,
    string? AudienceRole,
    string Status,
    string CreatedByName,
    DateTime CreatedAt,
    string? ReviewedByName,
    DateTime? ReviewedAt,
    string? ReviewNote
);
public record CreateNotificationDto(string Title, string Summary, string Content, string? AudienceRole);
public record UpdateNotificationDto(string Title, string Summary, string Content, string? AudienceRole);
public record ReviewNotificationDto(string Status, string? ReviewNote);

// ============ MEETINGS ============
public record MeetingEventDto(
    int Id,
    string Title,
    string Agenda,
    string Location,
    DateTime StartsAt,
    DateTime EndsAt,
    string Status,
    string CreatedByName,
    DateTime CreatedAt,
    int RegistrationCount,
    bool IsRegistered
);
public record CreateMeetingEventDto(string Title, string Agenda, string Location, DateTime StartsAt, DateTime EndsAt);
public record UpdateMeetingEventDto(string Title, string Agenda, string Location, DateTime StartsAt, DateTime EndsAt, string Status);
public record RegisterMeetingDto(string? Note);

// ============ WORK SCHEDULE ============
public record WorkScheduleEntryDto(
    int Id,
    string Title,
    string Content,
    DateTime WorkDate,
    string Session,
    int? AssignedUserId,
    string? AssignedUserName,
    string CreatedByName,
    DateTime CreatedAt
);
public record CreateWorkScheduleEntryDto(string Title, string Content, DateTime WorkDate, string Session, int? AssignedUserId);
public record UpdateWorkScheduleEntryDto(string Title, string Content, DateTime WorkDate, string Session, int? AssignedUserId);

// ============ DOCUMENT LIBRARY ============
public record LibraryDocumentDto(
    int Id,
    string Title,
    string Description,
    string Category,
    string FileName,
    string ContentType,
    long FileSize,
    DateTime UploadedAt,
    string UploadedBy,
    string DownloadUrl
);
public record UpdateLibraryDocumentDto(string Title, string Description, string Category);

// ============ FEEDBACK ============
public record FeedbackItemDto(
    int Id,
    string FullName,
    string ContactInfo,
    string Title,
    string Content,
    string Status,
    string? ResolutionNote,
    DateTime CreatedAt,
    DateTime? ProcessedAt,
    string? ProcessedByName
);
public record CreateFeedbackItemDto(string FullName, string ContactInfo, string Title, string Content);
public record UpdateFeedbackItemDto(string Status, string? ResolutionNote);

// ============ SETTINGS / CATALOGS / GROUPS ============
public record SystemSettingDto(
    int Id,
    string Key,
    string Value,
    string Category,
    string Description,
    DateTime UpdatedAt,
    string UpdatedBy);
public record SaveSystemSettingDto(string Key, string Value, string Category, string Description);

public record CatalogItemDto(
    int Id,
    string Type,
    string Code,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);
public record CreateCatalogItemDto(string Type, string Code, string Name, string? Description);
public record UpdateCatalogItemDto(string Code, string Name, string? Description, bool IsActive);

public record UserGroupDto(
    int Id,
    string Name,
    string Description,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int MemberCount,
    IReadOnlyList<int> UserIds,
    IReadOnlyList<string> UserNames);
public record SaveUserGroupDto(string Name, string Description, List<int> UserIds);

// ============ TASKS / WORKS / PROJECTS / PROPOSALS ============
public record TaskItemDto(
    int Id,
    string Title,
    string Description,
    string Priority,
    string Status,
    DateTime StartDate,
    DateTime DueDate,
    int Progress,
    int? AssignedUserId,
    string? AssignedUserName,
    string CreatedByName,
    DateTime CreatedAt);
public record SaveTaskItemDto(string Title, string Description, string Priority, string Status, DateTime StartDate, DateTime DueDate, int Progress, int? AssignedUserId);

public record WorkItemDto(
    int Id,
    string Title,
    string Description,
    string FieldCode,
    string UnitCode,
    string Priority,
    string Status,
    DateTime StartDate,
    DateTime DueDate,
    int Progress,
    int? AssignedUserId,
    string? AssignedUserName,
    string CreatedByName,
    DateTime CreatedAt);
public record SaveWorkItemDto(string Title, string Description, string FieldCode, string UnitCode, string Priority, string Status, DateTime StartDate, DateTime DueDate, int Progress, int? AssignedUserId);

public record TaskKpiStatsDto(
    int TotalTasks,
    int CompletedTasks,
    int TotalWorks,
    int CompletedWorks,
    int OverdueTasks,
    int OverdueWorks,
    decimal TaskCompletionRate,
    decimal WorkCompletionRate,
    decimal OverallKpiScore);

public record ProjectItemDto(
    int Id,
    string Name,
    string Description,
    string Sponsor,
    decimal Budget,
    DateTime StartDate,
    DateTime EndDate,
    int Progress,
    string Status,
    int? ManagerUserId,
    string? ManagerUserName,
    string CreatedByName,
    DateTime CreatedAt);
public record SaveProjectItemDto(string Name, string Description, string Sponsor, decimal Budget, DateTime StartDate, DateTime EndDate, int Progress, string Status, int? ManagerUserId);

public record ProposalItemDto(
    int Id,
    string Title,
    string Content,
    string FieldCode,
    string Priority,
    string Status,
    string SubmittedByName,
    DateTime SubmittedAt,
    string? ReviewedByName,
    DateTime? ReviewedAt,
    string? ReviewNote);
public record SaveProposalItemDto(string Title, string Content, string FieldCode, string Priority, string Status, string? ReviewNote);

public record ProjectProposalStatsDto(
    int TotalProjects,
    int ActiveProjects,
    int CompletedProjects,
    int TotalProposals,
    int PendingProposals,
    int ApprovedProposals,
    decimal TotalBudget,
    decimal ActiveProjectBudget);

// ============ HR / PAYROLL ============
public record StaffProfileDto(
    int Id,
    int? UserId,
    string FullName,
    string Position,
    string Department,
    decimal SalaryCoefficient,
    string BankName,
    string BankAccount,
    string Email,
    string PhoneNumber,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt);
public record SaveStaffProfileDto(int? UserId, string FullName, string Position, string Department, decimal SalaryCoefficient, string BankName, string BankAccount, string Email, string PhoneNumber, string Status);

public record BaseSalaryRateDto(int Id, decimal Amount, DateTime EffectiveDate, string Note, bool IsActive, DateTime CreatedAt);
public record SaveBaseSalaryRateDto(decimal Amount, DateTime EffectiveDate, string Note, bool IsActive);

public record PayrollEntryDto(
    int Id,
    int StaffProfileId,
    string StaffName,
    string Month,
    decimal BaseSalaryAmount,
    decimal SalaryCoefficient,
    decimal Allowance,
    decimal Bonus,
    decimal Deduction,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt);
public record SavePayrollEntryDto(int StaffProfileId, string Month, decimal Allowance, decimal Bonus, decimal Deduction, string Status);

public record SalaryTransferDto(
    int Id,
    int PayrollEntryId,
    string StaffName,
    string BankName,
    string BankAccount,
    decimal Amount,
    DateTime TransferDate,
    string Status,
    string? ReferenceCode,
    string? Note);
public record SaveSalaryTransferDto(int PayrollEntryId, DateTime TransferDate, string Status, string? ReferenceCode, string? Note);

public record HrPayrollStatsDto(
    int StaffCount,
    int ActiveStaffCount,
    int PayrollCount,
    int TransferredPayrollCount,
    decimal CurrentBaseSalary,
    decimal MonthlyPayrollTotal);

// ============ DASHBOARD ============
public record SystemOverviewDto(
    int TotalPopulation,
    int TotalHouseholds,
    int ActiveTasks,
    int ActiveWorks,
    int ActiveProjects,
    int PendingProposals,
    int StaffCount,
    decimal MonthlyPayrollTotal,
    decimal OverallKpiScore);
