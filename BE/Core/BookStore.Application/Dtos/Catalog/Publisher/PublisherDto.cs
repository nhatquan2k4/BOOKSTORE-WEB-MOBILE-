namespace BookStore.Application.DTOs.Catalog.Publisher
{
    public class PublisherDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public string? Address { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }

    }
}