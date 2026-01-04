using BookStore.Application.DTO.Analytics;
using BookStore.Application.IService.Analytics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IAuditLogService _auditLogService;

        public AdminDashboardController(
            IDashboardService dashboardService,
            IAuditLogService auditLogService)
        {
            _dashboardService = dashboardService;
            _auditLogService = auditLogService;
        }

        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueDto>> GetRevenue(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
            var toDate = to ?? DateTime.UtcNow;

            var result = await _dashboardService.GetRevenueAsync(fromDate, toDate);
            return Ok(result);
        }

        [HttpGet("top-selling-books")]
        public async Task<ActionResult<List<TopSellingBookDto>>> GetTopSellingBooks(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int top = 10)
        {
            var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
            var toDate = to ?? DateTime.UtcNow;

            var result = await _dashboardService.GetTopSellingBooksAsync(fromDate, toDate, top);
            return Ok(result);
        }

        [HttpGet("book-views")]
        public async Task<ActionResult<List<TopViewedBookDto>>> GetTopViewedBooks(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int top = 10)
        {
            var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
            var toDate = to ?? DateTime.UtcNow;

            var result = await _dashboardService.GetTopViewedBooksAsync(fromDate, toDate, top);
            return Ok(result);
        }


        [HttpGet("order-stats")]
        public async Task<ActionResult<OrderStatsDto>> GetOrderStats(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
            var toDate = to ?? DateTime.UtcNow;

            var result = await _dashboardService.GetOrderStatsAsync(fromDate, toDate);
            return Ok(result);
        }


        [HttpGet("audit-logs")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyAuditLogs(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var adminId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
            var logs = await _auditLogService.GetAdminLogsAsync(adminId, pageNumber, pageSize);
            return Ok(logs);
        }
    }
}
