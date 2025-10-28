using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.Dtos.Catalog.Publisher
{
    public class CreatePublisherDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
