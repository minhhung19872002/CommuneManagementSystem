namespace CommuneManagementSystem.API.Models;

public class UserGroupMember
{
    public int Id { get; set; }
    public int UserGroupId { get; set; }
    public UserGroup? UserGroup { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; }
}
