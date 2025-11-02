using System;

namespace BookStore.Domain.ValueObjects
{
    /// <summary>
    /// Bao bọc Guid để sau này nếu em muốn đổi sang Snowflake, ULID... thì chỉ đổi ở đây.
    /// Entity hiện tại vẫn dùng Guid bình thường.
    /// </summary>
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
