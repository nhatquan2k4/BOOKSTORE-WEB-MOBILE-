using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BookStore.Shared.Utilities
{
    public static class StringExtensions
    {
        //Trim + gom nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        public static string NormalizeSpace(this string input)
            => Regex.Replace(input?.Trim() ?? string.Empty, @"\s+", " ");
    }
}
