namespace BookStore.Application.Settings
{
    public class EmailSettings
    {
        public string SmtpHost { get; set; } = null!;
        public int SmtpPort { get; set; }
        public string SmtpUsername { get; set; } = null!;
        public string SmtpPassword { get; set; } = null!;
        public string FromEmail { get; set; } = null!;
        public string FromName { get; set; } = null!;
        public bool EnableSsl { get; set; } = true;
        public int TokenExpirationHours { get; set; } = 24;
        public string FrontendUrl { get; set; } = "http://localhost:3000";
    }
}
