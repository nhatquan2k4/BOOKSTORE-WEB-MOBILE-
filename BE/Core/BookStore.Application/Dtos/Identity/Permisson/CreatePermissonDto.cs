namespace BookStore.Application.Dtos.Identity.Permission
{
    public class CreatePermissionDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string Module { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string Resource { get; set; } = null!;
        public bool IsActive { get; set; } = true;
    }
}