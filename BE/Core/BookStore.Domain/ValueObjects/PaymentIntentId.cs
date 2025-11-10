namespace BookStore.Domain.ValueObjects
{
    /// <summary>
    /// Id của payment intent từ cổng thanh toán (VNPay/MoMo/Stripe...).
    /// Thường là string nên mình để string luôn.
    /// </summary>
    public readonly struct PaymentIntentId
    {
        public string Value { get; }

        public PaymentIntentId(string value)
        {
            Value = value;
        }

        public override string ToString() => Value;

        public static implicit operator string(PaymentIntentId id) => id.Value;
        public static implicit operator PaymentIntentId(string value) => new PaymentIntentId(value);
    }
}
