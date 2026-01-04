namespace BookStore.Domain.Enums
{
    public static class OrderStatus
    {
        public const string Pending = "Pending";           // tạo đơn xong
        public const string AwaitingPayment = "AwaitingPayment";
        public const string Paid = "Paid";
        public const string Shipped = "Shipped";           // hoặc "Fulfillment"
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";

        public static bool IsFinal(string status)
        {
            return status == Completed || status == Cancelled;
        }
    }
}
