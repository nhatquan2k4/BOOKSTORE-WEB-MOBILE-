using BookStore.Application.DTO.Analytics;
using BookStore.Domain.Entities.Analytics___Activity;

namespace BookStore.Application.Mappers.Analytics
{
    public static class BookViewMapper
    {
        public static BookViewDto ToDto(this BookView bookView)
        {
            return new BookViewDto
            {
                Id = bookView.Id,
                BookId = bookView.BookId,
                UserId = bookView.UserId,
                ViewedAt = bookView.ViewedAt,
                IpAddress = bookView.IpAddress,
                SessionId = bookView.SessionId
            };
        }

        public static IEnumerable<BookViewDto> ToDtoList(this IEnumerable<BookView> bookViews)
        {
            return bookViews.Select(bookView => bookView.ToDto());
        }
    }
}
