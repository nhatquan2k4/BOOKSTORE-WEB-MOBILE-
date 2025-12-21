using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BookStore.API.Hubs
{
    [AllowAnonymous] // ✅ Cho phép kết nối không cần token (để nhận thông báo thanh toán)
    public class NotificationHub : Hub
    {
        // Khi user kết nối, hàm này chạy
        public override async Task OnConnectedAsync()
        {
            // Có thể map ConnectionId với UserId tại đây nếu cần
            await base.OnConnectedAsync();
        }

        // Hàm này để Client (Frontend) gọi lên Server (nếu cần)
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}