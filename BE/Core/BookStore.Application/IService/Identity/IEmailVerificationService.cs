namespace BookStore.Application.IService.Identity
{
    public interface IEmailVerificationService
    {
        Task<string> GenerateVerificationTokenAsync(Guid userId);
        Task<bool> VerifyEmailAsync(string token);
        Task<bool> ResendVerificationEmailAsync(string email);
        Task<bool> IsEmailVerifiedAsync(Guid userId);
    }
}
