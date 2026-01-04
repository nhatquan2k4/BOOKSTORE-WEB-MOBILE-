using BookStore.Application.Dtos.Shipping;
using BookStore.Application.IService.Shipping;
using BookStore.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Shipping
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShipmentsController : ControllerBase
    {
        private readonly IShipmentService _shipmentService;
        private readonly ILogger<ShipmentsController> _logger;

        public ShipmentsController(
            IShipmentService shipmentService,
            ILogger<ShipmentsController> logger)
        {
            _shipmentService = shipmentService;
            _logger = logger;
        }

        #region Query Methods

        // GET: api/shipments
        [HttpGet]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> GetAll()
        {
            var shipments = await _shipmentService.GetAllShipmentsAsync();
            return Ok(shipments);
        }

        // GET: api/shipments/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var shipment = await _shipmentService.GetShipmentByIdAsync(id);

            if (shipment == null)
                return NotFound(new { message = $"Không tìm thấy vận đơn với ID: {id}" });

            return Ok(shipment);
        }

        // GET: api/shipments/tracking/{trackingCode}
        [HttpGet("tracking/{trackingCode}")]
        public async Task<IActionResult> GetByTrackingCode(string trackingCode)
        {
            var shipment = await _shipmentService.GetShipmentByTrackingCodeAsync(trackingCode);

            if (shipment == null)
                return NotFound(new { message = $"Không tìm thấy vận đơn với mã: {trackingCode}" });

            return Ok(shipment);
        }

        // GET: api/shipments/order/{orderId}
        [HttpGet("order/{orderId:guid}")]
        public async Task<IActionResult> GetByOrderId(Guid orderId)
        {
            var shipment = await _shipmentService.GetShipmentByOrderIdAsync(orderId);

            if (shipment == null)
                return NotFound(new { message = $"Không tìm thấy vận đơn cho đơn hàng: {orderId}" });

            return Ok(shipment);
        }

        // GET: api/shipments/shipper/{shipperId}
        [HttpGet("shipper/{shipperId:guid}")]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> GetByShipperId(Guid shipperId)
        {
            var shipments = await _shipmentService.GetShipmentsByShipperIdAsync(shipperId);
            return Ok(shipments);
        }

        // GET: api/shipments/status/{status}
        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> GetByStatus(string status)
        {
            var shipments = await _shipmentService.GetShipmentsByStatusAsync(status);
            return Ok(shipments);
        }

        #endregion

        #region Create Operations

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateShipmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var shipment = await _shipmentService.CreateShipmentAsync(dto);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = shipment.Id },
                    shipment);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo vận đơn");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo vận đơn", details = ex.Message });
            }
        }

        #endregion

        #region Update Operations

        [HttpPut("{id:guid}/status")]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateShipmentStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var shipment = await _shipmentService.UpdateShipmentStatusAsync(id, dto);
                return Ok(shipment);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật trạng thái vận đơn {id}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật trạng thái", details = ex.Message });
            }
        }

        [HttpPost("{id:guid}/route")]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> AddRoutePoint(Guid id, [FromBody] CreateRoutePointDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var shipment = await _shipmentService.AddRoutePointAsync(id, dto);
                return Ok(shipment);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi thêm route point cho vận đơn {id}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi thêm route point", details = ex.Message });
            }
        }

        [HttpPut("{id:guid}/assign/{shipperId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignShipper(Guid id, Guid shipperId)
        {
            try
            {
                var shipment = await _shipmentService.AssignShipperAsync(id, shipperId);
                return Ok(shipment);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi gán shipper cho vận đơn {id}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi gán shipper", details = ex.Message });
            }
        }

        [HttpPost("{id:guid}/complete")]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> CompleteDelivery(Guid id, [FromBody] CompleteDeliveryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var shipment = await _shipmentService.CompleteDeliveryAsync(id, dto);
                return Ok(shipment);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi hoàn thành giao hàng cho vận đơn {id}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi hoàn thành giao hàng", details = ex.Message });
            }
        }

        #endregion

        #region Delete Operations

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelShipmentDto dto)
        {
            try
            {
                var result = await _shipmentService.CancelShipmentAsync(id, dto.Reason ?? "Không có lý do");

                if (!result)
                    return NotFound(new { message = $"Không tìm thấy vận đơn với ID: {id}" });

                return Ok(new { message = "Đã hủy vận đơn thành công" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi hủy vận đơn {id}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi hủy vận đơn", details = ex.Message });
            }
        }

        #endregion

        #region Webhook Operations

        [HttpPost("webhook")]
        [AllowAnonymous] // Webhook từ bên ngoài, không cần auth (sẽ verify bằng signature)
        public async Task<IActionResult> HandleWebhook([FromBody] ShipmentWebhookDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _shipmentService.HandleWebhookAsync(dto);

                if (!result)
                    return BadRequest(new { message = "Không thể xử lý webhook" });

                return Ok(new { message = "Đã xử lý webhook thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý webhook");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xử lý webhook" });
            }
        }

        #endregion
    }

    // DTO cho cancel request
    public class CancelShipmentDto
    {
        public string? Reason { get; set; }
    }
}
