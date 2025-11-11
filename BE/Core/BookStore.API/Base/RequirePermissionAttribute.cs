using Microsoft.AspNetCore.Authorization;

namespace BookStore.API.Base
{
    /// <summary>
    /// Custom Authorization Attribute để kiểm tra permission
    /// </summary>
    public class RequirePermissionAttribute : AuthorizeAttribute
    {
        public RequirePermissionAttribute(string permission)
        {
            Policy = permission;
        }
    }

    /// <summary>
    /// Ví dụ sử dụng trong Controller:
    /// 
    /// [RequirePermission(PermissionConstants.BookCreate)]
    /// public async Task<IActionResult> CreateBook([FromBody] CreateBookDto dto)
    /// {
    ///     // Only users with "Book.Create" permission can access this
    /// }
    /// 
    /// [Authorize(Roles = RoleConstants.Admin)]
    /// public async Task<IActionResult> AdminOnlyAction()
    /// {
    ///     // Only Admin role can access this
    /// }
    /// 
    /// [RequirePermission(PermissionConstants.OrderViewAll)]
    /// public async Task<IActionResult> GetAllOrders()
    /// {
    ///     // Only users with "Order.ViewAll" permission can access this
    /// }
    /// </summary>
}