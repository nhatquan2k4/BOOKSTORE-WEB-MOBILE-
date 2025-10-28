namespace BookStore.Application.Dtos.Catalog.Category
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ParentId { get; set; }
        public string? ParentName { get; set; }
        public int BookCount { get; set; }
        public int SubCategoriesCount { get; set; }
    }
}