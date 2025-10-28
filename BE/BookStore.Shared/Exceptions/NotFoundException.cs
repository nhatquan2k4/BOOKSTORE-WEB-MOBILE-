using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Shared.Exceptions
{
    // ném ra khi không tìm thấy tài nguyên (HTTP 404)
    public class NotFoundException : UserFriendlyException
    {
        public NotFoundException(string message)
            : base(message)
        {
        }
    }
}
