using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BookStore.API.Hubs
{
    [Authorize] // Chỉ user đăng nhập mới kết nối được Hub
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