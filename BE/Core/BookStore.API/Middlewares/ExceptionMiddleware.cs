using BookStore.Shared.Exceptions;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace BookStore.API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        //Hàm được gọi cho mỗi HTTP Request đi qua pipeline
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context); // chuyển sang middleware/controller tiếp theo
            }
            catch (BookStore.Shared.Exceptions.ValidationException vex)
            {
                // 422 Unprocessable Entity + trả danh sách lỗi chi tiết
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = vex.StatusCode;

                var payload = new
                {
                    error = vex.Message,
                    errors = vex.Errors  // { "Title": ["không được trống"] ... }
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
            }
            catch (UserFriendlyException uex)
            {
                // Các lỗi "biết trước" có ý nghĩa nghiệp vụ
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = uex.StatusCode;

                var payload = new { error = uex.Message };
                await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
            }
            catch (Exception ex)
            {
                // Lỗi hệ thống "bất ngờ" → log chi tiết, trả message chung
                _logger.LogError(ex, "Unhandled Exception: {Message}", ex.Message);

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var payload = new { error = "Internal server error" };
                await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
            }
        }
    }
}
