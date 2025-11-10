namespace BookStore.Application.Dtos.Ordering
{
    public class UpdateOrderDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public Guid OrderId { get; set; }
        public string NewStatus { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class CancelOrderDto
    {
        public Guid OrderId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
