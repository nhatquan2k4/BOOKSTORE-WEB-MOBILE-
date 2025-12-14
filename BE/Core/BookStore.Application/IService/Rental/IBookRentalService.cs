using BookStore.Application.Dtos.Rental;

namespace BookStore.Application.IService.Rental
{
    public interface IBookRentalService
    {
        /// <summary>
        /// User thuê 1 quyển sách
        /// </summary>
        Task<BookRentalResultDto> RentBookAsync(Guid userId, CreateBookRentalDto dto);

        /// <summary>
        /// Lấy danh sách sách user đang thuê
        /// </summary>
        Task<IEnumerable<BookRentalDto>> GetMyRentalsAsync(Guid userId, bool includeExpired = false);

        /// <summary>
        /// Lấy chi tiết lượt thuê theo ID
        /// </summary>
        Task<BookRentalDto?> GetRentalByIdAsync(Guid rentalId);

        /// <summary>
        /// Gia hạn lượt thuê
        /// </summary>
        Task<BookRentalResultDto> RenewRentalAsync(Guid userId, Guid rentalId, RenewBookRentalDto dto);

        /// <summary>
        /// Trả sách sớm (hủy lượt thuê)
        /// </summary>
        Task<bool> ReturnBookAsync(Guid userId, Guid rentalId);

        /// <summary>
        /// Kiểm tra user có quyền đọc sách này không (thông qua rental)
        /// </summary>
        Task<CheckBookAccessDto> CheckBookAccessAsync(Guid userId, Guid bookId);

        /// <summary>
        /// Lấy pre-signed URL để đọc sách đã thuê
        /// </summary>
        Task<EbookAccessDto> GetRentalAccessLinkAsync(Guid userId, Guid bookId);

        /// <summary>
        /// Admin: Lấy tất cả rentals
        /// </summary>
        Task<IEnumerable<BookRentalDto>> GetAllRentalsAsync();

        /// <summary>
        /// Admin: Lấy rentals theo user
        /// </summary>
        Task<IEnumerable<BookRentalDto>> GetRentalsByUserAsync(Guid userId);

        /// <summary>
        /// Admin: Lấy rentals theo sách
        /// </summary>
        Task<IEnumerable<BookRentalDto>> GetRentalsByBookAsync(Guid bookId);

        /// <summary>
        /// Admin: Hủy rental
        /// </summary>
        Task CancelRentalAsync(Guid rentalId);

        /// <summary>
        /// Background job: Cập nhật các rental hết hạn
        /// </summary>
        Task UpdateExpiredRentalsAsync();
    }
}
