using BookStore.Application.Dtos.Shipping;
using BookStore.Application.IService.Shipping;
using BookStore.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Shipping
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Only admin can manage shippers
    public class ShippersController : ControllerBase
    {
        private readonly IShipperService _shipperService;

        public ShippersController(IShipperService shipperService)
        {
            _shipperService = shipperService;
        }

        // GET: api/shippers
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var shippers = await _shipperService.GetAllShippersAsync();
            return Ok(shippers);
        }

        // GET: api/shippers/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveShippers()
        {
            var shippers = await _shipperService.GetActiveShippersAsync();
            return Ok(shippers);
        }


        // GET: api/shippers/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var shipper = await _shipperService.GetShipperByIdAsync(id);

            if (shipper == null)
                return NotFound(new { message = $"Không tìm thấy shipper với ID: {id}" });

            return Ok(shipper);
        }

        // GET: api/shippers/{id}/detail
        [HttpGet("{id:guid}/detail")]
        public async Task<IActionResult> GetDetailById(Guid id)
        {
            var shipper = await _shipperService.GetShipperDetailByIdAsync(id);

            if (shipper == null)
                return NotFound(new { message = $"Không tìm thấy shipper với ID: {id}" });

            return Ok(shipper);
        }

        // POST: api/shippers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateShipperDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var shipper = await _shipperService.CreateShipperAsync(dto);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = shipper.Id },
                    shipper);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo shipper", details = ex.Message });
            }
        }

        // PUT: api/shippers/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateShipperDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var shipper = await _shipperService.UpdateShipperAsync(id, dto);
                return Ok(shipper);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật shipper", details = ex.Message });
            }
        }

        // DELETE: api/shippers/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _shipperService.DeleteShipperAsync(id);

                if (!result)
                    return NotFound(new { message = $"Không tìm thấy shipper với ID: {id}" });

                return Ok(new { message = "Đã xóa shipper thành công" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa shipper", details = ex.Message });
            }
        }

        // POST: api/shippers/{id}/activate
        [HttpPost("{id:guid}/activate")]
        public async Task<IActionResult> Activate(Guid id)
        {
            var result = await _shipperService.ActivateShipperAsync(id);

            if (!result)
                return NotFound(new { message = $"Không tìm thấy shipper với ID: {id}" });

            return Ok(new { message = "Đã kích hoạt shipper thành công" });
        }

        // POST: api/shippers/{id}/deactivate
        [HttpPost("{id:guid}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var result = await _shipperService.DeactivateShipperAsync(id);

            if (!result)
                return NotFound(new { message = $"Không tìm thấy shipper với ID: {id}" });

            return Ok(new { message = "Đã vô hiệu hóa shipper thành công" });
        }

        // GET: api/shippers/{id}/shipments/count
        [HttpGet("{id:guid}/shipments/count")]
        public async Task<IActionResult> GetShipmentCount(Guid id)
        {
            var count = await _shipperService.GetShipmentCountAsync(id);
            return Ok(new { shipperId = id, shipmentCount = count });
        }
    }
}
