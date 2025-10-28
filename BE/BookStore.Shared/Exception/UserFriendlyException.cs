using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Shared.Exceptions
{
    //Exception dùng khi muốn trả thông điệp rõ ràng, dễ hiểu cho người dùng cuối (HTTP 400/409/403)
    public class UserFriendlyException : Exception
    {
        public int StatusCode { get; }
        public UserFriendlyException(string message, int statusCode = 400) : base(message)
        {
            StatusCode = statusCode;
        }
    }
}


