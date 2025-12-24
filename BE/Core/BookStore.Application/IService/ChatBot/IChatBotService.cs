using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.IService.ChatBot
{
    public interface IChatBotService
    {
        Task<string> AskAsync(Guid userId, string message);
    }
}