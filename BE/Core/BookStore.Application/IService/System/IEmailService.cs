using BookStore.Application.DTOs.System.Email;

namespace BookStore.Application.IService.System
{
    public interface IEmailService
    {
        Task SendEmailAsync(EmailMessage emailMessage);
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task SendWelcomeEmailAsync(string userEmail, string userName);
        Task SendOrderConfirmationEmailAsync(string userEmail, string userName, string orderNumber);
        Task SendOrderShippedEmailAsync(string userEmail, string userName, string orderNumber, string trackingNumber);
        Task SendOrderDeliveredEmailAsync(string userEmail, string userName, string orderNumber);
        Task SendPasswordResetEmailAsync(string userEmail, string resetToken);
    }
}
