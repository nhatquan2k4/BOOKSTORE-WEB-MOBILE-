using BookStore.Application.Dtos.Shipping;

namespace BookStore.Application.IService.Shipping
{
    public interface IShipperService
    {
        // CRUD Operations
        Task<ShipperDto> CreateShipperAsync(CreateShipperDto dto);
        Task<ShipperDto?> GetShipperByIdAsync(Guid id);
        Task<ShipperDetailDto?> GetShipperDetailByIdAsync(Guid id);
        Task<ShipperDto> UpdateShipperAsync(Guid id, UpdateShipperDto dto);
        Task<bool> DeleteShipperAsync(Guid id);

        // Query Operations
        Task<IEnumerable<ShipperDto>> GetAllShippersAsync();
        Task<IEnumerable<ShipperDto>> GetActiveShippersAsync();
        Task<PagedShipperDto> GetPagedShippersAsync(
            int pageNumber,
            int pageSize,
            bool? isActive = null,
            string? searchTerm = null);

        // Business Logic
        Task<bool> ActivateShipperAsync(Guid id);
        Task<bool> DeactivateShipperAsync(Guid id);
        Task<bool> IsPhoneNumberAvailableAsync(string phoneNumber, Guid? excludeShipperId = null);
        Task<bool> IsEmailAvailableAsync(string email, Guid? excludeShipperId = null);
        Task<int> GetShipmentCountAsync(Guid shipperId);
        // Lấy shipper theo user account id
        Task<ShipperDto?> GetShipperByUserIdAsync(Guid userId);
    }
}
