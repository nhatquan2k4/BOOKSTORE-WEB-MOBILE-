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
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            switch (eventMessage)
            {
                case UserRegisteredEvent userEvent:
                    await HandleUserRegisteredAsync(userEvent, notificationService, emailService);
                    break;

                case OrderCreatedEvent orderEvent:
                    await HandleOrderCreatedAsync(orderEvent, notificationService, emailService);
                    break;

                case OrderShippedEvent shippedEvent:
                    await HandleOrderShippedAsync(shippedEvent, notificationService, emailService);
                    break;

                case OrderDeliveredEvent deliveredEvent:
                    await HandleOrderDeliveredAsync(deliveredEvent, notificationService, emailService);
                    break;

                case OrderPaidEvent paidEvent:
                    await HandleOrderPaidAsync(paidEvent, notificationService, emailService);
                    break;

                default:
                    _logger.LogWarning("Unknown event type: {EventType}", eventMessage.EventType);
                    break;
            }
        }

        private async Task HandleUserRegisteredAsync(
            UserRegisteredEvent eventData,
            INotificationService notificationService,
            IEmailService emailService)
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

            // Send welcome email
            try
            {
                await emailService.SendWelcomeEmailAsync(eventData.Email, eventData.UserName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", eventData.Email);
            }
        }

        private async Task HandleOrderCreatedAsync(
            OrderCreatedEvent eventData,
            INotificationService notificationService,
            IEmailService emailService)
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

            // Send order confirmation email
            try
            {
                await emailService.SendOrderConfirmationEmailAsync(
                    eventData.UserEmail,
                    eventData.UserName,
                    eventData.OrderNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send order confirmation email for order {OrderNumber}", 
                    eventData.OrderNumber);
            }
        }

        private async Task HandleOrderShippedAsync(
            OrderShippedEvent eventData,
            INotificationService notificationService,
            IEmailService emailService)
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

            // Send shipped email
            try
            {
                await emailService.SendOrderShippedEmailAsync(
                    eventData.UserEmail,
                    eventData.UserName,
                    eventData.OrderNumber,
                    eventData.TrackingNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send order shipped email for order {OrderNumber}", 
                    eventData.OrderNumber);
            }
        }

        private async Task HandleOrderDeliveredAsync(
            OrderDeliveredEvent eventData,
            INotificationService notificationService,
            IEmailService emailService)
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

            // Send delivered email
            try
            {
                await emailService.SendOrderDeliveredEmailAsync(
                    eventData.UserEmail,
                    eventData.UserName,
                    eventData.OrderNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send order delivered email for order {OrderNumber}", 
                    eventData.OrderNumber);
            }
        }

        private async Task HandleOrderPaidAsync(
            OrderPaidEvent eventData,
            INotificationService notificationService,
            IEmailService emailService)
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
