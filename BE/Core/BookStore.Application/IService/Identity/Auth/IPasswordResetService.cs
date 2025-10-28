namespace BookStore.Application.IService.Identity.Auth
{
    public interface IPasswordResetService
    {
        Task<string> GeneratePasswordResetTokenAsync(string email);
        Task<bool> ValidatePasswordResetTokenAsync(string email, string token);
        Task<bool> ResetPasswordWithTokenAsync(string email, string token, string newPassword);
        Task InvalidateAllPasswordResetTokensAsync(string email);
    }
}
