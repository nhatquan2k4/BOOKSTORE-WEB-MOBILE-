namespace BookStore.Application.Dtos.Identity.Permission
{
    public class CreatePermissionDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}