using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Text.Json.Serialization; // QUAN TRỌNG: Để map đúng tên trường JSON
using BookStore.Application.IService.Ordering;
using System.Linq;

namespace BookStore.API.Controllers.Payment
{
    [Route("api/sepay")]
    [ApiController]
    public class SePayController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public SePayController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook([FromBody] SePayWebhookModel model)
        {
            // --- LOGGING ---
            Console.WriteLine("------------------------------------------------");
            Console.WriteLine($"[SePay Webhook] START PROCESSING");
            Console.WriteLine($"Raw Content: {model.Content}");
            Console.WriteLine($"Amount: {model.TransferAmount}");
            Console.WriteLine($"Account: {model.AccountNumber}");
            
            try 
            {
                // 1. Kiểm tra dữ liệu đầu vào
                if (model == null)
                {
                    Console.WriteLine("[SePay Error] Model is NULL (Binding failed)");
                    return BadRequest("Invalid Payload");
                }

                string content = model.Content?.ToUpper() ?? "";
                string orderId = "";

                // 2. Logic bóc tách OrderID (Ưu tiên Regex UUID)
                var uuidRegex = new Regex(@"[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}");
                var match = uuidRegex.Match(content);
                
                if (match.Success)
                {
                    orderId = match.Value;
                    Console.WriteLine($"[SePay Logic] Found UUID: {orderId}");
                }
                else 
                {
                    // Fallback: Tìm theo từ khóa MUA / THUE
                    if (content.Contains("MUA"))
                    {
                        var parts = content.Split(new[] { "MUA" }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length > 1) orderId = parts[1].Trim().Split(new[] { ' ', '.', ',' }, StringSplitOptions.RemoveEmptyEntries)[0];
                    }
                    else if (content.Contains("THUE"))
                    {
                        var parts = content.Split(new[] { "THUE" }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length > 1) orderId = parts[1].Trim().Split(new[] { ' ', '.', ',' }, StringSplitOptions.RemoveEmptyEntries)[0];
                    }
                    
                    // Fallback cuối cùng: Nếu content chính là OrderNumber
                    if (string.IsNullOrEmpty(orderId) && content.StartsWith("ORD-"))
                    {
                        orderId = content.Trim();
                    }
                    
                    Console.WriteLine($"[SePay Logic] Parsed Keyword: {orderId}");
                }

                // 3. Gọi Service xử lý
                if (!string.IsNullOrEmpty(orderId))
                {
                    await _orderService.ConfirmPaymentAsync(orderId, model.TransferAmount);
                    Console.WriteLine($"[SePay Logic] SUCCESS: Updated Order {orderId}");
                    return Ok(new { success = true });
                }
                else
                {
                    Console.WriteLine($"[SePay Error] Cannot find OrderId in content.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SePay Exception]: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                // Vẫn trả về OK để SePay không retry liên tục gây spam log
                return Ok(new { success = false, error = ex.Message });
            }

            return Ok(new { success = false });
        }
    }

    // --- MODEL ĐÃ SỬA: Thêm JsonPropertyName để tránh lỗi 400 Bad Request ---
    public class SePayWebhookModel 
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("gateway")]
        public string? Gateway { get; set; }

        [JsonPropertyName("transactionDate")]
        public string? TransactionDate { get; set; }

        [JsonPropertyName("accountNumber")]
        public string? AccountNumber { get; set; }

        [JsonPropertyName("subAccount")]
        public string? SubAccount { get; set; }

        [JsonPropertyName("content")]
        public string? Content { get; set; } 

        [JsonPropertyName("transferType")]
        public string? TransferType { get; set; }

        [JsonPropertyName("transferAmount")]
        public decimal TransferAmount { get; set; } 

        [JsonPropertyName("accumulated")]
        public decimal Accumulated { get; set; }

        [JsonPropertyName("referenceCode")]
        public string? ReferenceCode { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }
}