namespace BookStore.Application.IService.Identity
{
    public interface IEmailService
    {
        Task SendEmailVerificationAsync(string toEmail, string userName, string verificationToken, string verificationUrl);
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken, string resetUrl);
        Task SendWelcomeEmailAsync(string toEmail, string userName);
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
