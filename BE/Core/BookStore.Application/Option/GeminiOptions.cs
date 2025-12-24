using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Option
{
    public class GeminiOptions
    {
        public bool Enabled { get; set; }
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "gemini-2.5-flash";
        public int MaxTokens { get; set; } = 500;
        public int TimeoutSeconds { get; set; } = 30;
    }
}