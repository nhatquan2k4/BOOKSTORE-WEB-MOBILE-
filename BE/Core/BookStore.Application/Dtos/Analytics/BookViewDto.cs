namespace BookStore.Application.DTO.Analytics
{
    public class BookViewDto
    {
        public Guid Id { get; set; }
        public Guid BookId { get; set; }
        public Guid? UserId { get; set; }
        public DateTime ViewedAt { get; set; }
        public string? IpAddress { get; set; }
        public string? SessionId { get; set; }
    }
}
