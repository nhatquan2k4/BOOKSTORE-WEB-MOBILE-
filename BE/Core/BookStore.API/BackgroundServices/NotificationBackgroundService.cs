using BookStore.Application.DTOs.System.Notification;
using BookStore.Application.Events;
using BookStore.Application.IService.System;
using BookStore.Application.Services.System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BookStore.API.BackgroundServices
{
    public class NotificationBackgroundService : BackgroundService
    {
        private readonly IEventBus _eventBus;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<NotificationBackgroundService> _logger;

        public NotificationBackgroundService(
            IEventBus eventBus,
            IServiceProvider serviceProvider,
            ILogger<NotificationBackgroundService> logger)
        {
            _eventBus = eventBus;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Notification Background Service started");

            await foreach (var eventMessage in _eventBus.Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    await ProcessEventAsync(eventMessage);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing event {EventType}", eventMessage.EventType);
                }
            }

            _logger.LogInformation("Notification Background Service stopped");
        }

        private async Task ProcessEventAsync(IEventMessage eventMessage)
        {
            using var scope = _serviceProvider.CreateScope();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
            // TODO: Add email service later
            // var emailService = scope.ServiceProvider.GetRequiredService<Identity.IEmailService>();

            switch (eventMessage)
            {
                case UserRegisteredEvent userEvent:
                    await HandleUserRegisteredAsync(userEvent, notificationService, null);
                    break;

                case OrderCreatedEvent orderEvent:
                    await HandleOrderCreatedAsync(orderEvent, notificationService, null);
                    break;

                case OrderShippedEvent shippedEvent:
                    await HandleOrderShippedAsync(shippedEvent, notificationService, null);
                    break;

                case OrderDeliveredEvent deliveredEvent:
                    await HandleOrderDeliveredAsync(deliveredEvent, notificationService, null);
                    break;

                case OrderPaidEvent paidEvent:
                    await HandleOrderPaidAsync(paidEvent, notificationService, null);
                    break;

                default:
                    _logger.LogWarning("Unknown event type: {EventType}", eventMessage.EventType);
                    break;
            }
        }

        private async Task HandleUserRegisteredAsync(
            UserRegisteredEvent eventData,
            INotificationService notificationService,
            object? emailService)
        {
            _logger.LogInformation("Processing UserRegistered event for user {UserId}", eventData.UserId);

            // Create notification
            await notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = eventData.UserId,
                Title = "Welcome to BookStore!",
                Message = $"Hi {eventData.UserName}, welcome to our bookstore! Start exploring our collection.",
                Type = "System",
                Link = "/books"
            });

            // TODO: Send welcome email when email service is integrated
            // if (emailService != null)
            // {
            //     await emailService.SendWelcomeEmailAsync(eventData.Email, eventData.UserName);
            // }
        }

        private async Task HandleOrderCreatedAsync(
            OrderCreatedEvent eventData,
            INotificationService notificationService,
            object? emailService)
        {
            _logger.LogInformation("Processing OrderCreated event for order {OrderNumber}", eventData.OrderNumber);

            // Create notification
            await notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = eventData.UserId,
                Title = "Order Confirmed",
                Message = $"Your order {eventData.OrderNumber} has been confirmed and is being processed.",
                Type = "Order",
                Link = $"/orders/{eventData.OrderId}"
            });
        }

        private async Task HandleOrderShippedAsync(
            OrderShippedEvent eventData,
            INotificationService notificationService,
            object? emailService)
        {
            _logger.LogInformation("Processing OrderShipped event for order {OrderNumber}", eventData.OrderNumber);

            // Create notification
            await notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = eventData.UserId,
                Title = "Order Shipped",
                Message = $"Your order {eventData.OrderNumber} has been shipped! Tracking: {eventData.TrackingNumber}",
                Type = "Order",
                Link = $"/orders/{eventData.OrderId}"
            });
        }

        private async Task HandleOrderDeliveredAsync(
            OrderDeliveredEvent eventData,
            INotificationService notificationService,
            object? emailService)
        {
            _logger.LogInformation("Processing OrderDelivered event for order {OrderNumber}", eventData.OrderNumber);

            // Create notification
            await notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = eventData.UserId,
                Title = "Order Delivered",
                Message = $"Your order {eventData.OrderNumber} has been delivered! Enjoy your books!",
                Type = "Order",
                Link = $"/orders/{eventData.OrderId}"
            });
        }

        private async Task HandleOrderPaidAsync(
            OrderPaidEvent eventData,
            INotificationService notificationService,
            object? emailService)
        {
            _logger.LogInformation("Processing OrderPaid event for order {OrderNumber}", eventData.OrderNumber);

            // Create notification
            await notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = eventData.UserId,
                Title = "Payment Successful",
                Message = $"Payment for order {eventData.OrderNumber} has been confirmed. Your order is being prepared for shipping.",
                Type = "Order",
                Link = $"/orders/{eventData.OrderId}"
            });
        }
    }
}
