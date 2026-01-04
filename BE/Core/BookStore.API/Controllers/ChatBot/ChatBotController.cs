using BookStore.Application.Dtos.ChatBot;
using BookStore.Application.IService.ChatBot;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.ChatBot
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatBotController : ControllerBase
    {
        private readonly IChatBotService _chatBotService;
        private readonly IBookDataCacheService _cacheService;

        public ChatBotController(
            IChatBotService chatBotService,
            IBookDataCacheService cacheService)
        {
            _chatBotService = chatBotService;
            _cacheService = cacheService;
        }

        [HttpPost("ask")]
        [AllowAnonymous]
        public async Task<IActionResult> AskAsync([FromBody] ChatBotAskRequest request)
        {
            var userId = Guid.NewGuid();
            var answer = await _chatBotService.AskAsync(userId, request.Message);
            return Ok(answer);
        }

        [HttpPost("cache/refresh")]
        [Authorize(Roles = "Admin")] // Chỉ admin mới được refresh cache
        public async Task<IActionResult> RefreshCacheAsync()
        {
            await _cacheService.RefreshCacheAsync();
            return Ok(new { message = "Cache refreshed successfully" });
        }

        [HttpGet("cache/status")]
        [AllowAnonymous]
        public IActionResult GetCacheStatus()
        {
            var isLoaded = _cacheService.IsCacheLoaded();
            var bookCount = isLoaded ? _cacheService.GetAllBooks().Count : 0;
            var categoryCount = isLoaded ? _cacheService.GetAllCategories().Count : 0;

            return Ok(new
            {
                isCacheLoaded = isLoaded,
                bookCount = bookCount,
                categoryCount = categoryCount
            });
        }
    }
}
