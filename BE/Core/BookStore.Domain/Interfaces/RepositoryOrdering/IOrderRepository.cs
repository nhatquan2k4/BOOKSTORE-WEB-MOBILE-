using BookStore.Domain.Entities.Ordering;

namespace BookStore.Domain.Interfaces.RepositoryOrdering
{
    /// <summary>
    /// Repository interface cho Order entity
    /// Định nghĩa các operations cần thiết để thao tác với Order trong database
    /// </summary>
    public interface IOrderRepository
    {
        /// <summary>
        /// Lấy Order theo ID với đầy đủ thông tin liên quan (Items, Payment, Address)
        /// </summary>
        Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);

        /// <summary>
        /// Lấy Order theo OrderNumber (mã đơn hàng hiển thị cho khách)
        /// </summary>
        Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default);

        /// <summary>
        /// Lấy tất cả Orders của một User, sắp xếp theo ngày tạo mới nhất
        /// </summary>
        Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);

        /// <summary>
        /// Thêm Order mới vào database
        /// </summary>
        Task AddAsync(Order order, CancellationToken ct = default);

        /// <summary>
        /// Cập nhật thông tin Order (status, payment info, etc.)
        /// </summary>
        Task UpdateAsync(Order order, CancellationToken ct = default);

        /// <summary>
        /// Xóa Order theo ID (soft delete nên cân nhắc)
        /// </summary>
        Task DeleteAsync(Guid id, CancellationToken ct = default);

        /// <summary>
        /// Kiểm tra Order có tồn tại không
        /// </summary>
        Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);

        /// <summary>
        /// Đếm số lượng Orders của một User
        /// </summary>
        Task<int> CountByUserIdAsync(Guid userId, CancellationToken ct = default);
    }
}
