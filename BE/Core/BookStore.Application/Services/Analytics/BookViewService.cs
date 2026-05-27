using BookStore.Application.DTO.Analytics;
using BookStore.Application.IService.Analytics;
using BookStore.Application.Mappers.Analytics;
using BookStore.Domain.Entities.Analytics___Activity;
using BookStore.Domain.IRepository.Analytics;

namespace BookStore.Application.Service.Analytics
{
    public class BookViewService : IBookViewService
    {
        private readonly IBookViewRepository _bookViewRepository;

        public BookViewService(IBookViewRepository bookViewRepository)
        {
            _bookViewRepository = bookViewRepository;
        }

        public async Task RecordViewAsync(Guid bookId, Guid? userId, string? ipAddress, string? userAgent, string? sessionId)
        {
            var bookView = new BookView
            {
                Id = Guid.NewGuid(),
                BookId = bookId,
                UserId = userId,
                ViewedAt = DateTime.UtcNow,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                SessionId = sessionId
            };

            await _bookViewRepository.AddAsync(bookView);
            await _bookViewRepository.SaveChangesAsync();
        }

        public async Task<int> GetViewCountAsync(Guid bookId, DateTime? from = null, DateTime? to = null)
        {
            return await _bookViewRepository.GetViewCountByBookIdAsync(bookId, from, to);
        }

        public async Task<Dictionary<Guid, int>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10)
        {
            return await _bookViewRepository.GetTopViewedBooksAsync(from, to, top);
        }

        public async Task<IEnumerable<BookViewDto>> GetBookViewsAsync(Guid bookId, int pageNumber = 1, int pageSize = 20)
        {
            var views = await _bookViewRepository.GetByBookIdAsync(bookId, pageNumber, pageSize);
            return views.ToDtoList();
        }
    }
}
