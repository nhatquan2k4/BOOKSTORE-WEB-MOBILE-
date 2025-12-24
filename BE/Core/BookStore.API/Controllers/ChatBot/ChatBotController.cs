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
        public ChatBotController(IChatBotService chatBotService)
        {
            _chatBotService = chatBotService;
        }

        [HttpPost("ask")]
        [AllowAnonymous]
        public async Task<IActionResult> AskAsync([FromBody] ChatBotAskRequest request)
        {
            var userId = Guid.NewGuid();
            var answer = await _chatBotService.AskAsync(userId, request.Message);
            return Ok(answer);
        }
    }
}