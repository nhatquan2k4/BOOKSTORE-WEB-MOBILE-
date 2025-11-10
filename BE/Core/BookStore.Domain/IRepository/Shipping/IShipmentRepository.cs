using BookStore.Domain.Entities.Shipping;

namespace BookStore.Domain.IRepository.Shipping
{
    public interface IShipmentRepository : IGenericRepository<Shipment>
    {
        Task<Shipment?> GetByTrackingCodeAsync(string trackingCode);
        Task<Shipment?> GetByOrderIdAsync(Guid orderId);
        Task<IEnumerable<Shipment>> GetByShipperIdAsync(Guid shipperId);
        Task<IEnumerable<Shipment>> GetByStatusAsync(string status);
        Task<Shipment?> GetWithDetailsAsync(Guid id);
        Task<string> GenerateTrackingCodeAsync();
    }
}
