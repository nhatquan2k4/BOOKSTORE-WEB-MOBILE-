namespace BookStore.Domain.ValueObjects
{
    public class Money
    {
        public decimal Amount { get; private set; }
        private Money() { }
        public Money(decimal amount)
        {
            if (amount < 0)
                throw new ArgumentException("Số tiền không được nhỏ hơn 0");
            Amount = Math.Round(amount, 0);
        }

        public Money Add(Money other)
        {
            return new Money(Amount + other.Amount);
        }

        public Money Subtract(Money other)
        {
            return new Money(Amount - other.Amount);
        }
        public Money ApplyDiscount(decimal percentage)
        {
            if (percentage < 0 || percentage > 100)
                throw new ArgumentException("Phần trăm phải từ 0 đến 100");

            decimal discountAmount = Amount * (percentage / 100);
            return new Money(Amount - discountAmount);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Money other) return false;
            return Amount == other.Amount;
        }

        public override int GetHashCode() => Amount.GetHashCode();

        public override string ToString() => $"{Amount:N0} ₫";

        public static Money Zero() => new Money(0);

    }
}