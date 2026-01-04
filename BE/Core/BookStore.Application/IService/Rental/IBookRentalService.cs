using BookStore.Application.Dtos.Rental;

namespace BookStore.Application.IService.Rental
{
    public interface IBookRentalService
    {
        Task<BookRentalResultDto> RentBookAsync(Guid userId, CreateBookRentalDto dto);

        Task<IEnumerable<BookRentalDto>> GetMyRentalsAsync(Guid userId, bool includeExpired = false);

        Task<BookRentalDto?> GetRentalByIdAsync(Guid rentalId);

        Task<BookRentalResultDto> RenewRentalAsync(Guid userId, Guid rentalId, RenewBookRentalDto dto);
        Task<bool> ReturnBookAsync(Guid userId, Guid rentalId);
        Task<CheckBookAccessDto> CheckBookAccessAsync(Guid userId, Guid bookId);

        Task<EbookAccessDto> GetRentalAccessLinkAsync(Guid userId, Guid bookId);

        Task<IEnumerable<BookRentalDto>> GetAllRentalsAsync();

        Task<IEnumerable<BookRentalDto>> GetRentalsByUserAsync(Guid userId);

        Task<IEnumerable<BookRentalDto>> GetRentalsByBookAsync(Guid bookId);

        Task CancelRentalAsync(Guid rentalId);
        Task UpdateExpiredRentalsAsync();
    }
}
