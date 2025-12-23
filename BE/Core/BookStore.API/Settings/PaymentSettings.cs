namespace BookStore.API.Settings
{
    public class PaymentSettings
    {
        public VietQRSettings VietQR { get; set; } = new();
    }

    public class VietQRSettings
    {
        public string BankCode { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string Template { get; set; } = "compact";
    }
}
