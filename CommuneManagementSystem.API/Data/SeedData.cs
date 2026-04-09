using CommuneManagementSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CommuneManagementSystem.API.Data;

public static class SeedData
{
    public static void Seed(this AppDbContext context)
    {
        var now = DateTime.Now;
        var defaultUsers = new List<AppUser>
        {
            new()
            {
                Username = "admin",
                PasswordHash = "123",
                FullName = "Nguyen Van A",
                Email = "admin@commune.local",
                PhoneNumber = "0900000000",
                Role = "Admin",
                CreatedAt = now,
                PasswordChangedAt = now,
                Status = "Active",
            },
            new()
            {
                Username = "nhankhau",
                PasswordHash = "123",
                FullName = "Tran Thi B",
                Email = "nhankhau@commune.local",
                PhoneNumber = "0900000002",
                Role = "NhanKhau",
                CreatedAt = now,
                PasswordChangedAt = now,
                Status = "Active",
            },
            new()
            {
                Username = "hokhau",
                PasswordHash = "123",
                FullName = "Le Van C",
                Email = "hokhau@commune.local",
                PhoneNumber = "0900000003",
                Role = "HoKhau",
                CreatedAt = now,
                PasswordChangedAt = now,
                Status = "Active",
            },
        };

        var existingUsernames = context.AppUsers.Select(user => user.Username).ToHashSet();
        var missingUsers = defaultUsers.Where(user => !existingUsernames.Contains(user.Username)).ToList();
        if (missingUsers.Count > 0)
        {
            context.AppUsers.AddRange(missingUsers);
            context.SaveChanges();
        }

        foreach (var user in context.AppUsers)
        {
            if (user.PasswordChangedAt == default)
            {
                user.PasswordChangedAt = user.CreatedAt == default ? now : user.CreatedAt;
            }
        }

        if (!context.Households.Any())
        {
            context.Households.AddRange(
                new Household { Id = 1, HouseholdNumber = "HK-001", Address = "Thon 1, Xa An Thanh", HeadPersonId = 1, CreatedAt = now, UpdatedAt = now },
                new Household { Id = 2, HouseholdNumber = "HK-002", Address = "Thon 2, Xa An Thanh", HeadPersonId = 4, CreatedAt = now, UpdatedAt = now },
                new Household { Id = 3, HouseholdNumber = "HK-003", Address = "Thon 1, Xa An Thanh", HeadPersonId = 7, CreatedAt = now, UpdatedAt = now });
        }

        if (!context.Persons.Any())
        {
            context.Persons.AddRange(
                new Person { Id = 1, FullName = "Nguyen Van Minh", DateOfBirth = new DateTime(1975, 5, 10), Gender = "Nam", NationalId = "079175001234", Ethnicity = "Kinh", Religion = "Khong", EducationLevel = "12/12", Occupation = "Nong dan", CreatedAt = now, UpdatedAt = now, HouseholdId = 1, RelationshipToHead = "Chu ho" },
                new Person { Id = 2, FullName = "Nguyen Thi Lan", DateOfBirth = new DateTime(1978, 8, 22), Gender = "Nu", NationalId = "079275001235", Ethnicity = "Kinh", Religion = "Phat giao", EducationLevel = "10/12", Occupation = "Noi tro", CreatedAt = now, UpdatedAt = now, HouseholdId = 1, RelationshipToHead = "Vo" },
                new Person { Id = 3, FullName = "Nguyen Minh Tuan", DateOfBirth = new DateTime(2005, 3, 15), Gender = "Nam", NationalId = "079305001236", Ethnicity = "Kinh", Religion = "Khong", EducationLevel = "12/12", Occupation = "Hoc sinh", CreatedAt = now, UpdatedAt = now, HouseholdId = 1, RelationshipToHead = "Con" },
                new Person { Id = 4, FullName = "Tran Van Hung", DateOfBirth = new DateTime(1980, 12, 1), Gender = "Nam", NationalId = "079180001237", Ethnicity = "Kinh", Religion = "Khong", EducationLevel = "12/12", Occupation = "Cong nhan", CreatedAt = now, UpdatedAt = now, HouseholdId = 2, RelationshipToHead = "Chu ho" },
                new Person { Id = 5, FullName = "Tran Thi Huong", DateOfBirth = new DateTime(1982, 4, 18), Gender = "Nu", NationalId = "079280001238", Ethnicity = "Kinh", Religion = "Cong giao", EducationLevel = "9/12", Occupation = "Buon ban", CreatedAt = now, UpdatedAt = now, HouseholdId = 2, RelationshipToHead = "Vo" },
                new Person { Id = 6, FullName = "Tran Duc Anh", DateOfBirth = new DateTime(2010, 7, 9), Gender = "Nam", NationalId = "079310001239", Ethnicity = "Kinh", Religion = "Khong", EducationLevel = "5/12", Occupation = "Hoc sinh", CreatedAt = now, UpdatedAt = now, HouseholdId = 2, RelationshipToHead = "Con" },
                new Person { Id = 7, FullName = "Le Thi Ha", DateOfBirth = new DateTime(1990, 2, 28), Gender = "Nu", NationalId = "079090001240", Ethnicity = "Kinh", Religion = "Phat giao", EducationLevel = "12/12", Occupation = "Giao vien", CreatedAt = now, UpdatedAt = now, HouseholdId = 3, RelationshipToHead = "Chu ho" },
                new Person { Id = 8, FullName = "Le Quang Duc", DateOfBirth = new DateTime(2018, 11, 5), Gender = "Nam", NationalId = "079318001241", Ethnicity = "Kinh", Religion = "Khong", EducationLevel = "1/12", Occupation = "Hoc sinh", CreatedAt = now, UpdatedAt = now, HouseholdId = 3, RelationshipToHead = "Con" });
        }

        if (!context.TemporaryResidences.Any())
        {
            context.TemporaryResidences.Add(new TemporaryResidence
            {
                Id = 1,
                PersonId = 6,
                Address = "Ky tuc xa Truong THPT An Thanh",
                StartDate = now.AddMonths(-2),
                EndDate = now.AddMonths(4),
                Reason = "Hoc tap",
                CreatedAt = now,
                Status = "Active",
            });
        }

        if (!context.TemporaryAbsences.Any())
        {
            context.TemporaryAbsences.Add(new TemporaryAbsence
            {
                Id = 1,
                PersonId = 4,
                StartDate = now.AddDays(-10),
                EndDate = now.AddDays(20),
                Reason = "Cong tac",
                Destination = "TP. Ho Chi Minh",
                CreatedAt = now,
                Status = "Active",
            });
        }

        if (!context.BirthRecords.Any())
        {
            context.BirthRecords.Add(new BirthRecord
            {
                Id = 1,
                FullName = "Le Quang Duc",
                DateOfBirth = new DateTime(2018, 11, 5),
                Gender = "Nam",
                BirthPlace = "Benh vien Da khoa Huyen",
                MotherId = 7,
                RegisteredByPersonId = 7,
                CreatedAt = new DateTime(2018, 11, 10),
                RegisteredBy = "Le Thi Ha",
            });
        }

        if (!context.DeathRecords.Any())
        {
            context.DeathRecords.Add(new DeathRecord
            {
                Id = 1,
                FullName = "Nguyen Van Phong",
                DateOfDeath = new DateTime(2023, 6, 15),
                Reason = "Benh tim",
                PlaceOfDeath = "Nha rieng",
                PersonId = 0,
                CreatedAt = new DateTime(2023, 6, 16),
                RegisteredBy = "Nguyen Van A",
            });
        }

        if (!context.SystemLogs.Any())
        {
            context.SystemLogs.AddRange(
                new SystemLog { Id = 1, UserId = 1, Username = "admin", Action = "Dang nhap", Module = "System", Detail = "Dang nhap thanh cong", CreatedAt = now.AddHours(-2), IpAddress = "127.0.0.1" },
                new SystemLog { Id = 2, UserId = 1, Username = "admin", Action = "Tao ho khau", Module = "HoKhau", Detail = "Tao ho khau HK-003", CreatedAt = now.AddHours(-1), IpAddress = "127.0.0.1" });
        }

        if (!context.NotificationItems.Any())
        {
            context.NotificationItems.Add(new NotificationItem
            {
                Title = "Thong bao hop giao ban",
                Summary = "Hop giao ban dau tuan tai UBND xa",
                Content = "Tat ca can bo tham du hop giao ban luc 08:00 sang thu Hai.",
                AudienceRole = null,
                Status = "Published",
                CreatedByUserId = 1,
                CreatedByName = "Nguyen Van A",
                CreatedAt = now.AddDays(-2),
                ReviewedByUserId = 1,
                ReviewedByName = "Nguyen Van A",
                ReviewedAt = now.AddDays(-2),
                ReviewNote = "Da duyet",
            });
        }

        if (!context.MeetingEvents.Any())
        {
            context.MeetingEvents.Add(new MeetingEvent
            {
                Title = "Hop trien khai cong tac thang",
                Agenda = "Thong nhat chi tieu va phan cong cong viec",
                Location = "Phong hop UBND xa",
                StartsAt = now.Date.AddDays(1).AddHours(8),
                EndsAt = now.Date.AddDays(1).AddHours(10),
                Status = "Scheduled",
                CreatedByUserId = 1,
                CreatedByName = "Nguyen Van A",
                CreatedAt = now.AddDays(-1),
            });
        }

        context.SaveChanges();

        if (!context.MeetingRegistrations.Any() && context.MeetingEvents.Any())
        {
            var meetingId = context.MeetingEvents.OrderBy(item => item.Id).Select(item => item.Id).First();
            context.MeetingRegistrations.Add(new MeetingRegistration
            {
                MeetingEventId = meetingId,
                UserId = 2,
                UserName = "Tran Thi B",
                RegisteredAt = now,
                Note = "Da xac nhan tham du",
            });
        }

        if (!context.WorkScheduleEntries.Any())
        {
            context.WorkScheduleEntries.AddRange(
                new WorkScheduleEntry
                {
                    Title = "Tiep dan dinh ky",
                    Content = "Truc tiep dan va tiep nhan phan anh",
                    WorkDate = now.Date.AddDays(1),
                    Session = "Sang",
                    AssignedUserId = 2,
                    AssignedUserName = "Tran Thi B",
                    CreatedByUserId = 1,
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now,
                },
                new WorkScheduleEntry
                {
                    Title = "Ra soat ho khau moi",
                    Content = "Kiem tra ho so tach ho va chuyen di",
                    WorkDate = now.Date.AddDays(2),
                    Session = "Chieu",
                    AssignedUserId = 3,
                    AssignedUserName = "Le Van C",
                    CreatedByUserId = 1,
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now,
                });
        }

        if (!context.LibraryDocuments.Any())
        {
            context.LibraryDocuments.Add(new LibraryDocument
            {
                Title = "Quy che tiep nhan ho so",
                Description = "Tai lieu huong dan xu ly ho so dan cu",
                Category = "Quy trinh",
                FileName = "quy-che-tiep-nhan.txt",
                ContentType = "text/plain",
                FileSize = 0,
                StoredFileName = string.Empty,
                StoredPath = string.Empty,
                UploadedAt = now,
                UploadedBy = "Nguyen Van A",
            });
        }

        if (!context.FeedbackItems.Any())
        {
            context.FeedbackItems.Add(new FeedbackItem
            {
                FullName = "Pham Thi Hoa",
                ContactInfo = "0900000001",
                Title = "Can ho tro cap nhat thong tin tam tru",
                Content = "De nghi kiem tra tinh trang ho so tam tru da nop.",
                Status = "Pending",
                CreatedAt = now.AddHours(-6),
            });
        }

        if (!context.SystemSettings.Any())
        {
            context.SystemSettings.AddRange(
                new SystemSetting { Key = "AgencyName", Value = "UBND Xa An Thanh", Category = "General", Description = "Ten don vi van hanh", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "ContactEmail", Value = "ubnd-anthanh@local.gov", Category = "General", Description = "Email lien he he thong", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "ContactPhone", Value = "0299000000", Category = "General", Description = "So dien thoai lien he", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "DatabaseProvider", Value = "SQLite", Category = "Connection", Description = "Loai co so du lieu dang su dung", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "ApiBaseUrl", Value = "http://127.0.0.1:5068/api", Category = "Connection", Description = "Dia chi API mac dinh", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "BackupRetentionDays", Value = "30", Category = "Security", Description = "So ngay luu ban sao luu", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "PasswordExpiryDays", Value = "90", Category = "Security", Description = "Thoi han mat khau theo ngay", UpdatedAt = now, UpdatedBy = "System" },
                new SystemSetting { Key = "PasswordWarningDays", Value = "10", Category = "Security", Description = "So ngay canh bao truoc khi het han", UpdatedAt = now, UpdatedBy = "System" });
        }

        if (!context.CatalogItems.Any())
        {
            context.CatalogItems.AddRange(
                new CatalogItem { Type = "Field", Code = "NK", Name = "Nhan khau", Description = "Linh vuc quan ly nhan khau", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new CatalogItem { Type = "Field", Code = "HK", Name = "Ho khau", Description = "Linh vuc quan ly ho khau", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new CatalogItem { Type = "Field", Code = "HC", Name = "Hanh chinh", Description = "Linh vuc hanh chinh tong hop", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new CatalogItem { Type = "Unit", Code = "T1", Name = "Thon 1", Description = "Don vi dia ban Thon 1", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new CatalogItem { Type = "Unit", Code = "T2", Name = "Thon 2", Description = "Don vi dia ban Thon 2", IsActive = true, CreatedAt = now, UpdatedAt = now },
                new CatalogItem { Type = "Unit", Code = "UBND", Name = "Van phong UBND", Description = "Don vi van phong hanh chinh", IsActive = true, CreatedAt = now, UpdatedAt = now });
        }

        context.SaveChanges();

        if (!context.UserGroups.Any())
        {
            context.UserGroups.AddRange(
                new UserGroup { Name = "To nhan khau", Description = "Nhom xu ly ho so nhan khau", CreatedAt = now, UpdatedAt = now },
                new UserGroup { Name = "To ho khau", Description = "Nhom xu ly bien dong ho khau", CreatedAt = now, UpdatedAt = now });
            context.SaveChanges();
        }

        if (!context.UserGroupMembers.Any())
        {
            var nhanKhauGroup = context.UserGroups.FirstOrDefault(group => group.Name == "To nhan khau");
            var hoKhauGroup = context.UserGroups.FirstOrDefault(group => group.Name == "To ho khau");
            var nhanKhauUser = context.AppUsers.FirstOrDefault(user => user.Username == "nhankhau");
            var hoKhauUser = context.AppUsers.FirstOrDefault(user => user.Username == "hokhau");

            if (nhanKhauGroup != null && nhanKhauUser != null)
            {
                context.UserGroupMembers.Add(new UserGroupMember
                {
                    UserGroupId = nhanKhauGroup.Id,
                    UserId = nhanKhauUser.Id,
                    Username = nhanKhauUser.Username,
                    FullName = nhanKhauUser.FullName,
                    AddedAt = now,
                });
            }

            if (hoKhauGroup != null && hoKhauUser != null)
            {
                context.UserGroupMembers.Add(new UserGroupMember
                {
                    UserGroupId = hoKhauGroup.Id,
                    UserId = hoKhauUser.Id,
                    Username = hoKhauUser.Username,
                    FullName = hoKhauUser.FullName,
                    AddedAt = now,
                });
            }
        }

        if (!context.TaskItems.Any())
        {
            context.TaskItems.AddRange(
                new TaskItem
                {
                    Title = "Ra soat du lieu tam tru",
                    Description = "Kiem tra cac ho so tam tru sap het han trong thang nay.",
                    Priority = "High",
                    Status = "InProgress",
                    StartDate = now.Date.AddDays(-2),
                    DueDate = now.Date.AddDays(3),
                    Progress = 55,
                    AssignedUserId = 2,
                    AssignedUserName = "Tran Thi B",
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now.AddDays(-2),
                },
                new TaskItem
                {
                    Title = "Tong hop bien dong ho khau quy II",
                    Description = "Lap bao cao tong hop bien dong ho khau phuc vu hop giao ban.",
                    Priority = "Medium",
                    Status = "Completed",
                    StartDate = now.Date.AddDays(-10),
                    DueDate = now.Date.AddDays(-2),
                    Progress = 100,
                    AssignedUserId = 3,
                    AssignedUserName = "Le Van C",
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now.AddDays(-10),
                });
        }

        if (!context.WorkItems.Any())
        {
            context.WorkItems.AddRange(
                new WorkItem
                {
                    Title = "Cap nhat so lieu dan cu Thon 1",
                    Description = "Doi chieu ho so nhan khau va cap nhat sai lech.",
                    FieldCode = "NK",
                    UnitCode = "T1",
                    Priority = "High",
                    Status = "InProgress",
                    StartDate = now.Date.AddDays(-1),
                    DueDate = now.Date.AddDays(5),
                    Progress = 45,
                    AssignedUserId = 2,
                    AssignedUserName = "Tran Thi B",
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now.AddDays(-1),
                },
                new WorkItem
                {
                    Title = "Kiem tra ho so tach ho Thon 2",
                    Description = "Loc va tham dinh cac ho so tach ho moi phat sinh.",
                    FieldCode = "HK",
                    UnitCode = "T2",
                    Priority = "Medium",
                    Status = "Pending",
                    StartDate = now.Date,
                    DueDate = now.Date.AddDays(7),
                    Progress = 0,
                    AssignedUserId = 3,
                    AssignedUserName = "Le Van C",
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now,
                });
        }

        if (!context.ProjectItems.Any())
        {
            context.ProjectItems.AddRange(
                new ProjectItem
                {
                    Name = "So hoa ho so dan cu",
                    Description = "Thuc hien quet va chuan hoa ho so dan cu giay.",
                    Sponsor = "UBND Xa",
                    Budget = 250000000,
                    StartDate = now.Date.AddMonths(-1),
                    EndDate = now.Date.AddMonths(4),
                    Progress = 60,
                    Status = "Active",
                    ManagerUserId = 1,
                    ManagerUserName = "Nguyen Van A",
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now.AddMonths(-1),
                },
                new ProjectItem
                {
                    Name = "Nang cap phong mot cua",
                    Description = "Cai tao khong gian tiep nhan va bo tri lai quy trinh tiep dan.",
                    Sponsor = "Huyen",
                    Budget = 180000000,
                    StartDate = now.Date.AddMonths(-4),
                    EndDate = now.Date.AddDays(-10),
                    Progress = 100,
                    Status = "Completed",
                    ManagerUserId = 1,
                    ManagerUserName = "Nguyen Van A",
                    CreatedByName = "Nguyen Van A",
                    CreatedAt = now.AddMonths(-4),
                });
        }

        if (!context.ProposalItems.Any())
        {
            context.ProposalItems.AddRange(
                new ProposalItem
                {
                    Title = "Bo sung thiet bi scan ho so",
                    Content = "De xuat mua them 02 may scan toc do cao cho bo phan mot cua.",
                    FieldCode = "HC",
                    Priority = "High",
                    Status = "Pending",
                    SubmittedByName = "Tran Thi B",
                    SubmittedAt = now.AddDays(-3),
                },
                new ProposalItem
                {
                    Title = "Mo rong kho luu tru van ban",
                    Content = "De xuat cai tao kho luu tru tai lieu dung chung.",
                    FieldCode = "HK",
                    Priority = "Medium",
                    Status = "Approved",
                    SubmittedByName = "Le Van C",
                    SubmittedAt = now.AddDays(-12),
                    ReviewedByName = "Nguyen Van A",
                    ReviewedAt = now.AddDays(-10),
                    ReviewNote = "Dong y trien khai trong quy III",
                });
        }

        if (!context.StaffProfiles.Any())
        {
            context.StaffProfiles.AddRange(
                new StaffProfile
                {
                    UserId = 1,
                    FullName = "Nguyen Van A",
                    Position = "Chu tich UBND Xa",
                    Department = "UBND",
                    SalaryCoefficient = 5.2m,
                    BankName = "Vietcombank",
                    BankAccount = "001100000001",
                    Email = "admin@commune.local",
                    PhoneNumber = "0900000000",
                    Status = "Active",
                    CreatedAt = now.AddMonths(-12),
                    UpdatedAt = now,
                },
                new StaffProfile
                {
                    UserId = 2,
                    FullName = "Tran Thi B",
                    Position = "Can bo Nhan khau",
                    Department = "UBND",
                    SalaryCoefficient = 3.66m,
                    BankName = "BIDV",
                    BankAccount = "601100000002",
                    Email = "nhankhau@commune.local",
                    PhoneNumber = "0900000002",
                    Status = "Active",
                    CreatedAt = now.AddMonths(-10),
                    UpdatedAt = now,
                },
                new StaffProfile
                {
                    UserId = 3,
                    FullName = "Le Van C",
                    Position = "Can bo Ho khau",
                    Department = "UBND",
                    SalaryCoefficient = 3.33m,
                    BankName = "Agribank",
                    BankAccount = "970405000003",
                    Email = "hokhau@commune.local",
                    PhoneNumber = "0900000003",
                    Status = "Active",
                    CreatedAt = now.AddMonths(-8),
                    UpdatedAt = now,
                });
        }

        if (!context.BaseSalaryRates.Any())
        {
            context.BaseSalaryRates.Add(new BaseSalaryRate
            {
                Amount = 1800000,
                EffectiveDate = new DateTime(now.Year, 1, 1),
                Note = "Muc luong co so ap dung hien tai",
                IsActive = true,
                CreatedAt = now.AddMonths(-3),
            });
        }

        context.SaveChanges();

        if (!context.PayrollEntries.Any())
        {
            var activeBaseSalary = context.BaseSalaryRates.Where(item => item.IsActive).OrderByDescending(item => item.EffectiveDate).FirstOrDefault()?.Amount ?? 0;
            var currentMonth = now.ToString("yyyy-MM");
            foreach (var staff in context.StaffProfiles.ToList())
            {
                var total = Math.Round((activeBaseSalary * staff.SalaryCoefficient) + 500000m - 150000m, 2);
                context.PayrollEntries.Add(new PayrollEntry
                {
                    StaffProfileId = staff.Id,
                    Month = currentMonth,
                    BaseSalaryAmount = activeBaseSalary,
                    SalaryCoefficient = staff.SalaryCoefficient,
                    Allowance = 500000,
                    Bonus = 0,
                    Deduction = 150000,
                    TotalAmount = total,
                    Status = staff.UserId == 1 ? "Transferred" : "Approved",
                    CreatedAt = now.AddDays(-2),
                });
            }
        }

        context.SaveChanges();

        if (!context.SalaryTransfers.Any())
        {
            var payroll = context.PayrollEntries.Include(item => item.StaffProfile).FirstOrDefault(item => item.Status == "Transferred" && item.StaffProfile != null);
            if (payroll?.StaffProfile != null)
            {
                context.SalaryTransfers.Add(new SalaryTransfer
                {
                    PayrollEntryId = payroll.Id,
                    StaffName = payroll.StaffProfile.FullName,
                    BankName = payroll.StaffProfile.BankName,
                    BankAccount = payroll.StaffProfile.BankAccount,
                    Amount = payroll.TotalAmount,
                    TransferDate = now.AddDays(-1),
                    Status = "Completed",
                    ReferenceCode = "SL-2026-0001",
                    Note = "Chuyen luong thang hien tai",
                });
            }
        }

        context.SaveChanges();
    }
}
