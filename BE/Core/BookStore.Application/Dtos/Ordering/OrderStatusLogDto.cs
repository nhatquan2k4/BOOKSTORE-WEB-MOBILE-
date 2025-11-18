namespace BookStore.Application.Dtos.Ordering
{
    /// <summary>
    /// DTO cho lịch sử thay đổi trạng thái đơn hàng
    /// </summary>
    public class OrderStatusLogDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string OldStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public string? ChangedBy { get; set; }
    }

    /// <summary>
    /// DTO để tạo log khi thay đổi trạng thái đơn hàng
    /// </summary>
    public class CreateOrderStatusLogDto
    {
        public Guid OrderId { get; set; }
        public string OldStatus { get; set; } = string.Empty;
        public string NewStatus { get; set; } = string.Empty;
        public string? ChangedBy { get; set; }
    }
}
