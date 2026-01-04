using System;

namespace BookStore.Domain.ValueObjects
{

    public readonly struct OrderId
    {
        public Guid Value { get; }

        public OrderId(Guid value)
        {
            Value = value;
        }

        public static OrderId New() => new OrderId(Guid.NewGuid());

        public override string ToString() => Value.ToString();

        public static implicit operator Guid(OrderId id) => id.Value;
        public static implicit operator OrderId(Guid id) => new OrderId(id);
    }
}
