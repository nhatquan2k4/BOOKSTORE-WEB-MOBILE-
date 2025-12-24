using BookStore.Application.IService.ChatBot;
using BookStore.Application.Option;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BookStore.Application.Services.ChatBot
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _http;
        private readonly GeminiOptions _options;
        public GeminiService(HttpClient http, IOptions<GeminiOptions> options)
        {
            _http = http;
            _options = options.Value;
            _http.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
        }

        public async Task<string> AskAsync(string prompt)
        {
            // validate Key
            if (string.IsNullOrEmpty(_options.ApiKey))
                throw new InvalidOperationException("Gemini API Key chưa được cấu hình.");

            //Build Url
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent?key={_options.ApiKey}";

            //build Body
            var body = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    maxOutputTokens = _options.MaxTokens // Config độ dài câu trả lời
                }
            };

            //Call API
            var response = await _http.PostAsJsonAsync(url, body);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                // Log errorContent ra file log ở đây nếu cần
                throw new Exception($"Gemini Error: {response.StatusCode} - {errorContent}");
            }

            //Parse Result
            try
            {
                var json = await response.Content.ReadFromJsonAsync<JsonElement>();
                return json
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString()!;
            }
            catch
            {
                return "Xin lỗi, tôi không thể đọc được câu trả lời từ hệ thống.";
            }

        }
    }
}