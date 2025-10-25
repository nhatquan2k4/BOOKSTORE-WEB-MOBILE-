namespace BookStore.Application.Dtos.Identity.Permission
{
    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string Module { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string Resource { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}