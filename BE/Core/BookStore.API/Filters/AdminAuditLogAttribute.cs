using BookStore.Application.IService.Analytics;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Text.Json;

namespace BookStore.API.Filters
{
    /// <summary>
    /// Action filter to automatically log admin actions for audit purposes
    /// </summary>
    public class AdminAuditLogAttribute : ActionFilterAttribute
    {
        private readonly string _action;
        private readonly string _entityName;

        public AdminAuditLogAttribute(string action, string entityName)
        {
            _action = action;
            _entityName = entityName;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Execute action first
            var resultContext = await next();

            // Only log if action succeeded
            if (resultContext.Exception == null && resultContext.HttpContext.Response.StatusCode < 400)
            {
                try
                {
                    var auditLogService = context.HttpContext.RequestServices
                        .GetService(typeof(IAuditLogService)) as IAuditLogService;

                    if (auditLogService != null)
                    {
                        // Get admin ID from claims
                        var adminIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        if (Guid.TryParse(adminIdClaim, out var adminId))
                        {
                            // Extract entity ID from route values or action arguments
                            var entityId = ExtractEntityId(context);

                            // Get IP and User Agent
                            var ipAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString();
                            var userAgent = context.HttpContext.Request.Headers["User-Agent"].ToString();

                            // Serialize request body as new values for CREATE/UPDATE
                            string? newValues = null;
                            if (_action == "CREATE" || _action == "UPDATE")
                            {
                                var bodyArg = context.ActionArguments.Values.FirstOrDefault();
                                if (bodyArg != null)
                                {
                                    newValues = JsonSerializer.Serialize(bodyArg);
                                }
                            }

                            // Create description
                            var description = $"Admin performed {_action} on {_entityName}";
                            if (!string.IsNullOrEmpty(entityId))
                            {
                                description += $" (ID: {entityId})";
                            }

                            await auditLogService.LogActionAsync(
                                adminId,
                                _action,
                                _entityName,
                                entityId ?? "N/A",
                                description,
                                null, // Old values could be retrieved before action if needed
                                newValues,
                                ipAddress,
                                userAgent
                            );
                        }
                    }
                }
                catch
                {
                    // Don't fail the request if audit logging fails
                }
            }
        }

        private string? ExtractEntityId(ActionExecutingContext context)
        {
            // Try to get ID from route
            if (context.RouteData.Values.TryGetValue("id", out var routeId))
            {
                return routeId?.ToString();
            }

            // Try to get ID from action arguments
            if (context.ActionArguments.TryGetValue("id", out var argId))
            {
                return argId?.ToString();
            }

            // Try to get ID from first Guid argument
            var guidArg = context.ActionArguments.Values
                .FirstOrDefault(v => v is Guid);
            if (guidArg is Guid guid)
            {
                return guid.ToString();
            }

            return null;
        }
    }
}
