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
    }
}
