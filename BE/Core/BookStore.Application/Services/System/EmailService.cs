using BookStore.Application.DTOs.System.Email;
using BookStore.Application.IService.System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace BookStore.Application.Services.System
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _logger = logger;
            _emailSettings = new EmailSettings
            {
                SmtpServer = configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com",
                SmtpPort = int.Parse(configuration["EmailSettings:SmtpPort"] ?? "587"),
                SenderName = configuration["EmailSettings:SenderName"] ?? "BookStore",
                SenderEmail = configuration["EmailSettings:SenderEmail"] ?? "noreply@bookstore.com",
                Username = configuration["EmailSettings:Username"] ?? "",
                Password = configuration["EmailSettings:Password"] ?? "",
                EnableSsl = bool.Parse(configuration["EmailSettings:EnableSsl"] ?? "true")
            };
        }

        public async Task SendEmailAsync(EmailMessage emailMessage)
        {
            try
            {
                using var smtpClient = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
                {
                    EnableSsl = _emailSettings.EnableSsl,
                    Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                    Subject = emailMessage.Subject,
                    Body = emailMessage.Body,
                    IsBodyHtml = emailMessage.IsHtml
                };

                mailMessage.To.Add(emailMessage.To);

                await smtpClient.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {To}", emailMessage.To);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", emailMessage.To);
                throw;
            }
        }

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            var emailMessage = new EmailMessage
            {
                To = to,
                Subject = subject,
                Body = body,
                IsHtml = isHtml
            };

            await SendEmailAsync(emailMessage);
        }

        public async Task SendWelcomeEmailAsync(string userEmail, string userName)
        {
            var subject = "Welcome to BookStore!";
            var body = $@"
                <html>
                <body>
                    <h2>Welcome {userName}!</h2>
                    <p>Thank you for registering with BookStore.</p>
                    <p>We're excited to have you as part of our community.</p>
                    <p>Start exploring our collection of books and enjoy reading!</p>
                    <br/>
                    <p>Best regards,<br/>BookStore Team</p>
                </body>
                </html>";

            await SendEmailAsync(userEmail, subject, body);
        }

        public async Task SendOrderConfirmationEmailAsync(string userEmail, string userName, string orderNumber)
        {
            var subject = $"Order Confirmation - {orderNumber}";
            var body = $@"
                <html>
                <body>
                    <h2>Order Confirmed!</h2>
                    <p>Hi {userName},</p>
                    <p>Your order <strong>{orderNumber}</strong> has been confirmed and is being processed.</p>
                    <p>We'll notify you when your order is shipped.</p>
                    <br/>
                    <p>Thank you for shopping with BookStore!</p>
                    <p>Best regards,<br/>BookStore Team</p>
                </body>
                </html>";

            await SendEmailAsync(userEmail, subject, body);
        }

        public async Task SendOrderShippedEmailAsync(string userEmail, string userName, string orderNumber, string trackingNumber)
        {
            var subject = $"Order Shipped - {orderNumber}";
            var body = $@"
                <html>
                <body>
                    <h2>Your Order Has Been Shipped!</h2>
                    <p>Hi {userName},</p>
                    <p>Good news! Your order <strong>{orderNumber}</strong> has been shipped.</p>
                    <p>Tracking Number: <strong>{trackingNumber}</strong></p>
                    <p>Your package is on its way and should arrive soon.</p>
                    <br/>
                    <p>Thank you for shopping with BookStore!</p>
                    <p>Best regards,<br/>BookStore Team</p>
                </body>
                </html>";

            await SendEmailAsync(userEmail, subject, body);
        }

        public async Task SendOrderDeliveredEmailAsync(string userEmail, string userName, string orderNumber)
        {
            var subject = $"Order Delivered - {orderNumber}";
            var body = $@"
                <html>
                <body>
                    <h2>Your Order Has Been Delivered!</h2>
                    <p>Hi {userName},</p>
                    <p>Your order <strong>{orderNumber}</strong> has been successfully delivered.</p>
                    <p>We hope you enjoy your purchase!</p>
                    <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
                    <br/>
                    <p>Thank you for shopping with BookStore!</p>
                    <p>Best regards,<br/>BookStore Team</p>
                </body>
                </html>";

            await SendEmailAsync(userEmail, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string userEmail, string resetToken)
        {
            var subject = "Password Reset Request";
            var resetLink = $"https://bookstore.com/reset-password?token={resetToken}";
            var body = $@"
                <html>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password.</p>
                    <p>Click the link below to reset your password:</p>
                    <p><a href='{resetLink}'>Reset Password</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br/>
                    <p>Best regards,<br/>BookStore Team</p>
                </body>
                </html>";

            await SendEmailAsync(userEmail, subject, body);
        }
    }
}
