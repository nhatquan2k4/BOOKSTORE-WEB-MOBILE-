namespace BookStore.Application.DTO.Analytics
{

    public class TopViewedBookDto
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string? BookCoverUrl { get; set; }
        public int ViewCount { get; set; }
        public int UniqueViewers { get; set; }
    }
}
