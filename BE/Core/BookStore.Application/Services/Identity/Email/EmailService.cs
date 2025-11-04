using BookStore.Application.IService.Identity.Email;
using BookStore.Application.Settings;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace BookStore.Application.Services.Identity.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendEmailVerificationAsync(string toEmail, string userName, string verificationToken, string verificationUrl)
        {
            var subject = "Xác minh địa chỉ email của bạn - BookStore";
            
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
        .token {{ background-color: #fff; padding: 10px; border: 1px solid #ddd; font-family: monospace; word-break: break-all; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📚 BookStore</h1>
        </div>
        <div class='content'>
            <h2>Xin chào {userName}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại BookStore. Để hoàn tất quá trình đăng ký, vui lòng xác minh địa chỉ email của bạn.</p>
            
            <p><strong>Nhấn vào nút bên dưới để xác minh email:</strong></p>
            <div style='text-align: center;'>
                <a href='{verificationUrl}' class='button'>Xác minh Email</a>
            </div>
            
            <p>Hoặc sao chép và dán mã xác minh sau vào trang xác minh:</p>
            <div class='token'>{verificationToken}</div>
            
            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Mã xác minh này có hiệu lực trong <strong>24 giờ</strong></li>
                <li>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này</li>
                <li>Link xác minh chỉ có thể sử dụng một lần</li>
            </ul>
        </div>
        <div class='footer'>
            <p>© 2024 BookStore. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken, string resetUrl)
        {
            var subject = "Yêu cầu đặt lại mật khẩu - BookStore";
            
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #FF5722; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #FF5722; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 Đặt lại mật khẩu</h1>
        </div>
        <div class='content'>
            <h2>Xin chào {userName}!</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            
            <div style='text-align: center;'>
                <a href='{resetUrl}' class='button'>Đặt lại mật khẩu</a>
            </div>
            
            <p><strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
        <div class='footer'>
            <p>© 2024 BookStore. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName)
        {
            var subject = "Chào mừng đến với BookStore!";
            
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #2196F3; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Chào mừng đến với BookStore!</h1>
        </div>
        <div class='content'>
            <h2>Xin chào {userName}!</h2>
            <p>Cảm ơn bạn đã xác minh email và hoàn tất đăng ký tài khoản.</p>
            <p>Bây giờ bạn có thể:</p>
            <ul>
                <li>📚 Khám phá hàng ngàn đầu sách</li>
                <li>🛒 Mua sắm trực tuyến dễ dàng</li>
                <li>📦 Theo dõi đơn hàng của bạn</li>
                <li>⭐ Đánh giá và nhận xét sách</li>
            </ul>
            <p>Chúc bạn có trải nghiệm tuyệt vời!</p>
        </div>
        <div class='footer'>
            <p>© 2024 BookStore. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                using var smtpClient = new SmtpClient(_emailSettings.SmtpHost, _emailSettings.SmtpPort)
                {
                    Credentials = new NetworkCredential(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword),
                    EnableSsl = _emailSettings.EnableSsl
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                // Log error
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }
    }
}
