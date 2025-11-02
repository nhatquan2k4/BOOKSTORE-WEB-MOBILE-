namespace BookStore.Domain.Enums
{
    /// <summary>
    /// Trạng thái của PaymentTransaction.Status (string)
    /// </summary>
    public static class PaymentStatus
    {
        public const string Pending = "Pending";
        public const string Authorized = "Authorized";     // intent thành công
        public const string Captured = "Captured";         // trừ tiền thành công
        public const string Failed = "Failed";
        public const string Refunded = "Refunded";
    }
}
