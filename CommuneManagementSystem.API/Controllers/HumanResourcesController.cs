using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.DTOs;
using CommuneManagementSystem.API.Filters;
using CommuneManagementSystem.API.Infrastructure;
using CommuneManagementSystem.API.Models;
using CommuneManagementSystem.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[RequireRoles("Admin")]
public class HumanResourcesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISystemLogService _logs;

    public HumanResourcesController(AppDbContext db, ISystemLogService logs)
    {
        _db = db;
        _logs = logs;
    }

    [HttpGet("staffs")]
    public async Task<ActionResult<IEnumerable<StaffProfileDto>>> GetStaffs([FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.StaffProfiles.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(item => item.FullName.Contains(search) || item.Position.Contains(search) || item.Department.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var items = await query
            .OrderBy(item => item.FullName)
            .Select(item => new StaffProfileDto(
                item.Id,
                item.UserId,
                item.FullName,
                item.Position,
                item.Department,
                item.SalaryCoefficient,
                item.BankName,
                item.BankAccount,
                item.Email,
                item.PhoneNumber,
                item.Status,
                item.CreatedAt,
                item.UpdatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("staffs")]
    public async Task<ActionResult<StaffProfileDto>> CreateStaff([FromBody] SaveStaffProfileDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = new StaffProfile
        {
            UserId = dto.UserId,
            FullName = dto.FullName,
            Position = dto.Position,
            Department = dto.Department,
            SalaryCoefficient = dto.SalaryCoefficient,
            BankName = dto.BankName,
            BankAccount = dto.BankAccount,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Status = dto.Status,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };

        _db.StaffProfiles.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao can bo", "HR", $"Tao can bo {item.FullName}", actor: actor);
        return CreatedAtAction(nameof(GetStaffs), new { id = item.Id }, Map(item));
    }

    [HttpPut("staffs/{id}")]
    public async Task<ActionResult<StaffProfileDto>> UpdateStaff(int id, [FromBody] SaveStaffProfileDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.StaffProfiles.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.UserId = dto.UserId;
        item.FullName = dto.FullName;
        item.Position = dto.Position;
        item.Department = dto.Department;
        item.SalaryCoefficient = dto.SalaryCoefficient;
        item.BankName = dto.BankName;
        item.BankAccount = dto.BankAccount;
        item.Email = dto.Email;
        item.PhoneNumber = dto.PhoneNumber;
        item.Status = dto.Status;
        item.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat can bo", "HR", $"Cap nhat can bo {item.FullName}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("staffs/{id}")]
    public async Task<ActionResult> DeleteStaff(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.StaffProfiles.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.StaffProfiles.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa can bo", "HR", $"Xoa can bo {item.FullName}", actor: actor);
        return NoContent();
    }

    [HttpGet("base-salaries")]
    public async Task<ActionResult<IEnumerable<BaseSalaryRateDto>>> GetBaseSalaries()
    {
        var items = await _db.BaseSalaryRates
            .OrderByDescending(item => item.EffectiveDate)
            .Select(item => new BaseSalaryRateDto(item.Id, item.Amount, item.EffectiveDate, item.Note, item.IsActive, item.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("base-salaries")]
    public async Task<ActionResult<BaseSalaryRateDto>> CreateBaseSalary([FromBody] SaveBaseSalaryRateDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;

        if (dto.IsActive)
        {
            await SetAllBaseSalaryInactiveAsync();
        }

        var item = new BaseSalaryRate
        {
            Amount = dto.Amount,
            EffectiveDate = dto.EffectiveDate,
            Note = dto.Note,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.Now,
        };

        _db.BaseSalaryRates.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao luong co so", "HR", $"Tao muc luong co so {item.Amount}", actor: actor);
        return CreatedAtAction(nameof(GetBaseSalaries), new { id = item.Id }, Map(item));
    }

    [HttpPut("base-salaries/{id}")]
    public async Task<ActionResult<BaseSalaryRateDto>> UpdateBaseSalary(int id, [FromBody] SaveBaseSalaryRateDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.BaseSalaryRates.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        if (dto.IsActive)
        {
            await SetAllBaseSalaryInactiveAsync();
        }

        item.Amount = dto.Amount;
        item.EffectiveDate = dto.EffectiveDate;
        item.Note = dto.Note;
        item.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat luong co so", "HR", $"Cap nhat muc luong co so {item.Amount}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("base-salaries/{id}")]
    public async Task<ActionResult> DeleteBaseSalary(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.BaseSalaryRates.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.BaseSalaryRates.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa luong co so", "HR", $"Xoa muc luong co so {item.Amount}", actor: actor);
        return NoContent();
    }

    [HttpGet("payrolls")]
    public async Task<ActionResult<IEnumerable<PayrollEntryDto>>> GetPayrolls([FromQuery] string? month, [FromQuery] string? status)
    {
        var query = _db.PayrollEntries.Include(item => item.StaffProfile).AsQueryable();

        if (!string.IsNullOrWhiteSpace(month))
        {
            query = query.Where(item => item.Month == month);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var items = await query
            .OrderByDescending(item => item.Month)
            .ThenBy(item => item.StaffProfile!.FullName)
            .Select(item => new PayrollEntryDto(
                item.Id,
                item.StaffProfileId,
                item.StaffProfile != null ? item.StaffProfile.FullName : string.Empty,
                item.Month,
                item.BaseSalaryAmount,
                item.SalaryCoefficient,
                item.Allowance,
                item.Bonus,
                item.Deduction,
                item.TotalAmount,
                item.Status,
                item.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("payrolls")]
    public async Task<ActionResult<PayrollEntryDto>> CreatePayroll([FromBody] SavePayrollEntryDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var staff = await _db.StaffProfiles.FindAsync(dto.StaffProfileId);
        if (staff == null)
        {
            return BadRequest(new { message = "Khong tim thay can bo." });
        }

        var activeBaseSalary = await GetCurrentBaseSalaryAsync();
        var item = new PayrollEntry
        {
            StaffProfileId = staff.Id,
            Month = dto.Month,
            BaseSalaryAmount = activeBaseSalary,
            SalaryCoefficient = staff.SalaryCoefficient,
            Allowance = dto.Allowance,
            Bonus = dto.Bonus,
            Deduction = dto.Deduction,
            TotalAmount = CalculatePayrollTotal(activeBaseSalary, staff.SalaryCoefficient, dto.Allowance, dto.Bonus, dto.Deduction),
            Status = dto.Status,
            CreatedAt = DateTime.Now,
        };

        _db.PayrollEntries.Add(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao bang luong", "HR", $"Tao bang luong {dto.Month} cho {staff.FullName}", actor: actor);
        return CreatedAtAction(nameof(GetPayrolls), new { id = item.Id }, await MapPayrollAsync(item.Id));
    }

    [HttpPut("payrolls/{id}")]
    public async Task<ActionResult<PayrollEntryDto>> UpdatePayroll(int id, [FromBody] SavePayrollEntryDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.PayrollEntries.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        var staff = await _db.StaffProfiles.FindAsync(dto.StaffProfileId);
        if (staff == null)
        {
            return BadRequest(new { message = "Khong tim thay can bo." });
        }

        var activeBaseSalary = await GetCurrentBaseSalaryAsync();
        item.StaffProfileId = staff.Id;
        item.Month = dto.Month;
        item.BaseSalaryAmount = activeBaseSalary;
        item.SalaryCoefficient = staff.SalaryCoefficient;
        item.Allowance = dto.Allowance;
        item.Bonus = dto.Bonus;
        item.Deduction = dto.Deduction;
        item.TotalAmount = CalculatePayrollTotal(activeBaseSalary, staff.SalaryCoefficient, dto.Allowance, dto.Bonus, dto.Deduction);
        item.Status = dto.Status;

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat bang luong", "HR", $"Cap nhat bang luong {dto.Month} cho {staff.FullName}", actor: actor);
        return Ok(await MapPayrollAsync(item.Id));
    }

    [HttpDelete("payrolls/{id}")]
    public async Task<ActionResult> DeletePayroll(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.PayrollEntries.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.PayrollEntries.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa bang luong", "HR", $"Xoa bang luong {item.Month}", actor: actor);
        return NoContent();
    }

    [HttpGet("transfers")]
    public async Task<ActionResult<IEnumerable<SalaryTransferDto>>> GetTransfers([FromQuery] string? status)
    {
        var query = _db.SalaryTransfers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(item => item.Status == status);
        }

        var items = await query
            .OrderByDescending(item => item.TransferDate)
            .Select(item => new SalaryTransferDto(
                item.Id,
                item.PayrollEntryId,
                item.StaffName,
                item.BankName,
                item.BankAccount,
                item.Amount,
                item.TransferDate,
                item.Status,
                item.ReferenceCode,
                item.Note))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("transfers")]
    public async Task<ActionResult<SalaryTransferDto>> CreateTransfer([FromBody] SaveSalaryTransferDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var payroll = await _db.PayrollEntries.Include(item => item.StaffProfile).FirstOrDefaultAsync(item => item.Id == dto.PayrollEntryId);
        if (payroll == null || payroll.StaffProfile == null)
        {
            return BadRequest(new { message = "Khong tim thay bang luong." });
        }

        var item = new SalaryTransfer
        {
            PayrollEntryId = payroll.Id,
            StaffName = payroll.StaffProfile.FullName,
            BankName = payroll.StaffProfile.BankName,
            BankAccount = payroll.StaffProfile.BankAccount,
            Amount = payroll.TotalAmount,
            TransferDate = dto.TransferDate,
            Status = dto.Status,
            ReferenceCode = dto.ReferenceCode,
            Note = dto.Note,
        };

        _db.SalaryTransfers.Add(item);
        payroll.Status = dto.Status == "Completed" ? "Transferred" : payroll.Status;
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Tao chuyen luong", "HR", $"Tao lenh chuyen luong cho {item.StaffName}", actor: actor);
        return CreatedAtAction(nameof(GetTransfers), new { id = item.Id }, Map(item));
    }

    [HttpPut("transfers/{id}")]
    public async Task<ActionResult<SalaryTransferDto>> UpdateTransfer(int id, [FromBody] SaveSalaryTransferDto dto)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.SalaryTransfers.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.TransferDate = dto.TransferDate;
        item.Status = dto.Status;
        item.ReferenceCode = dto.ReferenceCode;
        item.Note = dto.Note;

        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Cap nhat chuyen luong", "HR", $"Cap nhat lenh chuyen luong cho {item.StaffName}", actor: actor);
        return Ok(Map(item));
    }

    [HttpDelete("transfers/{id}")]
    public async Task<ActionResult> DeleteTransfer(int id)
    {
        var actor = HttpContext.GetCurrentUser()!;
        var item = await _db.SalaryTransfers.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.SalaryTransfers.Remove(item);
        await _db.SaveChangesAsync();
        await _logs.LogAsync(HttpContext, "Xoa chuyen luong", "HR", $"Xoa lenh chuyen luong cho {item.StaffName}", actor: actor);
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<HrPayrollStatsDto>> GetStats()
    {
        var currentBaseSalary = await GetCurrentBaseSalaryAsync();
        var currentMonth = DateTime.Now.ToString("yyyy-MM");
        var monthlyPayrollTotal = await _db.PayrollEntries
            .Where(item => item.Month == currentMonth)
            .SumAsync(item => (decimal?)item.TotalAmount) ?? 0;

        return Ok(new HrPayrollStatsDto(
            await _db.StaffProfiles.CountAsync(),
            await _db.StaffProfiles.CountAsync(item => item.Status == "Active"),
            await _db.PayrollEntries.CountAsync(),
            await _db.SalaryTransfers.CountAsync(item => item.Status == "Completed"),
            currentBaseSalary,
            monthlyPayrollTotal));
    }

    private async Task SetAllBaseSalaryInactiveAsync()
    {
        var activeItems = await _db.BaseSalaryRates.Where(item => item.IsActive).ToListAsync();
        foreach (var item in activeItems)
        {
            item.IsActive = false;
        }
    }

    private async Task<decimal> GetCurrentBaseSalaryAsync()
    {
        return await _db.BaseSalaryRates
            .Where(item => item.IsActive)
            .OrderByDescending(item => item.EffectiveDate)
            .Select(item => (decimal?)item.Amount)
            .FirstOrDefaultAsync() ?? 0;
    }

    private static decimal CalculatePayrollTotal(decimal baseSalary, decimal coefficient, decimal allowance, decimal bonus, decimal deduction)
    {
        return Math.Round((baseSalary * coefficient) + allowance + bonus - deduction, 2);
    }

    private async Task<PayrollEntryDto> MapPayrollAsync(int payrollId)
    {
        return await _db.PayrollEntries
            .Include(item => item.StaffProfile)
            .Where(item => item.Id == payrollId)
            .Select(item => new PayrollEntryDto(
                item.Id,
                item.StaffProfileId,
                item.StaffProfile != null ? item.StaffProfile.FullName : string.Empty,
                item.Month,
                item.BaseSalaryAmount,
                item.SalaryCoefficient,
                item.Allowance,
                item.Bonus,
                item.Deduction,
                item.TotalAmount,
                item.Status,
                item.CreatedAt))
            .FirstAsync();
    }

    private static StaffProfileDto Map(StaffProfile item)
    {
        return new StaffProfileDto(
            item.Id,
            item.UserId,
            item.FullName,
            item.Position,
            item.Department,
            item.SalaryCoefficient,
            item.BankName,
            item.BankAccount,
            item.Email,
            item.PhoneNumber,
            item.Status,
            item.CreatedAt,
            item.UpdatedAt);
    }

    private static BaseSalaryRateDto Map(BaseSalaryRate item)
    {
        return new BaseSalaryRateDto(item.Id, item.Amount, item.EffectiveDate, item.Note, item.IsActive, item.CreatedAt);
    }

    private static SalaryTransferDto Map(SalaryTransfer item)
    {
        return new SalaryTransferDto(
            item.Id,
            item.PayrollEntryId,
            item.StaffName,
            item.BankName,
            item.BankAccount,
            item.Amount,
            item.TransferDate,
            item.Status,
            item.ReferenceCode,
            item.Note);
    }
}
