using BookStore.Application.IService.ChatBot;
using BookStore.Application.Option;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<GeminiService> _logger;

        public GeminiService(HttpClient http, IOptions<GeminiOptions> options, ILogger<GeminiService> logger)
        {
            _http = http;
            _options = options.Value;
            _http.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
            _logger = logger;
        }
        public async Task<string> AskAsync(string prompt)
        {
            // validate Key
            if (string.IsNullOrEmpty(_options.ApiKey))
                throw new InvalidOperationException("Gemini API Key chưa được cấu hình.");

            // Build Url (API requires key as query param)
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent?key={_options.ApiKey}";

            // Build request body
            var body = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    maxOutputTokens = _options.MaxTokens
                }
            };

            // Log prompt metrics (do NOT log prompt text or API key)
            try
            {
                var promptLength = prompt?.Length ?? 0;
                var promptTokenEstimate = (int)Math.Ceiling(promptLength / 4.0);
                _logger.LogInformation("[Gemini] Sending request to {UrlMasked} | PromptLength={PromptLength} chars | PromptTokens~{PromptTokens}", MaskApiKey(url), promptLength, promptTokenEstimate);
            }
            catch { }

            // Call API
            var response = await _http.PostAsJsonAsync(url, body);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("[Gemini] Error response {Status}: {Reason}", response.StatusCode, response.ReasonPhrase);
                throw new Exception($"Gemini Error: {response.StatusCode} - {response.ReasonPhrase}");
            }

            // Parse response safely and log size
            try
            {
                var responseString = await response.Content.ReadAsStringAsync();
                var responseLength = responseString?.Length ?? 0;
                var responseTokenEstimate = (int)Math.Ceiling(responseLength / 4.0);
                _logger.LogInformation("[Gemini] Received response | Length={ResponseLength} chars | Tokens~{ResponseTokens}", responseLength, responseTokenEstimate);

                using var doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;
                if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var first = candidates[0];
                    if (first.TryGetProperty("content", out var content) && content.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0)
                    {
                        var text = parts[0].GetProperty("text").GetString() ?? string.Empty;
                        return text;
                    }
                }

                _logger.LogWarning("[Gemini] Unexpected response format — cannot find candidates/content/parts/text");
                return "Xin lỗi, tôi không thể đọc được câu trả lời từ hệ thống.";
            }
            catch (JsonException jex)
            {
                _logger.LogError(jex, "[Gemini] Failed to parse JSON response from Gemini");
                return "Xin lỗi, tôi không thể đọc được câu trả lời từ hệ thống.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Gemini] Unexpected error processing response");
                return "Xin lỗi, tôi không thể đọc được câu trả lời từ hệ thống.";
            }
        }

        private string MaskApiKey(string url)
        {
            try
            {
                if (string.IsNullOrEmpty(url)) return url;
                var idx = url.IndexOf("?key=", StringComparison.OrdinalIgnoreCase);
                if (idx < 0) return url;
                var before = url.Substring(0, idx + 5);
                var keyPart = url.Substring(idx + 5);
                if (keyPart.Length <= 6) return before + "****";
                var last4 = keyPart.Length <= 4 ? keyPart : keyPart.Substring(keyPart.Length - 4);
                return before + "****" + last4;
            }
            catch
            {
                return "(masked)";
            }
        }
    }
}