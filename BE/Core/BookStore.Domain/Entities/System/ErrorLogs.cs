using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.System
{
    public class ErrorLogs
    {
        public Guid Id { get; set; }

        public string Message { get; set; } = null!;            // Mô tả lỗi chính
        public string? StackTrace { get; set; }                 // Stack trace (nếu có)
        public string? Source { get; set; }                     // Nguồn gây lỗi (Service, Controller,...)
        public string? UserId { get; set; }                     // Ai đang thao tác khi xảy ra lỗi
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsResolved { get; set; } = false;           // Đã được xử lý chưa
    }
}
