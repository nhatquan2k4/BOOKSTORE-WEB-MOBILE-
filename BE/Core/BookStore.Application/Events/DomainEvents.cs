namespace BookStore.Application.Events
{
    public interface IEventMessage
    {
        Guid EventId { get; }
        DateTime OccurredAt { get; }
        string EventType { get; }
    }

    public class UserRegisteredEvent : IEventMessage
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
        public string EventType => "UserRegistered";

        public Guid UserId { get; set; }
        public string Email { get; set; } = null!;
        public string UserName { get; set; } = null!;
    }

    public class OrderCreatedEvent : IEventMessage
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
        public string EventType => "OrderCreated";

        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string UserName { get; set; } = null!;
    }

    public class OrderShippedEvent : IEventMessage
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
        public string EventType => "OrderShipped";

        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string TrackingNumber { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string UserName { get; set; } = null!;
    }

    public class OrderDeliveredEvent : IEventMessage
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
        public string EventType => "OrderDelivered";

        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string UserName { get; set; } = null!;
    }

    public class OrderPaidEvent : IEventMessage
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
        public string EventType => "OrderPaid";

        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public string UserName { get; set; } = null!;
    }
}
