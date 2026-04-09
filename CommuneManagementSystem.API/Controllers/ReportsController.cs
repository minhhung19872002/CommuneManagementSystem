using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[RequireRoles("Admin", "NhanKhau", "HoKhau")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<SystemOverviewDto>> GetOverview()
    {
        var totalPopulation = await _db.Persons.CountAsync();
        var totalHouseholds = await _db.Households.CountAsync();
        var activeTasks = await _db.TaskItems.CountAsync(item => item.Status != "Completed");
        var activeWorks = await _db.WorkItems.CountAsync(item => item.Status != "Completed");
        var activeProjects = await _db.ProjectItems.CountAsync(item => item.Status == "Active");
        var pendingProposals = await _db.ProposalItems.CountAsync(item => item.Status == "Pending");
        var staffCount = await _db.StaffProfiles.CountAsync(item => item.Status == "Active");
        var monthlyPayrollTotal = await _db.PayrollEntries
            .Where(item => item.Month == DateTime.Now.ToString("yyyy-MM"))
            .SumAsync(item => (decimal?)item.TotalAmount) ?? 0;

        var totalTasks = await _db.TaskItems.CountAsync();
        var completedTasks = await _db.TaskItems.CountAsync(item => item.Status == "Completed");
        var totalWorks = await _db.WorkItems.CountAsync();
        var completedWorks = await _db.WorkItems.CountAsync(item => item.Status == "Completed");
        var taskRate = totalTasks == 0 ? 0 : (decimal)completedTasks * 100 / totalTasks;
        var workRate = totalWorks == 0 ? 0 : (decimal)completedWorks * 100 / totalWorks;
        var overallKpiScore = Math.Round((taskRate + workRate) / 2, 2);

        return Ok(new SystemOverviewDto(
            totalPopulation,
            totalHouseholds,
            activeTasks,
            activeWorks,
            activeProjects,
            pendingProposals,
            staffCount,
            monthlyPayrollTotal,
            overallKpiScore));
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<PopulationStatsDto>> GetStatistics(
        [FromQuery] string? personStatus,
        [FromQuery] string? gender,
        [FromQuery] string? householdStatus)
    {
        var persons = _db.Persons.AsQueryable();
        var households = _db.Households.AsQueryable();

        if (!string.IsNullOrWhiteSpace(personStatus))
        {
            persons = persons.Where(person => person.Status == personStatus);
        }

        if (!string.IsNullOrWhiteSpace(gender))
        {
            persons = persons.Where(person => person.Gender == gender);
        }

        if (!string.IsNullOrWhiteSpace(householdStatus))
        {
            households = households.Where(household => household.Status == householdStatus);
        }

        var totalPopulation = await persons.CountAsync();
        var maleCount = await persons.CountAsync(person => person.Gender == "Nam");
        var femaleCount = await persons.CountAsync(person => person.Gender == "Nữ");
        var aliveCount = await persons.CountAsync(person => person.Status == "Alive");
        var deadCount = await persons.CountAsync(person => person.Status == "Dead");
        var movedCount = await persons.CountAsync(person => person.Status == "Moved");
        var totalHouseholds = await households.CountAsync();
        var activeHouseholds = await households.CountAsync(household => household.Status == "Active");
        var movedHouseholds = await households.CountAsync(household => household.Status == "Moved");
        var tempResidentCount = await _db.TemporaryResidences.CountAsync(item => item.Status == "Active");
        var tempAbsentCount = await _db.TemporaryAbsences.CountAsync(item => item.Status == "Active");

        return Ok(new PopulationStatsDto(
            totalPopulation,
            maleCount,
            femaleCount,
            aliveCount,
            deadCount,
            movedCount,
            totalHouseholds,
            activeHouseholds,
            movedHouseholds,
            tempResidentCount,
            tempAbsentCount));
    }

    [HttpGet("households")]
    public async Task<ActionResult> ExportHouseholds([FromQuery] string? search, [FromQuery] string? status)
    {
        var headNames = await _db.Persons.ToDictionaryAsync(person => person.Id, person => person.FullName);

        var query = _db.Households
            .Include(household => household.Members)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(household =>
                household.HouseholdNumber.Contains(search) ||
                household.Address.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(household => household.Status == status);
        }

        var households = await query
            .Select(household => new
            {
                household.Id,
                household.HouseholdNumber,
                household.Address,
                HeadPersonName = household.HeadPersonId.HasValue && headNames.ContainsKey(household.HeadPersonId.Value)
                    ? headNames[household.HeadPersonId.Value]
                    : null,
                MemberCount = household.Members.Count,
                household.Status,
                household.CreatedAt,
            })
            .ToListAsync();

        return Ok(new
        {
            type = "households",
            title = "BÁO CÁO DANH SÁCH HỘ KHẨU",
            data = households,
            generatedAt = DateTime.Now,
            filter = new { search, status },
        });
    }

    [HttpGet("population")]
    public async Task<ActionResult> ExportPopulation(
        [FromQuery] string? status,
        [FromQuery] string? gender,
        [FromQuery] int? householdId,
        [FromQuery] string? search)
    {
        var query = _db.Persons.Include(person => person.Household).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(person => person.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(gender))
        {
            query = query.Where(person => person.Gender == gender);
        }

        if (householdId.HasValue)
        {
            query = query.Where(person => person.HouseholdId == householdId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(person =>
                person.FullName.Contains(search) ||
                person.NationalId.Contains(search));
        }

        var persons = await query
            .Select(person => new
            {
                person.Id,
                person.FullName,
                person.DateOfBirth,
                person.Gender,
                person.NationalId,
                person.Ethnicity,
                person.Occupation,
                HouseholdNumber = person.Household != null ? person.Household.HouseholdNumber : null,
                person.Status,
            })
            .ToListAsync();

        return Ok(new
        {
            type = "population",
            title = "BÁO CÁO NHÂN KHẨU",
            data = persons,
            generatedAt = DateTime.Now,
            filter = new { status, gender, householdId, search },
        });
    }

    [HttpGet("temporary-residence")]
    public async Task<ActionResult> ExportTempResidence(
        [FromQuery] string? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = _db.TemporaryResidences.Include(item => item.Person).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(item => item.StartDate.Date >= fromDate.Value.Date);
        }

        if (toDate.HasValue)
        {
            query = query.Where(item => item.EndDate.Date <= toDate.Value.Date);
        }

        var data = await query
            .Select(item => new
            {
                item.Id,
                PersonName = item.Person != null ? item.Person.FullName : string.Empty,
                item.Address,
                item.StartDate,
                item.EndDate,
                item.Reason,
                item.Status,
            })
            .ToListAsync();

        return Ok(new
        {
            type = "temp-residence",
            title = "BÁO CÁO ĐĂNG KÝ TẠM TRÚ",
            data,
            generatedAt = DateTime.Now,
            filter = new { status, fromDate, toDate },
        });
    }

    [HttpGet("temporary-absence")]
    public async Task<ActionResult> ExportTempAbsence(
        [FromQuery] string? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = _db.TemporaryAbsences.Include(item => item.Person).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(item => item.StartDate.Date >= fromDate.Value.Date);
        }

        if (toDate.HasValue)
        {
            query = query.Where(item => item.EndDate.Date <= toDate.Value.Date);
        }

        var data = await query
            .Select(item => new
            {
                item.Id,
                PersonName = item.Person != null ? item.Person.FullName : string.Empty,
                item.StartDate,
                item.EndDate,
                item.Destination,
                item.Reason,
                item.Status,
            })
            .ToListAsync();

        return Ok(new
        {
            type = "temp-absence",
            title = "BÁO CÁO ĐĂNG KÝ TẠM VẮNG",
            data,
            generatedAt = DateTime.Now,
            filter = new { status, fromDate, toDate },
        });
    }
}
