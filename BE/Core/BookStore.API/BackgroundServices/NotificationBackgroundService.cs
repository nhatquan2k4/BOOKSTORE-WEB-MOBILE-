using BookStore.API.Hubs;
using BookStore.Application.Dtos.System.Notification; 
using BookStore.Application.IService.System;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BookStore.API.BackgroundServices
{
    public class NotificationBackgroundService : BackgroundService
    {
        private readonly ILogger<NotificationBackgroundService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationBackgroundService(
            ILogger<NotificationBackgroundService> logger,
            IServiceProvider serviceProvider,
            IHubContext<NotificationHub> hubContext)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Notification Background Service started.");

            // Loop vô hạn để giữ service chạy ngầm
            while (!stoppingToken.IsCancellationRequested)
            {
                // Ví dụ: Mỗi 5 phút dọn dẹp thông báo cũ hoặc gửi ping
                // await CleanupOldNotifications();
                
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }

            _logger.LogInformation("Notification Background Service stopped.");
        }

        // Hàm này có thể được gọi từ các Service khác thông qua DI nếu cần
        public async Task SendRealtimeNotification(Guid userId, NotificationDto notification)
        {
            try 
            {
                await _hubContext.Clients.User(userId.ToString())
                    .SendAsync("ReceiveNotification", notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending SignalR notification to user {UserId}", userId);
            }
        }
    }
}