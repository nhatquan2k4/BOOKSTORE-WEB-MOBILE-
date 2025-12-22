using BookStore.API.Hubs;
using BookStore.Application.IService.System;
using Microsoft.AspNetCore.SignalR;

namespace BookStore.API.Services
{
    public class SignalRService : ISignalRService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SignalRService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendPaymentStatusAsync(string orderId, string status)
        {
            await _hubContext.Clients.All.SendAsync("ReceivePaymentStatus", orderId, status);
        }
    }
}