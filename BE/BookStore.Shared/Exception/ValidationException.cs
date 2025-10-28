using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Shared.Exceptions
{
    // Ném ra khi dữ liệu không hợp lệ ở mức "Vi phạm ràng buộc nghiệp vụ" (HTTP 422)
    public class ValidationException : UserFriendlyException
    {
        public IDictionary<string, string[]> Errors { get; }

        public ValidationException(IDictionary<string, string[]> errors) : base("Dữ liệu không hợp lệ.", 422)
        {
            Errors = errors;
        }
    }
}
