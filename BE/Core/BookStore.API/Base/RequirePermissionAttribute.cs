using Microsoft.AspNetCore.Authorization;

namespace BookStore.API.Base
{

    public class RequirePermissionAttribute : AuthorizeAttribute
    {
        public RequirePermissionAttribute(string permission)
        {
            Policy = permission;
        }
    }
 
}