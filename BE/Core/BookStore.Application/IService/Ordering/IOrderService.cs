using BookStore.Application.Dtos.Ordering;

namespace BookStore.Application.IService.Ordering
{
    public interface IOrderService
    {
        // Get Orders
        Task<(List<OrderDto> Items, int TotalCount)> GetAllOrdersAsync(int pageNumber = 1, int pageSize = 10, string? status = null);
        Task<OrderDto?> GetOrderByIdAsync(Guid orderId);
        Task<OrderDto?> GetOrderByOrderNumberAsync(string orderNumber);
        Task<(List<OrderDto> Items, int TotalCount)> GetOrdersByUserIdAsync(Guid userId, string? status = null, int pageNumber = 1, int pageSize = 10);
        
        // Create Order
        Task<OrderDto> CreateOrderAsync(CreateOrderDto dto);
        Task<OrderDto> CreateOrderFromCartAsync(Guid userId, CreateOrderAddressDto address, Guid? couponId = null);
        Task<OrderDto> CreateRentalOrderAsync(Guid userId, Guid bookId, int days);
        
        // Update Order
        Task<OrderDto> UpdateOrderStatusAsync(UpdateOrderStatusDto dto);
        Task<OrderDto> CancelOrderAsync(CancelOrderDto dto);
        Task<OrderDto> ConfirmOrderPaymentAsync(Guid orderId);
        Task<OrderDto> ShipOrderAsync(Guid orderId, string? note = null);
        Task<OrderDto> CompleteOrderAsync(Guid orderId, string? note = null);
        
        // Statistics
        Task<decimal> GetTotalRevenueAsync(DateTime fromDate, DateTime toDate);
        Task<int> GetTotalOrdersCountAsync(string? status = null);
        Task<Dictionary<string, int>> GetOrdersCountByStatusAsync();
        
        // Validation
        Task<bool> IsOrderOwnedByUserAsync(Guid orderId, Guid userId);
        Task<bool> CanCancelOrderAsync(Guid orderId);
        
        // Order Status History
        Task<IEnumerable<OrderStatusLogDto>> GetOrderStatusHistoryAsync(Guid orderId);

        Task ConfirmPaymentAsync(string orderId, decimal amountPaid);
    }
}
