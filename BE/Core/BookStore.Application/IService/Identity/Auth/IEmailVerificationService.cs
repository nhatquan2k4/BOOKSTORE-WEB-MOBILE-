namespace BookStore.Application.IService.Identity.Auth
{
    public interface IEmailVerificationService
    {
        Task<string> GenerateEmailVerificationTokenAsync(Guid userId);
        Task<bool> VerifyEmailAsync(string token);
        Task<bool> ResendVerificationEmailAsync(string email);
        Task<bool> IsEmailVerifiedAsync(Guid userId);
    }
}
