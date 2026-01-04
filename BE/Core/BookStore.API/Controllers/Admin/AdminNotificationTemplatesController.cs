using BookStore.API.Base;
using BookStore.Application.DTOs.System.NotificationTemplate;
using BookStore.Application.IService.System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/notification-templates")]
    [Authorize(Roles = "Admin")]
    public class AdminNotificationTemplatesController : ApiControllerBase
    {
        private readonly INotificationTemplateService _templateService;
        private readonly ILogger<AdminNotificationTemplatesController> _logger;

        public AdminNotificationTemplatesController(
            INotificationTemplateService templateService,
            ILogger<AdminNotificationTemplatesController> logger)
        {
            _templateService = templateService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetTemplates(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? code = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] string? searchTerm = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var (templates, totalCount) = await _templateService.GetTemplatesAsync(
                    page, pageSize, code, isActive, searchTerm);

                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        Templates = templates,
                        Pagination = new
                        {
                            Page = page,
                            PageSize = pageSize,
                            TotalCount = totalCount,
                            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification templates");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving templates",
                    Error = ex.Message
                });
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetTemplateById(Guid id)
        {
            try
            {
                var template = await _templateService.GetTemplateByIdAsync(id);

                if (template == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Template not found"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = template
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template {TemplateId}", id);
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving the template",
                    Error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateNotificationTemplateDto dto)
        {
            try
            {
                var template = await _templateService.CreateTemplateAsync(dto);

                return CreatedAtAction(
                    nameof(GetTemplateById),
                    new { id = template.Id },
                    new
                    {
                        Success = true,
                        Message = "Template created successfully",
                        Data = template
                    });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification template");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while creating the template",
                    Error = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] UpdateNotificationTemplateDto dto)
        {
            try
            {
                var template = await _templateService.UpdateTemplateAsync(id, dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Template updated successfully",
                    Data = template
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating template {TemplateId}", id);
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while updating the template",
                    Error = ex.Message
                });
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(Guid id)
        {
            try
            {
                await _templateService.DeleteTemplateAsync(id);

                return Ok(new
                {
                    Success = true,
                    Message = "Template deleted successfully"
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting template {TemplateId}", id);
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while deleting the template",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("by-code/{code}")]
        public async Task<IActionResult> GetTemplateByCode(string code)
        {
            try
            {
                var template = await _templateService.GetTemplateByCodeAsync(code);

                if (template == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Template not found"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = template
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template by code {Code}", code);
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving the template",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveTemplates()
        {
            try
            {
                var templates = await _templateService.GetActiveTemplatesAsync();

                return Ok(new
                {
                    Success = true,
                    Data = templates
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active templates");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving active templates",
                    Error = ex.Message
                });
            }
        }
    }
}
