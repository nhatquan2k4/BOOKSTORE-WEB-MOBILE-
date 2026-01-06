using BookStore.Domain.Entities.Shipping;

namespace BookStore.Domain.IRepository.Shipping
{
    public interface IShipperRepository : IGenericRepository<Shipper>
    {
        // Lấy shipper theo phone number
        Task<Shipper?> GetByPhoneNumberAsync(string phoneNumber);

        // Lấy shipper theo email
        Task<Shipper?> GetByEmailAsync(string email);

        // Lấy tất cả shipper đang active
        Task<IEnumerable<Shipper>> GetActiveShippersAsync();

        // Lấy shipper kèm shipments
        Task<Shipper?> GetShipperWithShipmentsAsync(Guid shipperId);

        // Kiểm tra phone number đã tồn tại chưa
        Task<bool> IsPhoneNumberExistsAsync(string phoneNumber, Guid? excludeShipperId = null);

        // Kiểm tra email đã tồn tại chưa
        Task<bool> IsEmailExistsAsync(string email, Guid? excludeShipperId = null);

        // Lấy danh sách shipper với pagination
        Task<(IEnumerable<Shipper> Items, int TotalCount)> GetPagedShippersAsync(
            int pageNumber,
            int pageSize,
            bool? isActive = null,
            string? searchTerm = null);

        // Lấy shipper theo user account id (liên kết UserId trên entity)
        Task<Shipper?> GetByUserIdAsync(Guid userId);

        // Đếm số shipment của một shipper
        Task<int> GetShipmentCountAsync(Guid shipperId);

        // Activate/Deactivate shipper
        Task SetShipperStatusAsync(Guid shipperId, bool isActive);
    }
}
