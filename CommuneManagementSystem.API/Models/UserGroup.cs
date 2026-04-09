namespace CommuneManagementSystem.API.Models;

public class UserGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<UserGroupMember> Members { get; set; } = new List<UserGroupMember>();
}
