using BookStore.Domain.Entities.Rental;

namespace BookStore.Domain.IRepository.Rental
{
    public interface IBookRentalRepository : IGenericRepository<BookRental>
    {

        Task<IEnumerable<BookRental>> GetByUserIdAsync(Guid userId, bool includeExpired = false);


        Task<IEnumerable<BookRental>> GetByBookIdAsync(Guid bookId);


        Task<BookRental?> GetActiveRentalAsync(Guid userId, Guid bookId);


        Task<BookRental?> GetDetailByIdAsync(Guid id);

        Task<IEnumerable<BookRental>> GetExpiredRentalsAsync();

        Task<bool> HasActiveRentalAsync(Guid userId, Guid bookId);


        Task<Dictionary<string, int>> GetRentalCountByStatusAsync();
    }
}
