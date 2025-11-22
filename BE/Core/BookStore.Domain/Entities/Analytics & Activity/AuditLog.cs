using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Analytics___Activity
{
    /// <summary>
    /// Audit Log entity for tracking admin actions
    /// </summary>
    public class AuditLog
    {
        public Guid Id { get; set; }

        // Admin who performed the action
        public Guid AdminId { get; set; }
        
        // Action type: CREATE, UPDATE, DELETE, LOGIN, CHANGE_STATUS, etc.
        public string Action { get; set; } = null!;
        
        // Entity being affected: Book, Order, Coupon, etc.
        public string EntityName { get; set; } = null!;
        
        // ID of the affected record
        public string EntityId { get; set; } = null!;
        
        // Short description: "Update price from 100k to 80k"
        public string? Description { get; set; }
        
        // JSON of old values (for UPDATE operations)
        public string? OldValues { get; set; }
        
        // JSON of new values (for CREATE/UPDATE operations)
        public string? NewValues { get; set; }
        
        // Timestamp
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // IP Address of the admin
        public string? IpAddress { get; set; }
        
        // User Agent (browser/client info)
        public string? UserAgent { get; set; }
    }

}
