using CommuneManagementSystem.API.Models;

namespace CommuneManagementSystem.API.Data;

public static class SeedData
{
    public static void Seed(this AppDbContext context)
    {
        var defaultUsers = new List<AppUser>
        {
            new() { Username = "admin", PasswordHash = "123", FullName = "Nguyễn Văn A", Role = "Admin", CreatedAt = DateTime.Now, Status = "Active" },
            new() { Username = "nhankhau", PasswordHash = "123", FullName = "Trần Thị B", Role = "NhanKhau", CreatedAt = DateTime.Now, Status = "Active" },
            new() { Username = "hokhau", PasswordHash = "123", FullName = "Lê Văn C", Role = "HoKhau", CreatedAt = DateTime.Now, Status = "Active" },
        };

        if (context.AppUsers.Any())
        {
            var existingUsernames = context.AppUsers.Select(user => user.Username).ToHashSet();
            var missingUsers = defaultUsers.Where(user => !existingUsernames.Contains(user.Username)).ToList();

            if (missingUsers.Count > 0)
            {
                context.AppUsers.AddRange(missingUsers);
                context.SaveChanges();
            }

            return;
        }

        // === Users ===
        var users = defaultUsers.Select((user, index) =>
        {
            user.Id = index + 1;
            return user;
        }).ToList();

        // === Households ===
        var households = new List<Household>
        {
            new Household { Id = 1, HouseholdNumber = "HK-001", Address = "Thôn 1, Xã An Thành", HeadPersonId = 1, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
            new Household { Id = 2, HouseholdNumber = "HK-002", Address = "Thôn 2, Xã An Thành", HeadPersonId = 4, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
            new Household { Id = 3, HouseholdNumber = "HK-003", Address = "Thôn 1, Xã An Thành", HeadPersonId = 7, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
        };

        // === Persons ===
        var persons = new List<Person>
        {
            // HK-001
            new Person { Id = 1, FullName = "Nguyễn Văn Minh", DateOfBirth = new DateTime(1975, 5, 10), Gender = "Nam", NationalId = "079175001234", Ethnicity = "Kinh", Religion = "Không", EducationLevel = "12/12", Occupation = "Nông dân", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 1, RelationshipToHead = "Chủ hộ" },
            new Person { Id = 2, FullName = "Nguyễn Thị Lan", DateOfBirth = new DateTime(1978, 8, 22), Gender = "Nữ", NationalId = "079275001235", Ethnicity = "Kinh", Religion = "Phật giáo", EducationLevel = "10/12", Occupation = "Nội trợ", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 1, RelationshipToHead = "Vợ" },
            new Person { Id = 3, FullName = "Nguyễn Minh Tuấn", DateOfBirth = new DateTime(2005, 3, 15), Gender = "Nam", NationalId = "079305001236", Ethnicity = "Kinh", Religion = "Không", EducationLevel = "12/12", Occupation = "Học sinh", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 1, RelationshipToHead = "Con" },
            // HK-002
            new Person { Id = 4, FullName = "Trần Văn Hùng", DateOfBirth = new DateTime(1980, 12, 1), Gender = "Nam", NationalId = "079180001237", Ethnicity = "Kinh", Religion = "Không", EducationLevel = "12/12", Occupation = "Công nhân", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 2, RelationshipToHead = "Chủ hộ" },
            new Person { Id = 5, FullName = "Trần Thị Hương", DateOfBirth = new DateTime(1982, 4, 18), Gender = "Nữ", NationalId = "079280001238", Ethnicity = "Kinh", Religion = "Công giáo", EducationLevel = "9/12", Occupation = "Buôn bán", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 2, RelationshipToHead = "Vợ" },
            new Person { Id = 6, FullName = "Trần Đức Anh", DateOfBirth = new DateTime(2010, 7, 9), Gender = "Nam", NationalId = "079310001239", Ethnicity = "Kinh", Religion = "Không", EducationLevel = "5/12", Occupation = "Học sinh", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 2, RelationshipToHead = "Con" },
            // HK-003
            new Person { Id = 7, FullName = "Lê Thị Hà", DateOfBirth = new DateTime(1990, 2, 28), Gender = "Nữ", NationalId = "079090001240", Ethnicity = "Kinh", Religion = "Phật giáo", EducationLevel = "12/12", Occupation = "Giáo viên", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 3, RelationshipToHead = "Chủ hộ" },
            new Person { Id = 8, FullName = "Lê Quang Đức", DateOfBirth = new DateTime(2018, 11, 5), Gender = "Nam", NationalId = "079318001241", Ethnicity = "Kinh", Religion = "Không", EducationLevel = "1/12", Occupation = "Học sinh", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now, HouseholdId = 3, RelationshipToHead = "Con" },
        };

        // === Temporary Residence ===
        var tempResidences = new List<TemporaryResidence>
        {
            new TemporaryResidence { Id = 1, PersonId = 6, Address = "Ký túc xá Trường THPT An Thành", StartDate = DateTime.Now.AddMonths(-2), EndDate = DateTime.Now.AddMonths(4), Reason = "Học tập", CreatedAt = DateTime.Now, Status = "Active" },
        };

        // === Temporary Absence ===
        var tempAbsences = new List<TemporaryAbsence>
        {
            new TemporaryAbsence { Id = 1, PersonId = 4, StartDate = DateTime.Now.AddDays(-10), EndDate = DateTime.Now.AddDays(20), Reason = "Công tác", Destination = "TP. Hồ Chí Minh", CreatedAt = DateTime.Now, Status = "Active" },
        };

        // === Birth Records ===
        var birthRecords = new List<BirthRecord>
        {
            new BirthRecord { Id = 1, FullName = "Lê Quang Đức", DateOfBirth = new DateTime(2018, 11, 5), Gender = "Nam", BirthPlace = "Bệnh viện Đa khoa Huyện", FatherId = null, MotherId = 7, RegisteredByPersonId = 7, CreatedAt = new DateTime(2018, 11, 10), RegisteredBy = "Lê Thị Hà" },
        };

        // === Death Records ===
        var deathRecords = new List<DeathRecord>
        {
            new DeathRecord { Id = 1, FullName = "Nguyễn Văn Phong", DateOfDeath = new DateTime(2023, 6, 15), Reason = "Bệnh tim", PlaceOfDeath = "Nhà riêng", PersonId = 0, CreatedAt = new DateTime(2023, 6, 16), RegisteredBy = "Nguyễn Văn A" },
        };

        // === System Logs ===
        var systemLogs = new List<SystemLog>
        {
            new SystemLog { Id = 1, UserId = 1, Username = "admin", Action = "Đăng nhập", Module = "System", Detail = "Đăng nhập thành công", CreatedAt = DateTime.Now.AddHours(-2), IpAddress = "127.0.0.1" },
            new SystemLog { Id = 2, UserId = 1, Username = "admin", Action = "Tạo hộ khẩu", Module = "HoKhau", Detail = "Tạo hộ khẩu HK-003", CreatedAt = DateTime.Now.AddHours(-1), IpAddress = "127.0.0.1" },
        };

        context.AppUsers.AddRange(users);
        context.Households.AddRange(households);
        context.Persons.AddRange(persons);
        context.TemporaryResidences.AddRange(tempResidences);
        context.TemporaryAbsences.AddRange(tempAbsences);
        context.BirthRecords.AddRange(birthRecords);
        context.DeathRecords.AddRange(deathRecords);
        context.SystemLogs.AddRange(systemLogs);
        context.SaveChanges();
    }
}
