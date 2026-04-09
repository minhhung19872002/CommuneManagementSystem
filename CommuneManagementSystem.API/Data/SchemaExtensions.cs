using System.Data;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Data;

public static class SchemaExtensions
{
    public static void EnsureRuntimeSchema(this AppDbContext context)
    {
        context.Database.EnsureCreated();

        AddColumnIfMissing(context, "AppUsers", "Email", "TEXT NULL");
        AddColumnIfMissing(context, "AppUsers", "PhoneNumber", "TEXT NULL");
        AddColumnIfMissing(context, "AppUsers", "PasswordChangedAt", "TEXT NULL");
        context.Database.ExecuteSqlRaw(
            """
            UPDATE "AppUsers"
            SET "PasswordChangedAt" = COALESCE("PasswordChangedAt", "CreatedAt");
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "PersonDocuments" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_PersonDocuments" PRIMARY KEY AUTOINCREMENT,
                "PersonId" INTEGER NOT NULL,
                "FileName" TEXT NOT NULL,
                "ContentType" TEXT NOT NULL,
                "FileSize" INTEGER NOT NULL,
                "StoredFileName" TEXT NOT NULL,
                "StoredPath" TEXT NOT NULL,
                "UploadedAt" TEXT NOT NULL,
                "UploadedBy" TEXT NOT NULL,
                CONSTRAINT "FK_PersonDocuments_Persons_PersonId"
                    FOREIGN KEY ("PersonId") REFERENCES "Persons" ("Id") ON DELETE CASCADE
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE INDEX IF NOT EXISTS "IX_PersonDocuments_PersonId"
            ON "PersonDocuments" ("PersonId");
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "NotificationItems" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_NotificationItems" PRIMARY KEY AUTOINCREMENT,
                "Title" TEXT NOT NULL,
                "Summary" TEXT NOT NULL,
                "Content" TEXT NOT NULL,
                "AudienceRole" TEXT NULL,
                "Status" TEXT NOT NULL,
                "CreatedByUserId" INTEGER NULL,
                "CreatedByName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "ReviewedByUserId" INTEGER NULL,
                "ReviewedByName" TEXT NULL,
                "ReviewedAt" TEXT NULL,
                "ReviewNote" TEXT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "MeetingEvents" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_MeetingEvents" PRIMARY KEY AUTOINCREMENT,
                "Title" TEXT NOT NULL,
                "Agenda" TEXT NOT NULL,
                "Location" TEXT NOT NULL,
                "StartsAt" TEXT NOT NULL,
                "EndsAt" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "CreatedByUserId" INTEGER NULL,
                "CreatedByName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "MeetingRegistrations" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_MeetingRegistrations" PRIMARY KEY AUTOINCREMENT,
                "MeetingEventId" INTEGER NOT NULL,
                "UserId" INTEGER NOT NULL,
                "UserName" TEXT NOT NULL,
                "RegisteredAt" TEXT NOT NULL,
                "Note" TEXT NULL,
                CONSTRAINT "FK_MeetingRegistrations_MeetingEvents_MeetingEventId"
                    FOREIGN KEY ("MeetingEventId") REFERENCES "MeetingEvents" ("Id") ON DELETE CASCADE
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE INDEX IF NOT EXISTS "IX_MeetingRegistrations_MeetingEventId"
            ON "MeetingRegistrations" ("MeetingEventId");
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "WorkScheduleEntries" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_WorkScheduleEntries" PRIMARY KEY AUTOINCREMENT,
                "Title" TEXT NOT NULL,
                "Content" TEXT NOT NULL,
                "WorkDate" TEXT NOT NULL,
                "Session" TEXT NOT NULL,
                "AssignedUserId" INTEGER NULL,
                "AssignedUserName" TEXT NULL,
                "CreatedByUserId" INTEGER NULL,
                "CreatedByName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "LibraryDocuments" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_LibraryDocuments" PRIMARY KEY AUTOINCREMENT,
                "Title" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "Category" TEXT NOT NULL,
                "FileName" TEXT NOT NULL,
                "ContentType" TEXT NOT NULL,
                "FileSize" INTEGER NOT NULL,
                "StoredFileName" TEXT NOT NULL,
                "StoredPath" TEXT NOT NULL,
                "UploadedAt" TEXT NOT NULL,
                "UploadedBy" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "FeedbackItems" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_FeedbackItems" PRIMARY KEY AUTOINCREMENT,
                "FullName" TEXT NOT NULL,
                "ContactInfo" TEXT NOT NULL,
                "Title" TEXT NOT NULL,
                "Content" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "ResolutionNote" TEXT NULL,
                "CreatedAt" TEXT NOT NULL,
                "ProcessedAt" TEXT NULL,
                "ProcessedByName" TEXT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "SystemSettings" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_SystemSettings" PRIMARY KEY AUTOINCREMENT,
                "Key" TEXT NOT NULL,
                "Value" TEXT NOT NULL,
                "Category" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                "UpdatedBy" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "CatalogItems" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_CatalogItems" PRIMARY KEY AUTOINCREMENT,
                "Type" TEXT NOT NULL,
                "Code" TEXT NOT NULL,
                "Name" TEXT NOT NULL,
                "Description" TEXT NULL,
                "IsActive" INTEGER NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "UserGroups" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_UserGroups" PRIMARY KEY AUTOINCREMENT,
                "Name" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "UserGroupMembers" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_UserGroupMembers" PRIMARY KEY AUTOINCREMENT,
                "UserGroupId" INTEGER NOT NULL,
                "UserId" INTEGER NOT NULL,
                "Username" TEXT NOT NULL,
                "FullName" TEXT NOT NULL,
                "AddedAt" TEXT NOT NULL,
                CONSTRAINT "FK_UserGroupMembers_UserGroups_UserGroupId"
                    FOREIGN KEY ("UserGroupId") REFERENCES "UserGroups" ("Id") ON DELETE CASCADE
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE INDEX IF NOT EXISTS "IX_UserGroupMembers_UserGroupId"
            ON "UserGroupMembers" ("UserGroupId");
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "TaskItems" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_TaskItems" PRIMARY KEY AUTOINCREMENT,
                "Title" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "Priority" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "StartDate" TEXT NOT NULL,
                "DueDate" TEXT NOT NULL,
                "Progress" INTEGER NOT NULL,
                "AssignedUserId" INTEGER NULL,
                "AssignedUserName" TEXT NULL,
                "CreatedByName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "WorkItems" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_WorkItems" PRIMARY KEY AUTOINCREMENT,
                "Title" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "FieldCode" TEXT NOT NULL,
                "UnitCode" TEXT NOT NULL,
                "Priority" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "StartDate" TEXT NOT NULL,
                "DueDate" TEXT NOT NULL,
                "Progress" INTEGER NOT NULL,
                "AssignedUserId" INTEGER NULL,
                "AssignedUserName" TEXT NULL,
                "CreatedByName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "ProjectItems" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_ProjectItems" PRIMARY KEY AUTOINCREMENT,
                "Name" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "Sponsor" TEXT NOT NULL,
                "Budget" TEXT NOT NULL,
                "StartDate" TEXT NOT NULL,
                "EndDate" TEXT NOT NULL,
                "Progress" INTEGER NOT NULL,
                "Status" TEXT NOT NULL,
                "ManagerUserId" INTEGER NULL,
                "ManagerUserName" TEXT NULL,
                "CreatedByName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "ProposalItems" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_ProposalItems" PRIMARY KEY AUTOINCREMENT,
                "Title" TEXT NOT NULL,
                "Content" TEXT NOT NULL,
                "FieldCode" TEXT NOT NULL,
                "Priority" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "SubmittedByName" TEXT NOT NULL,
                "SubmittedAt" TEXT NOT NULL,
                "ReviewedByName" TEXT NULL,
                "ReviewedAt" TEXT NULL,
                "ReviewNote" TEXT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "StaffProfiles" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_StaffProfiles" PRIMARY KEY AUTOINCREMENT,
                "UserId" INTEGER NULL,
                "FullName" TEXT NOT NULL,
                "Position" TEXT NOT NULL,
                "Department" TEXT NOT NULL,
                "SalaryCoefficient" TEXT NOT NULL,
                "BankName" TEXT NOT NULL,
                "BankAccount" TEXT NOT NULL,
                "Email" TEXT NOT NULL,
                "PhoneNumber" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "BaseSalaryRates" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_BaseSalaryRates" PRIMARY KEY AUTOINCREMENT,
                "Amount" TEXT NOT NULL,
                "EffectiveDate" TEXT NOT NULL,
                "Note" TEXT NOT NULL,
                "IsActive" INTEGER NOT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "PayrollEntries" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_PayrollEntries" PRIMARY KEY AUTOINCREMENT,
                "StaffProfileId" INTEGER NOT NULL,
                "Month" TEXT NOT NULL,
                "BaseSalaryAmount" TEXT NOT NULL,
                "SalaryCoefficient" TEXT NOT NULL,
                "Allowance" TEXT NOT NULL,
                "Bonus" TEXT NOT NULL,
                "Deduction" TEXT NOT NULL,
                "TotalAmount" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_PayrollEntries_StaffProfiles_StaffProfileId"
                    FOREIGN KEY ("StaffProfileId") REFERENCES "StaffProfiles" ("Id") ON DELETE CASCADE
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE INDEX IF NOT EXISTS "IX_PayrollEntries_StaffProfileId"
            ON "PayrollEntries" ("StaffProfileId");
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS "SalaryTransfers" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_SalaryTransfers" PRIMARY KEY AUTOINCREMENT,
                "PayrollEntryId" INTEGER NOT NULL,
                "StaffName" TEXT NOT NULL,
                "BankName" TEXT NOT NULL,
                "BankAccount" TEXT NOT NULL,
                "Amount" TEXT NOT NULL,
                "TransferDate" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "ReferenceCode" TEXT NULL,
                "Note" TEXT NULL,
                CONSTRAINT "FK_SalaryTransfers_PayrollEntries_PayrollEntryId"
                    FOREIGN KEY ("PayrollEntryId") REFERENCES "PayrollEntries" ("Id") ON DELETE CASCADE
            );
            """);

        context.Database.ExecuteSqlRaw(
            """
            CREATE INDEX IF NOT EXISTS "IX_SalaryTransfers_PayrollEntryId"
            ON "SalaryTransfers" ("PayrollEntryId");
            """);
    }

    private static void AddColumnIfMissing(AppDbContext context, string tableName, string columnName, string definition)
    {
        var connection = context.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;
        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = $"PRAGMA table_info(\"{tableName}\");";
            using var reader = command.ExecuteReader();

            var exists = false;
            while (reader.Read())
            {
                if (string.Equals(reader.GetString(1), columnName, StringComparison.OrdinalIgnoreCase))
                {
                    exists = true;
                    break;
                }
            }

            reader.Close();

            if (!exists)
            {
                using var alterCommand = connection.CreateCommand();
                alterCommand.CommandText = $"ALTER TABLE \"{tableName}\" ADD COLUMN \"{columnName}\" {definition};";
                alterCommand.ExecuteNonQuery();
            }
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }
}
