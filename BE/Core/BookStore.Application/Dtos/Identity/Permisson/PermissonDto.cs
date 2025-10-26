namespace BookStore.Application.Dtos.Identity.Permission
{
    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}