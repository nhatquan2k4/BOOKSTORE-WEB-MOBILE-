namespace BookStore.Application.Dtos.Identity.Permission
{
    public class UpdatePermissionDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Module { get; set; }
        public string? Action { get; set; }
        public string? Resource { get; set; }
        public bool? IsActive { get; set; }
    }
}