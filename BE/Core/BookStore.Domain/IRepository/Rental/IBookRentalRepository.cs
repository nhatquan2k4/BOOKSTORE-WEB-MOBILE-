using BookStore.Domain.Entities.Rental;

namespace BookStore.Domain.IRepository.Rental
{
    public interface IBookRentalRepository : IGenericRepository<BookRental>
    {
        /// <summary>
        /// Lấy các rental của user (có filter expired)
        /// </summary>
        Task<IEnumerable<BookRental>> GetByUserIdAsync(Guid userId, bool includeExpired = false);

        /// <summary>
        /// Lấy các rental của 1 quyển sách
        /// </summary>
        Task<IEnumerable<BookRental>> GetByBookIdAsync(Guid bookId);

        /// <summary>
        /// Lấy rental đang active của user cho 1 quyển sách cụ thể
        /// </summary>
        Task<BookRental?> GetActiveRentalAsync(Guid userId, Guid bookId);

        /// <summary>
        /// Lấy chi tiết rental (kèm related data)
        /// </summary>
        Task<BookRental?> GetDetailByIdAsync(Guid id);

        /// <summary>
        /// Lấy các rental hết hạn nhưng chưa update status
        /// </summary>
        Task<IEnumerable<BookRental>> GetExpiredRentalsAsync();

        /// <summary>
        /// Kiểm tra user đã thuê sách này chưa (đang active)
        /// </summary>
        Task<bool> HasActiveRentalAsync(Guid userId, Guid bookId);

        /// <summary>
        /// Đếm số lượt thuê theo status
        /// </summary>
        Task<Dictionary<string, int>> GetRentalCountByStatusAsync();
    }
}
