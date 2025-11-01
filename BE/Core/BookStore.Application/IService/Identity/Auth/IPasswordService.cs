namespace BookStore.Application.IService.Identity.Auth
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
        string GenerateRandomPassword(int length = 12);
        bool ValidatePasswordStrength(string password);
    }
}
