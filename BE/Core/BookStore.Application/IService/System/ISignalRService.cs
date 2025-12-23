namespace BookStore.Application.IService.System
{
    public interface ISignalRService
    {
        Task SendPaymentStatusAsync(string orderId, string status);
    }
}