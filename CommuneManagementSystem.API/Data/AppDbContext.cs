using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Household> Households => Set<Household>();
    public DbSet<Person> Persons => Set<Person>();
    public DbSet<TemporaryResidence> TemporaryResidences => Set<TemporaryResidence>();
    public DbSet<TemporaryAbsence> TemporaryAbsences => Set<TemporaryAbsence>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<BirthRecord> BirthRecords => Set<BirthRecord>();
    public DbSet<DeathRecord> DeathRecords => Set<DeathRecord>();
    public DbSet<SystemLog> SystemLogs => Set<SystemLog>();
    public DbSet<PersonDocument> PersonDocuments => Set<PersonDocument>();
    public DbSet<NotificationItem> NotificationItems => Set<NotificationItem>();
    public DbSet<MeetingEvent> MeetingEvents => Set<MeetingEvent>();
    public DbSet<MeetingRegistration> MeetingRegistrations => Set<MeetingRegistration>();
    public DbSet<WorkScheduleEntry> WorkScheduleEntries => Set<WorkScheduleEntry>();
    public DbSet<LibraryDocument> LibraryDocuments => Set<LibraryDocument>();
    public DbSet<FeedbackItem> FeedbackItems => Set<FeedbackItem>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<CatalogItem> CatalogItems => Set<CatalogItem>();
    public DbSet<UserGroup> UserGroups => Set<UserGroup>();
    public DbSet<UserGroupMember> UserGroupMembers => Set<UserGroupMember>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<WorkItem> WorkItems => Set<WorkItem>();
    public DbSet<ProjectItem> ProjectItems => Set<ProjectItem>();
    public DbSet<ProposalItem> ProposalItems => Set<ProposalItem>();
    public DbSet<StaffProfile> StaffProfiles => Set<StaffProfile>();
    public DbSet<BaseSalaryRate> BaseSalaryRates => Set<BaseSalaryRate>();
    public DbSet<PayrollEntry> PayrollEntries => Set<PayrollEntry>();
    public DbSet<SalaryTransfer> SalaryTransfers => Set<SalaryTransfer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Person>()
            .HasOne(p => p.Household)
            .WithMany(h => h.Members)
            .HasForeignKey(p => p.HouseholdId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TemporaryResidence>()
            .HasOne(t => t.Person)
            .WithMany(p => p.TemporaryResidences)
            .HasForeignKey(t => t.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TemporaryAbsence>()
            .HasOne(t => t.Person)
            .WithMany(p => p.TemporaryAbsences)
            .HasForeignKey(t => t.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PersonDocument>()
            .HasOne(d => d.Person)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MeetingRegistration>()
            .HasOne(registration => registration.MeetingEvent)
            .WithMany(meeting => meeting.Registrations)
            .HasForeignKey(registration => registration.MeetingEventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserGroupMember>()
            .HasOne(member => member.UserGroup)
            .WithMany(group => group.Members)
            .HasForeignKey(member => member.UserGroupId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PayrollEntry>()
            .HasOne(entry => entry.StaffProfile)
            .WithMany()
            .HasForeignKey(entry => entry.StaffProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SalaryTransfer>()
            .HasOne(item => item.PayrollEntry)
            .WithMany()
            .HasForeignKey(item => item.PayrollEntryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
