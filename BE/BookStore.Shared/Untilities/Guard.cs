using BookStore.Shared.Exceptions;

namespace BookStore.Shared.Utilities;

public static class Guard
{
    public static void AgainstNullOrWhiteSpace(string? value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                [fieldName] = new[] { $"{fieldName} không được để trống." }
            });
    }

    public static void Against(bool condition, string message, int statusCode = 400)
    {
        if (condition)
            throw new UserFriendlyException(message, statusCode);
    }
}
