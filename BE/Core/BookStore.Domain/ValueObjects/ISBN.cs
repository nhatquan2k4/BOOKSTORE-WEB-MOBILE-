namespace BookStore.Domain.ValueObjects
{
    public class ISBN
    {
        public string Value { get; private set; } = string.Empty;

        private ISBN() { } // For EF Core

        public ISBN(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("ISBN không được để trống");

            var cleaned = CleanISBN(value);

            if (!IsValidISBN(cleaned))
                throw new ArgumentException($"ISBN không hợp lệ: {value}");

            Value = cleaned;
        }

        private static string CleanISBN(string isbn)
        {
            return isbn.Replace("-", "").Replace(" ", "").ToUpperInvariant();
        }

        private static bool IsValidISBN(string isbn)
        {
            if (isbn.Length == 10)
                return ValidateISBN10(isbn);
            if (isbn.Length == 13)
                return ValidateISBN13(isbn);
            return false;
        }

        private static bool ValidateISBN10(string isbn)
        {
            int sum = 0;
            for (int i = 0; i < 9; i++)
            {
                if (!char.IsDigit(isbn[i])) return false;
                sum += (isbn[i] - '0') * (10 - i);
            }

            char checkChar = isbn[9];
            int checkDigit = checkChar == 'X' ? 10 : (checkChar - '0');
            sum += checkDigit;

            return sum % 11 == 0;
        }

        private static bool ValidateISBN13(string isbn)
        {
            if (!isbn.All(char.IsDigit)) return false;

            int sum = 0;
            for (int i = 0; i < 12; i++)
            {
                int digit = isbn[i] - '0';
                sum += (i % 2 == 0) ? digit : digit * 3;
            }

            int checkDigit = isbn[12] - '0';
            int calculatedCheck = (10 - (sum % 10)) % 10;

            return checkDigit == calculatedCheck;
        }

        public override string ToString() => Value;
        public override bool Equals(object? obj) => obj is ISBN other && Value == other.Value;
        public override int GetHashCode() => Value.GetHashCode();

        public static implicit operator string(ISBN isbn) => isbn.Value;
    }
}